/**
 * This file contains references to all the routes which will be loaded when the
 * server is started. When a new route is created, it needs to be added here
 * before it can be loaded.
 **/

const routes = [
  require('./commands/Blaster').Route,
  require('./pages/ErrorPage').Route,
  require('./pages/Home').Route,
  require('./pages/Index').Route,
  require('./pages/Logout').Route,
  require('./pages/SlackAuth').Route,
  require('./Static').Route,
];


exports.inject = (server, deps) => {
  const disabled = deps.config.disableModules || [];
  routes.forEach((Route) => {
    if (disabled.indexOf(`routes/${Route.name}`) == -1) {
      new Route(server, deps);
    } else {
      deps.logger.info({
        message: `Disabling the module: routes/${Route.name}`,
      });
    }
  });
};
