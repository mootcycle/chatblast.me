const LoggerMock = require('./mocks/LoggerMock').LoggerMock;
const ServerMock = require('./mocks/ServerMock').ServerMock;
const SlackApiMock = require('./mocks/SlackApiMock').SlackApiMock;
const UserRoute = require('../routes/UserRoute').Route;
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const t = require('./shortcuts').get(lab);

t.describe('UserRoute', () => {
  let route; let server; let deps; let slackApi; let request;

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

    request = {
      payload: {
        user_id: 'test-user',
        text: 'testing one two',
        channel_id: 'test-channel',
      },
    };

    const clients = slackApi.getAuthenticatedClientPair('T10101', 'U10101');
    client = clients.userClient;

    done();
  });

  t.it('handles missing client data', (done) => {
    let replyObj;
    slackApi.clearTestClients();
    route = new UserRoute(server, deps);
    route.handler = function(request, reply) {
      try {
        this.getClients(request);
      } catch (err) {
        this.routeError(err, reply);
      }
    };
    route.path = '/commands/somecommand';

    const reply = (obj) => {
      replyObj = obj;
    };

    route.handler(request, reply);

    setTimeout(() => {
      t.expect(replyObj.output.statusCode).to.equal(500);
      t.expect(deps.logger.messages[0].error.message)
          .to.equal('missing_tokens');
      done();
    });
  });

  t.describe('slack errors', () => {
    t.beforeEach((done) => {
      route = new UserRoute(server, deps);
      route.path = '/commands/somecommand';
      done();
    });

    t.it('logs a slack error', (done) => {
      route.handler = async function(request, reply) {
        try {
          const client = this.getClients(request).userClient;
          client.addPromiseThrow('chat.postMessage', {
            ok: false,
            error: 'something bad',
          });

          await client.chat.postMessage({});
        } catch (err) {
          this.routeError(err, reply);
        }
      };

      let errorCalled;

      const reply = (err) => {
        errorCalled = err;
      };

      route.handler(request, reply);

      setTimeout(() => {
        t.expect(errorCalled.output.statusCode).to.equal(500);
        t.expect(deps.logger.messages[0].error.error).to.equal('something bad');
        done();
      });
    });
  });
});


