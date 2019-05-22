const Code = require('code');
const debugMode = process.argv.indexOf('--debug') != -1;

const repeat = (repititions, callback) => {
  for (let i = 0; i < repititions; i++) {
    callback();
  }
};

exports.get = (lab) => {
  const shortcuts = {
    describe: lab.describe,
    it: lab.it,
    expect: Code.expect,
    before: lab.before,
    beforeEach: lab.beforeEach,
    after: lab.after,
    afterEach: lab.afterEach,
    log: console.log,
    repeat: repeat,
  };

  if (debugMode) {
    shortcuts.it = () => {};
    shortcuts.fit = lab.it;
  }

  return shortcuts;
};

if (debugMode) {
  process.on('unhandledRejection', function(reason, promise) {
    console.log(promise);
  });
}
