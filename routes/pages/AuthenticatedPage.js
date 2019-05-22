/**
 * The list of routes available in the menu/nav bar.
 */
const NAV_ITEMS = [{
  href: '/home',
  link: 'Home',
}, {
  href: '/logout',
  link: 'Log Out',
}];

/**
 * This class can is a wrapper class for pages which need authentication to be
 * viewed by the user.
 **/
class AuthenticatedPage extends require('./Page').Route {
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
    this.auth = 'chatblast.me';

    this.pageData.navItems = NAV_ITEMS;
  }
}

exports.Route = AuthenticatedPage;
