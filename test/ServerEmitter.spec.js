const Lab = require('lab');
const LoggerMock = require('./mocks/LoggerMock').LoggerMock;
const ServerEmitter = require('../ServerEmitter').ServerEmitter;
const lab = exports.lab = Lab.script();
const t = require('./shortcuts').get(lab);

t.describe('ServerEmitter', () => {
  let constants; let serverEmitter; let deps;

  t.beforeEach((done) => {
    constants = {
      EVENTS: {
        TEST_EVENT: 'test_event',
      },
    };

    deps = {
      config: {},
      logger: new LoggerMock(),
      constants: constants,
    };

    serverEmitter = new ServerEmitter(deps);

    done();
  });

  t.it('registers events and fires them', (done) => {
    let fired = false;
    const testEvent = () => {
      fired = true;
    };
    serverEmitter.on(constants.EVENTS.TEST_EVENT, testEvent);

    setTimeout(() => {
      serverEmitter.emit(constants.EVENTS.TEST_EVENT);
    }, 0);

    setTimeout(() => {
      t.expect(fired).to.equal(true);
      done();
    }, 10);
  });

  t.it('errors on unknown events', (done) => {
    let caught = false;
    const testEvent = () => {};

    try {
      serverEmitter.on('unknown', testEvent);
    } catch (err) {
      caught = err;
    }

    t.expect(caught.message).to.equal('Events must be declared as a constant.');
    done();
  });
});


