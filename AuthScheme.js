const Boom = require('boom');
const internals = {};
/**
 * The hapi auth scheme for chatblast.me. A user is considered logged in if they
 * have a yar cookie set with the authorization values from successfully adding
 * chatblast.me to Slack.
 **/

exports.register = function(plugin, options, next) {
  plugin.auth.scheme('chatblast.me', internals.implementation);
  next();
};

exports.register.attributes = {
  name: 'chatblast.me',
  version: '1.0.0',
};

internals.implementation = function(server, options) {
  const key = options.key;
  const logger = options.logger;

  const scheme = {
    authenticate: (request, reply) => {
      const userData = request.yar.get(key);

      if (userData) {
        return reply.continue({
          credentials: {
            userId: userData.userId,
            teamId: userData.teamId,
            teamName: userData.teamName,
          },
        });
      } else {
        switch (request.method) {
          case 'post':
            logger.error({
              error: 403,
              path: request.url.path,
            });
            return reply(Boom.forbidden());

          default:
            return reply.redirect('/');
        }
      }
    },
  };

  return scheme;
};
