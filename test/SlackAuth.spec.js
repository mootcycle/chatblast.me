const Lab = require('lab');
const LoggerMock = require('./mocks/LoggerMock').LoggerMock;
const ServerMock = require('./mocks/ServerMock').ServerMock;
const SlackApiMock = require('./mocks/SlackApiMock').SlackApiMock;
const SlackAuth = require('../routes/pages/SlackAuth').Route;
const lab = exports.lab = Lab.script();
const t = require('./shortcuts').get(lab);

t.describe('slack auth', () => {
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
      },
      slackApi: slackApi,
      logger: new LoggerMock(),
    };

    route = new SlackAuth(server, deps);

    done();
  });

  t.it('handles authentication success correctly', (done) => {
    let setCalled; let redirectCalled;

    slackApi.getUnauthenticatedClient().addPromiseResponse('oauth.access', {
      user_id: 'U10101',
      team_id: 'T10101',
      team_name: 'myTestTeam',
      access_token: 'xoxt-10101',
      scope: 'botstuff,chat:stuff:permission',
      bot: {
        bot_user_id: 'B10101',
        bot_access_token: 'xoxb-10101',
      },
    });

    const yar = {set: () => setCalled = true};
    const request = {query: {code: 'xoxp-test'}, yar: yar};
    const reply = {redirect: () => redirectCalled = true};

    route.handler(request, reply);

    setTimeout(() => {
      t.expect(setCalled).to.equal(true);
      t.expect(redirectCalled).to.equal(true);
      done();
    });
  });

  t.it('handles authentication failure correctly', (done) => {
    let errorPath;

    slackApi.getUnauthenticatedClient()
        .addPromiseThrow('oauth.access', 'auth call failure');

    const request = {query: {code: 'xoxp-test'}};
    const reply = () => {};
    reply.redirect = (path) => {
      errorPath = path;
    };

    route.handler(request, reply);

    setTimeout(() => {
      t.expect(errorPath).to.equal('/error');
      done();
    });
  });
});


