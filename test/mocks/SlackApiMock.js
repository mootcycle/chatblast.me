const GenericMock = require('./GenericMock').GenericMock;

/**
 * Mocks out the SlackApi object.
 */
class SlackApiMock {
  /** Constructor */
  constructor() {
    this.__cacheClearTime = 60 * 60 * 1000; // 1 hour
    this.tokens = {};

    this.generateTestClients();
  }

  /**
   * Creates new test mocks for the client objects.
   */
  generateTestClients() {
    this.unauthenticatedClient = new GenericMock();
    this.userClient = new GenericMock();
    this.teamClient = new GenericMock();
  }

  /**
   * Clears the client objects.
   */
  clearTestClients() {
    this.unauthenticatedClient = undefined;
    this.userClient = undefined;
    this.teamClient = undefined;
  }

  /**
   * Returns the unauthenticated mock Slack client.
   * @return {GenericMock|undefined} The mock client.
   */
  getUnauthenticatedClient() {
    return this.unauthenticatedClient;
  }

  /** Noop mock for adding user data. */
  addUserConfirmData() {}

  /**
   * Returns mock user data.
   * @param {String} teamId The mock team id.
   * @param {String} userId The mock user id.
   * @return {Object} The mock user data.
   */
  getAuthenticatedClientPair(teamId, userId) {
    if (!this.userClient || !this.teamClient) {
      throw new Error('missing_tokens');
    }

    return {
      userClient: this.userClient,
      teamClient: this.teamClient,
      access_token: `xoxt-10101-${userId}`,
      teamName: `team-${teamId}`,
    };
  }
}

exports.SlackApiMock = SlackApiMock;
