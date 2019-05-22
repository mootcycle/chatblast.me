/**
 * A wrapper around the Slack API which handles team, bot, and user clients.
 **/

let WebClient;

/**
 * The SlackApi wrapper.
 */
class SlackApi {
  /**
   * The SlackApi wrapper.
   * @param {Object} deps The dependency object.
   */
  constructor(deps) {
    this.logger = deps.logger;
    this.constants = deps.constants;
    this.emitter = deps.emitter;
    WebClient = deps.slackClient.WebClient;
    this.__cacheClearTime = 60 * 60 * 1000; // 1 hour

    this.tokens = {};
  }

  /**
   * Gets a client without an auth token.
   * @return {WebClient} The Slack Client.
   **/
  getUnauthenticatedClient() {
    return new WebClient();
  }

  /**
   * Given a teamId and userId, return the WebClient user/bot pair and
   * associated tokens.
   * @param {String} teamId The Slack team id.
   * @param {String} userId The Slack user id.
   * @return {Object} The authenticated clients and tokens for the user.
   **/
  getAuthenticatedClientPair(teamId, userId) {
    const data = this.tokens[`${teamId}/${userId}`];

    if (!data) {
      throw new Error('missing_tokens');
    }

    return {
      userClient: new WebClient(data.access_token),
      teamClient: new WebClient(data.bot.bot_access_token),
      access_token: data.access_token,
      teamName: data.team_name,
    };
  }

  /**
   * Adds user data to the local token cache. Authentication tokens are kept in
   * memory for 1 hour and then purged.
   * @param {*} confirmData The data returned by the slack oauth call.
   */
  addUserConfirmData(confirmData) {
    const tokenPath = `${confirmData.team_id}/${confirmData.user_id}`;
    this.tokens[tokenPath] = confirmData;

    // Clear tokens after 1 hour.
    setTimeout(() => {
      this.tokens[tokenPath] = undefined;
    }, this.__cacheClearTime);
  }
}

exports.SlackApi = SlackApi;
