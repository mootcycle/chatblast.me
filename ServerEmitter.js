
const EventEmitter = require('events');

/**
 * A wrapper class around the node EventEmitter.
 **/
class ServerEmitter extends EventEmitter {
  /**
   * Wraps EventEmitter.
   * @param {Object} deps The dependency object.
   */
  constructor(deps) {
    super();
    this.constants = deps.constants;
    this.logger = deps.logger;
  }

  /**
   * Verifies that the event name has been registered as a constant.
   * @param {String} eventName The event name.
   **/
  __verifyEventName(eventName) {
    if (!this.constants.EVENTS[eventName.toUpperCase()]) {
      throw new Error(`Events must be declared as a constant.`);
    }
  }

  /**
   * Wrapper function around EventEmitter.on().
   * @param {String} eventName The event name.
   * @param {Function} listener The event function.
   * @return {*}
   **/
  on(eventName, listener) {
    this.__verifyEventName(eventName);
    return super.on(eventName, listener);
  }

  /**
   * Wrapper function around EventEmitter.once().
   * @param {String} eventName The event name.
   * @param {Function} listener The event function.
   * @return {*}
   **/
  once(eventName, listener) {
    this.__verifyEventName(eventName);
    return super.once(eventName, listener);
  }
}

exports.ServerEmitter = ServerEmitter;
