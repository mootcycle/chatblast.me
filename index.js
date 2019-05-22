const AuthScheme = require('./AuthScheme');
const config = require('./readConfig').config;
const Constants = require('./Constants').Constants;
const Handlebars = require('handlebars');
const Hapi = require('hapi');
const Hoek = require('hoek');
const Inert = require('inert');
const Responses = require('./routes/Responses').Route;
const routeRegistry = require('./routes/registry');
const SlackApi = require('./SlackApi').SlackApi;
const SlackClient = require('@slack/client');
const Vision = require('vision');
const Winston = require('winston');
const Yar = require('yar');

const server = new Hapi.Server();
const debugMode = process.argv.indexOf('--debug') != -1;
if (debugMode) {
  config.debugMode = true;
}


// Logging setup
Winston.remove(Winston.transports.Console);
Winston.add(Winston.transports.Console, {
  level: 'debug',
});
Winston.add(Winston.transports.File, {
  filename: config.logPath,
  level: debugMode ? 'debug' : 'info',
});

// Dependency setup
const deps = {
  config: config,
  constants: Constants,
  logger: Winston,
  slackClient: SlackClient,
};
deps.slackApi = new SlackApi(deps);


// Server setup
server.connection({port: config.port});

server.register(AuthScheme, (err) => {
  Hoek.assert(!err, err);
  server.auth.strategy('chatblast.me', 'chatblast.me', {
    key: Constants.YAR_USER_DATA_KEY,
    logger: Winston,
  });
});

server.register(Inert, (err) => Hoek.assert(!err, err));
server.register(Vision, (err) => {
  Hoek.assert(!err, err);

  server.views({
    engines: {html: Handlebars},
    path: __dirname + '/templates',
    partialsPath: __dirname + '/templates/partials',
  });
});

server.register({
  register: Yar,
  options: {
    storeBlank: false,
    cookieOptions: {
      password: config.yarPassword,
      isSecure: !debugMode,
    },
  },
}, function(err) {
  Hoek.assert(!err, err);
});

server.start((err) => {
  Hoek.assert(!err, err);

  // The responses handler is special; Other routes need to register with it.
  deps.responses = new Responses(server, deps);
  routeRegistry.inject(server, deps);

  Winston.info('\n\n\n\nServer running: http://localhost:' + config.port + '/');
});
