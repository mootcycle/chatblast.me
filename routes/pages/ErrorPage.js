const MESSAGES = {
  TEAM_NOT_ALLOWED: 'Sorry, your Slack team is not approved to use this app.',
  DEFAULT: 'Sorry, some kind of error occurred.',
};

/**
 * This route displays the "nice" error page. Users can be redirected here to
 * show a pretty error message.
 **/
class ErrorPage extends require('./Page').Route {
  /**
   * Generates the page object for Hapi.
   * @param {Hapi.Server} server The Hapi server object.
   * @param {Object} deps The dependency object.
   */
  constructor(server, deps) {
    super(server, deps);

    this.method = 'GET';
    this.path = '/error';

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
    reply.view('error',
        {message: MESSAGES[request.query.message] || MESSAGES.DEFAULT});
  }
}

exports.Route = ErrorPage;
