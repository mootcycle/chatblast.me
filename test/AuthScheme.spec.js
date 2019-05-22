const AuthScheme = require('../AuthScheme');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const t = require('./shortcuts').get(lab);

t.describe('AuthScheme', () => {
  let scheme; let request; let reply; let continueCalled; let redirectCalled;

  t.beforeEach((done) => {
    const plugin = {
      auth: {
        scheme: (name, implementation) => {
          // Hacky way to get the hapi auth scheme instantiated.
          scheme = implementation({}, {key: 'testKey'});
        },
      },
    };

    AuthScheme.register(plugin, {}, () => {});

    continueCalled = false;
    redirectCalled = false;

    reply = {
      continue: () => {
        continueCalled = true;
      },
      redirect: () => {
        redirectCalled = true;
      },
    };
    done();
  });

  t.it('rejects clients without login data', (done) => {
    request = {
      yar: {
        get: () => {
          return undefined;
        },
      },
    };

    scheme.authenticate(request, reply);

    t.expect(redirectCalled).to.equal(true);
    t.expect(continueCalled).to.equal(false);
    done();
  });

  t.it('allows clients with login data', (done) => {
    request = {
      yar: {
        get: () => {
          return {loginData: true};
        },
      },
    };

    scheme.authenticate(request, reply);

    t.expect(redirectCalled).to.equal(false);
    t.expect(continueCalled).to.equal(true);
    done();
  });
});
