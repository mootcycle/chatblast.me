/**
 * The home page for logged in users.
 **/
class Index extends require('./AuthenticatedPage').Route {
  /**
   * Generates the page object for Hapi.
   * @param {Hapi.Server} server The Hapi server object.
   * @param {Object} deps The dependency object.
   */
  constructor(server, deps) {
    super(server, deps);

    this.method = 'GET';
    this.path = '/home';
    this.templatePath = 'logged-in';

    this.route({
      method: this.method,
      path: this.path,
      handler: this.handler.bind(this),
    });

    this.pageData.title = 'chatblast.me';
    this.pageData.clientId = this.config.slack.client_id;
  }
}

exports.Route = Index;
