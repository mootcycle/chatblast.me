/**
 * This route serves the root page for the web server. There's a logged out/
 * logged in state and a "secret" admin install which grants additional scope
 * permissions to the app. Only one admin per team needs to have the admin
 * scopes as Slack bot users can use a superset of the user scopes they have
 * been granted.
 **/
class Index extends require('./Page').Route {
  /**
   * Generates the page object for Hapi.
   * @param {Hapi.Server} server The Hapi server object.
   * @param {Object} deps The dependency object.
   */
  constructor(server, deps) {
    super(server, deps);

    this.method = 'GET';
    this.path = '/';

    this.route({
      method: this.method,
      path: this.path,
      handler: this.handler.bind(this),
    });

    this.pageData.title = 'chatblast.me';
    this.pageData.clientId = this.config.slack.client_id;
  }

  /**
   * The route function called when this REST endpoint is called.
   * @param {Request} request The Hapi request object.
   * @param {Function} reply The Hapi reply function.
   * @return {void}
   **/
  handler(request, reply) {
    if (!request.yar.get('userData')) {
      this.templatePath = 'index';
      return super.handler(request, reply);
    } else {
      return reply.redirect('/home');
    }
  }
}

exports.Route = Index;
