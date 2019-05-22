/**
 * Minimally mocks out the logging object by redirecting calls to console.log.
 */
class LoggerMock {
  /**
   * constructor
   * @param {Boolean} noisy If true, call console.log for each log message.
   *     Otherwise, only add log messages to an array.
   */
  constructor(noisy) {
    ['info', 'error', 'debug'].forEach((func) => {
      this[func] = noisy ? this.loud : this.silent;
    });

    this.messages = [];
  }

  /**
   * Logs a message, adds it to the log array, and outputs it with console.log.
   * @param {*} msg The log message.
   */
  loud(msg) {
    console.log(msg);
    this.messages.push(msg);
  }

  /**
   * Logs a message and adds it to the log array.
   * @param {*} msg The log message.
   */
  silent(msg) {
    this.messages.push(msg);
  }
}

exports.LoggerMock = LoggerMock;
