/**
 * This route handles serving static files.
 **/
class Static extends require('./Route').Route {
  /**
   * Generates the route object for Hapi.
   * @param {Hapi.Server} server The Hapi server object.
   * @param {Object} deps The dependency object.
   */
  constructor(server, deps) {
    super(server, deps);

    this.method = 'GET';
    this.path = '/static/{param*}';
    this.handler = {
      directory: {
        path: 'static',
      },
    };

    this.route({
      method: this.method,
      path: this.path,
      handler: this.handler,
    });
  }
}

exports.Route = Static;
