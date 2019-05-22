const plist = require('simple-plist');
const version = require('../../package.json').version;
const {generateTargetShortcutJson, generateMultiShortcutJson} =
    require('../../templates/shortcuts');

/**
 * This command generates a link to an iOS shortcut file containing
 * authentication tokens that can be used to post messages to this channel as
 * the user.
 **/
class Blaster extends require('./../UserRoute').Route {
  /**
   * Generates the command object for Hapi.
   * @param {Hapi.Server} server The Hapi server object.
   * @param {Object} deps The dependency object.
   */
  constructor(server, deps) {
    super(server, deps);

    this.method = 'POST';
    this.path = '/commands/blaster';

    this.route({
      method: this.method,
      path: this.path,
      handler: this.handler.bind(this),
    });

    deps.responses.register('blaster_cleanup', this);
  }

  /**
   * The route function called when this REST endpoint is called.
   * @param {Request} request The Hapi request object.
   * @param {Function} reply The Hapi reply function.
   **/
  async handler(request, reply) {
    const p = request.payload;
    let clients; let channelName; let userInfo; let userName;
    let userProfileName;

    try {
      clients = this.getClients(request);
      channelName = await this.generateChannelString(
          clients.userClient, clients.teamClient, p.channel_id);
      userInfo = await clients.userClient.users.info({
        user: p.user_id,
      });
      userName = userInfo.user.name;
      userProfileName = userInfo.user.profile.display_name;
    } catch (fetchErr) {
      this.logError(fetchErr);
      return this.askForAuth(reply);
    }

    let xml;
    try {
      xml = plist.stringify(
          generateTargetShortcutJson(
              clients.access_token,
              p.channel_id,
              p.team_id,
              `Blaster Workflow from ${userProfileName} to ${channelName}. You can rename this shortcut, but the name must start with "s__" for this shortcut to appear in the multi-blaster shortcut selection list. Generated by https://chatblast.me version ${version}`)); // eslint-disable-line max-len
    } catch (genShortcutErr) {
      this.logError(genShortcutErr);
      return reply('Sorry, an error occurred generating your shortcut.');
    }

    let uploaded;
    try {
      uploaded = await clients.userClient.files.upload({
        file: Buffer.from(xml),
        filename: `${channelName}.shortcut`,
        filetype: 'text/xml',
        title: `${channelName}.shortcut`,
        channels: `@${userName}`,
      });
    } catch (uploadErr) {
      this.logError(uploadErr);
      return reply(
          'Sorry, an error occurred with uploading the shortcut.');
    }

    try {
      await this.postShortcut(clients.teamClient, userName,
          `Here's the Shortcut for ${channelName}.`,
          'Remember to delete this shortcut once you\'ve imported it. It contains an authorization token which will allow anyone who runs the shortcut to post as you.', // eslint-disable-line max-len
          uploaded.file.url_private,
          uploaded.file.id,
          false);

      return reply('Check your DMs for the shortcut file.');
    } catch (postShortcutErr) {
      this.logError(postShortcutErr);
      return reply('Sorry, an error occurred posting your message.');
    }
  }

  /**
   * A helper function which will ask the Slack user to go through the Slack
   * oauth flow.
   * @param {Function} reply The Hapi reply function.
   * @return {void}
   */
  askForAuth(reply) {
    return reply({
      replace_original: false,
      text: `Sorry. Either I don't have the required authorization or my authorization with your account expired.  You'll need to visit ${this.config.authUrl} and click the "Add to Slack" button to create the shortcuts.`, // eslint-disable-line max-len
    });
  }

  /**
   * The responseHandler function called when a slack user clicks an action
   * button. This will delete the shortcut files off of Slack's servers.
   * @param {Request} request The Hapi request object.
   * @param {Function} reply The Hapi reply function.
   **/
  async responseHandler(request, reply) {
    const p = request.payload;
    let userAction; let clients; let userInfo; let userName;

    try {
      userAction = this.unescapeUserText(p.actions[0].value);
    } catch (err) {
      return this.routeError(new Error('Payload error.'), reply);
    }

    try {
      clients = this.getClients(request);
      userInfo = await clients.userClient.users.info({user: p.user.id});
      userName = userInfo.user.name;
    } catch (getClientsErr) {
      this.logError(getClientsErr);
      return this.askForAuth(reply);
    }

    if (userAction === 'multi') {
      return await this.generateMultiBlaster(
          reply, clients.userClient, clients.teamClient, userName);
    }

    try {
      await clients.teamClient.chat.delete({
        channel: p.channel.id,
        ts: p.message_ts,
      });
    } catch (chatDeleteErr) {
      return this.routeError(new Error('Chat cleanup error.'), reply);
    }

    try {
      await clients.userClient.files.delete({file: userAction});
    } catch (fileDeleteErr) {
      return this.routeError(new Error('File cleanup error.'), reply);
    }

    return reply('Shortcut removed from Slack.');
  }

  /**
   * Generates the mutliblaster shortcut and sends it to the client.
   * @param {Function} reply The Hapi reply function.
   * @param {WebClient} client The user authed Slack client.
   * @param {WebClient} teamClient The team authed Slack client.
   * @param {string} userName The user name for the requesting user.
   **/
  async generateMultiBlaster(reply, client, teamClient, userName) {
    const comment = `This shortcut will allow you to select multiple targets to share with. It will display all shortcuts that start with the name "s__". This shortcut does not contain any authentication data. Generated by https://chatblast.me version ${version}`; // eslint-disable-line max-len
    const xml = plist.stringify(generateMultiShortcutJson(comment));

    let uploaded;
    try {
      uploaded = await client.files.upload({
        file: Buffer.from(xml),
        filename: `Slack multi-blaster.shortcut`,
        filetype: 'text/xml',
        title: `Slack multi-blaster.shortcut`,
        channels: `@${userName}`,
      });
    } catch (uploadErr) {
      uploaded = {ok: false};
      this.logError(uploadErr);
    }
    if (!uploaded.ok) {
      return reply({
        replace_original: false,
        text: 'Sorry, an error occurred with uploading the shortcut.',
      });
    }

    await this.postShortcut(teamClient, userName,
        `Here's the Multi-blaster Shortcut.`,
        comment,
        uploaded.file.url_private,
        uploaded.file.id,
        true);

    return reply();
  }

  /**
   * Generates the string used for a shortcut file name.
   * @param {WebClient} teamClient The Slack client object for the team.
   * @param {string} userName The user name of the user recieving the message.
   * @param {string} title The title of the uploaded shortcut.
   * @param {string} text The text describing the uploaded shortcut.
   * @param {string} url The private url to the shortcuts file.
   * @param {string} fileId The id of the posted shortcuts file. Used for an
   *     action button to clean up the shortcut file after the user finishes
   *     the download.
   * @param {boolean} multi True when posting a multi-blaster file.
   **/
  async postShortcut(teamClient, userName, title, text, url, fileId, multi) {
    const actions = [{
      name: 'Delete from Slack',
      text: 'Delete from Slack',
      type: 'button',
      value: fileId,
    }];

    if (!multi) {
      actions.push({
        name: 'Send multi-blaster',
        text: 'Send multi-blaster',
        type: 'button',
        value: 'multi',
      });
    }

    return teamClient.chat.postMessage({
      channel: `@${userName}`,
      title,
      as_user: true,
      attachments: [
        {
          fallback: 'A link to a share shortcut.',
          color: '#3AA3E3',
          title,
          title_link: url,
          text,
          callback_id: 'blaster_cleanup',
          actions,
        },
      ],
    });
  }

  /**
   * Generates the string used for a shortcut file name.
   * @param {WebClient} userClient The Slack client object for the user.
   * @param {WebClient} teamClient The Slack client object for the team.
   * @param {string} channelId The channel id string for the target channel.
   **/
  async generateChannelString(userClient, teamClient, channelId) {
    const cInfo = await userClient.conversations.info({channel: channelId});
    const team = (await userClient.team.info()).team.name;
    if (cInfo.channel && cInfo.channel.is_channel) {
      try {
        return `s__${team}-${cInfo.channel.name_normalized}`;
      } catch (err) {
        return 'Channel';
      }
    }

    if (cInfo.channel && cInfo.channel.is_im) {
      const userResponse =
        await teamClient.users.info({user: cInfo.channel.user});
      try {
        return `s__${team}-${userResponse.user.name}`;
      } catch (err) {
        return 'DM';
      }
    }

    if (cInfo.channel && cInfo.channel.is_group && cInfo.channel.is_mpim) {
      try {
        return `s__${team}-${cInfo.channel.purpose.value}`;
      } catch (err) {
        return 'Multi-party DM';
      }
    }

    if (cInfo.channel && cInfo.channel.is_group && !cInfo.channel.is_mpim) {
      try {
        return `s__${team}-${cInfo.channel.name_normalized}`;
      } catch (err) {
        return 'Private channel';
      }
    }

    return 's__Unknown';
  }
}

exports.Route = Blaster;