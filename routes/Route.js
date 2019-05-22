const _ = require('lodash');
const assert = require('assert');
const Boom = require('boom');

/**
 * The route class serves as the base class for all registered routes. It
 * contains the basic logging code, a generic error handler, and some helper
 * functions. It is an abstract class that shouldn't be directly instantiated
 * except for testing.
 **/
class Route {
  /**
   * Injects the required dependencies.
   * @param {Hapi.Server} server The Hapi server object. Used as a reference
   *     to register the route after construction.
   * @param {Object} deps The dependencies object. Contains references to the
   *     required dependencies which are assigned to local properties on the
   *     Route object.
   **/
  constructor(server, deps) {
    this.__server = server;
    this.config = deps.config;
    this.logger = deps.logger;
    this.slackApi = deps.slackApi;
    this.constants = deps.constants;
    this.emitter = deps.emitter;
  }

  /**
   * The route function is called by child classes to register the constructed
   * route with the Hapi server.
   * @param {Object} options The route configuration object. Child classes
   *     must define the required properties (method, path, handler) before
   *     invoking this function. See full documentation here:
   *     https://hapijs.com/api#route-options
   **/
  route(options) {
    const obj = _.defaultsDeep(options || {}, {
      method: assert(this.method) || this.method,
      path: assert(this.path) || this.path,
      handler: assert(this.handler) || this.handler,
      config: {
        auth: this.auth,
        pre: [],
      },
    });

    obj.config.pre.push(this.logRoute.bind(this));

    this.__server.route(obj);
  }

  /**
   * The route function is called by child classes to register the constructed
   * route with the Hapi server.
   * @param {Request} request The Hapi request object.
   * @param {Function} reply The Hapi reply function.
   * @return {void}
   **/
  logRoute(request, reply) {
    const p = request.payload;
    let message;
    if (p && p.team_domain && p.user_name && p.command) {
      message = `${p.team_domain} - ${p.user_name}: ${p.command} ${p.text || ''}`; // eslint-disable-line max-len
    }

    this.logger.info({
      message: message || request.url.pathname,
      payload: _.pick(request.payload, [
        'channel_id',
        'channel_name',
        'command',
        'level',
        'message',
        'payload',
        'team_domain',
        'team_id',
        'text',
        'user_id',
        'user_name',
      ])});
    return reply();
  }

  /**
   * The generic error handler. When something fails in a child route, it can be
   * punted here for some logging.
   * @param {Error} err The error object.
   * @param {Function} reply The Hapi reply function to respond to the request.
   **/
  routeError(err, reply) {
    this.logError(err);
    reply(Boom.badImplementation());
  }

  /**
   * The generic error logger.
   * @param {Error} err The error object.
   **/
  logError(err) {
    this.logger.error({
      message: `Error at '${this.path}' handler: ${err}`,
      error: err,
      stack: err.stack,
    });
  }

  /**
   * Helper function to escape user text. See:
   * https://api.slack.com/docs/message-formatting#how_to_escape_characters
   * @param {String} str The text to be escaped.
   * @return {string} The escaped text.
   **/
  escapeUserText(str) {
    return str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
  }

  /**
   * Helper function to unescape user text. See:
   * https://api.slack.com/docs/message-formatting#how_to_escape_characters
   * @param {String} str The text to be unescaped.
   * @return {string} The unescaped text.
   **/
  unescapeUserText(str) {
    return str.replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
  }
}

exports.Route = Route;
