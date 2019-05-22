const _ = require('lodash');
const Hoek = require('hoek');

/**
 * This class can is a wrapper class for pages.
 **/
class Page extends require('../Route').Route {
  /**
   * Injects the required dependencies.
   * @param {Hapi.Server} server The Hapi server object. Used as a reference
   *     to register the route after construction.
   * @param {Object} deps The dependencies object. Contains references to the
   *     required dependencies which are assigned to local properties on the
   *     Route object.
   **/
  constructor(server, deps) {
    super(server, deps);

    this.pageData = {
      navItems: [],
    };
  }

  /**
   * The route function called when this REST endpoint is called.
   * @param {Request} request The Hapi request object.
   * @param {Function} reply The Hapi reply function.
   **/
  handler(request, reply) {
    Hoek.assert(this.templatePath, 'A template path is required.');
    reply.view(this.templatePath, this.pageData);
  }

  /**
   * This function sets per-page handlebars decorations like if a route is
   * active.
   * @param {Object} options The route configuration object. Child classes
   *     must define the required properties (method, path, handler) before
   *     invoking this function. See full documentation here:
   *     https://hapijs.com/api#route-options
   **/
  route(options) {
    super.route(options);

    this.pageData.navItems = _.cloneDeep(this.pageData.navItems);

    this.pageData.navItems.forEach((item) => {
      if (this.path === item.href) {
        item.active = true;
      }
    });
  }
}

exports.Route = Page;
