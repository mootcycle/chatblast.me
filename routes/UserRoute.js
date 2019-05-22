const Hoek = require('hoek');

/**
 * Helper abstract class for routes which require a user authentication token.
 * Any command which requires a user to be signed in to Slack should probably
 * descend from this class.
 **/
class UserRoute extends require('./Route').Route {
  /**
   * Returns a promise with the user record and the associated SlackAPI
   * client for that user.
   * @param {Request} request The Hapi request object.
   * @param {Function} reply The Hapi reply function.
   * @return {Promise<object>} Resolves with the user and slack client
   *     as properties the resolved object.
   **/
  getClients(request) {
    const p = request.payload;

    const teamId = p.team_id || Hoek.reach(p, 'team.id');
    const userId = p.user_id || Hoek.reach(p, 'user.id');

    return this.slackApi.getAuthenticatedClientPair(teamId, userId);
  }

  /**
   * Overrides the Route class method to catch situations where the invoking
   * user doesn't have an authentication token and sends a message to them
   * requesting that they authorize the app.
   * @param {Error} err The error object.
   * @param {Function} reply The Hapi reply function.
   * @return {void}
   **/
  routeError(err, reply) {
    if (err.message === 'token_revoked'
        || err.message === 'not_authed'
        || err.message === 'invalid_auth') {
      return reply({
        text: 'I can\'t find a valid authorization token for you. ' +
          'Go to ' + this.config.authUrl + ' to authorize this app.',
      });
    } else {
      return super.routeError(err, reply);
    }
  }
}

exports.Route = UserRoute;
