const _ = require('lodash');
const assert = require('assert');

/**
 * The responses class handles all interactive message response requests made to
 * the app. Other routes which require interactive buttons need to register
 * themselves with a callback_id in order to recieve user response requests.
 * Slack documentation on interactive messages is here:
 * https://api.slack.com/docs/message-buttons
 **/
class Responses extends require('./Route').Route {
  /**
   * Generates the command object for Hapi.
   * @param {Hapi.Server} server The Hapi server object.
   * @param {Object} deps The dependency object.
   */
  constructor(server, deps) {
    super(server, deps);

    this.method = 'POST';
    this.path = '/responses';
    this.__routes = {};

    this.route({
      method: this.method,
      path: this.path,
      handler: this.handler.bind(this),
    });
  }

  /**
   * Registers a callback id to recieve response requests.
   * @param {String} callbackId The callback id to be registered.
   * @param {Route} route The route which will recieve response requests.
   **/
  register(callbackId, route) {
    this.__routes[callbackId] = route;
  }

  /**
   * Overrides the Route class method to provide response-specific log messages.
   * Incoming requests are authenticated against the slack response token in the
   * server config file.
   * @param {Request} request The Hapi request object.
   * @param {Function} reply The Hapi reply function.
   * @return {void}
   **/
  logRoute(request, reply) {
    let p;
    try {
      p = request.payload = JSON.parse(request.payload.payload);
      assert(p.callback_id, 'Callback id is required.');
      assert(p.token == this.config.slack.response_token,
          'Slack verification token does not match.');
      // Redact the token from the logs.
      delete(p.token);
    } catch (err) {
      return this.routeError(new Error('Responses JSON parse error.'), reply);
    }

    let message;
    try {
      message = `${p.team.domain} - ${p.user.name}: responses/${p.callback_id} - ${p.actions[0].value}`; // eslint-disable-line max-len
    } catch (err) {
      message = undefined;
    }

    this.logger.info({
      message: message || request.url.path,
      payload: _.pick(request.payload, [
        'actions',
        'callback_id',
        'team',
        'channel',
        'user',
        'action_ts',
        'message_ts',
        'attachment_id',
        'original_message',
      ])});
    return reply();
  }

  /**
   * The Hapi handler function which is called from Slack when a user clicks an
   * interactive button. This is accomplished by handing the response off to the
   * responseHandler function on the registered route.
   * @param {Request} request The Hapi request object.
   * @param {Function} reply The Hapi reply function.
   **/
  handler(request, reply) {
    const p = request.payload;

    const route = this.__routes[p.callback_id];

    if (route) {
      route.responseHandler.call(route, request, reply);
    } else {
      this.routeError(
          new Error('Response handler not found: ' + p.callback_id), reply);
    }
  }
}

exports.Route = Responses;
