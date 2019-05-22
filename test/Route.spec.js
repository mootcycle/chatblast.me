const GenericMock = require('./mocks/GenericMock').GenericMock;
const LoggerMock = require('./mocks/LoggerMock').LoggerMock;
const ServerMock = require('./mocks/ServerMock').ServerMock;
const SlackApiMock = require('./mocks/SlackApiMock').SlackApiMock;
const Route = require('../routes/Route').Route;
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const t = require('./shortcuts').get(lab);

t.describe('Route', () => {
  let route; let server; let deps; let slackApi;

  t.beforeEach((done) => {
    server = new ServerMock();
    slackApi = new SlackApiMock();

    deps = {
      config: {
        slack: {
          client_id: 'foo',
          client_secret: 'bar',
        },
        authUrl: 'http://example.com/auth',
      },
      slackApi: slackApi,
      logger: new LoggerMock(),
    };

    done();
  });

  t.it('registers a route', (done) => {
    route = new Route(server, deps);
    route.path = '/commands/somecommand';
    route.method = 'GET';
    route.handler = () => {};

    route.__server = new GenericMock();
    route.__server.addDirectResponse('route');

    route.route();

    const args = route.__server.getMockCalls()[0].arguments;

    t.expect(args[0].method).to.equal('GET');
    t.expect(args[0].path).to.equal('/commands/somecommand');

    done();
  });

  t.it('escapes text correctly', (done) => {
    route = new Route(server, deps);

    t.expect(route.escapeUserText('Hello < < & & > >'))
        .to.equal('Hello &lt; &lt; &amp; &amp; &gt; &gt;');
    done();
  });

  t.it('unescapes text correctly', (done) => {
    route = new Route(server, deps);

    t.expect(route.unescapeUserText('Hello &lt; &lt; &amp; &amp; &gt; &gt;'))
        .to.equal('Hello < < & & > >');
    done();
  });

  t.it('logs a route', (done) => {
    let replyCalled;
    route = new Route(server, deps);

    const request = {
      payload: {
        team_domain: 'testdomain.com',
        user_name: 'testuser',
        command: '/test',
        text: 'test text',
      },
    };
    const reply = () => {
      replyCalled = true;
    };

    route.logRoute(request, reply);

    t.expect(replyCalled).to.equal(true);
    t.expect(deps.logger.messages[0].message)
        .to.equal('testdomain.com - testuser: /test test text');
    done();
  });
});


