const Constants = require('../../Constants').Constants;

/**
 * This route logs out of the web presense by deleting the browser auth cookie.
 **/
class Logout extends require('./Page').Route {
  /**
   * Generates the page object for Hapi.
   * @param {Hapi.Server} server The Hapi server object.
   * @param {Object} deps The dependency object.
   */
  constructor(server, deps) {
    super(server, deps);

    this.method = 'GET';
    this.path = '/logout';
    this.route({
      method: this.method,
      path: this.path,
      handler: this.handler.bind(this),
    });
  }

  /**
   * The route function called when this REST endpoint is called.
   * @param {Request} request The Hapi request object.
   * @param {Function} reply The Hapi reply function.
   **/
  handler(request, reply) {
    request.yar.set(Constants.YAR_USER_DATA_KEY, undefined);
    reply.redirect('/');
  }
}

exports.Route = Logout;
