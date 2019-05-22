
const Joi = require('joi');

/**
 * This route handles requesting new authorization tokens for users adding the
 * app to Slack.
 **/
class SlackAuth extends require('./Page').Route {
  /**
   * Generates the page object for Hapi.
   * @param {Hapi.Server} server The Hapi server object.
   * @param {Object} deps The dependency object.
   */
  constructor(server, deps) {
    super(server, deps);

    this.method = 'GET';
    this.path = '/slack-auth';
    this.route({
      method: this.method,
      path: this.path,
      handler: this.handler.bind(this),
      config: {
        validate: {
          query: {
            code: Joi.string().required(),
            redirect_uri: Joi.string(),
            state: Joi.string(),
          },
        },
      },
    });
  }

  /**
   * On successful auth, redirect the user back to the root page with a cookie
   * set. When unsuccessful, redirect to the error page.
   * @param {Request} request The Hapi request object.
   * @param {Function} reply The Hapi reply function.
   **/
  async handler(request, reply) {
    let confirmData;

    try {
      confirmData = await this.confirmCode(request.query.code);
    } catch (confirmCodeErr) {
      this.logError(confirmCodeErr);
      return reply.redirect('/error');
    }

    if (!confirmData) {
      return reply.redirect('/error');
    }

    this.slackApi.addUserConfirmData(confirmData);
    const userData = {
      user_id: confirmData.user_id,
      team_id: confirmData.team_id,
      team_name: confirmData.team_name,
      loginTime: Date.now(),
    };

    request.yar.set('userData', userData);

    return reply.redirect('/home');
  }

  /**
   * Requests an OAuth token for the user who is attempting to add the Slack
   * app.
   * @param {String} code The temporary auth code sent from Slack in order to
   *     request an OAuth token.
   **/
  async confirmCode(code) {
    // eslint-disable-next-line camelcase
    const {client_id, client_secret} = this.config.slack;

    const client = this.slackApi.getUnauthenticatedClient();

    return await client.oauth.access({client_id, client_secret, code});
  }
}

exports.Route = SlackAuth;
