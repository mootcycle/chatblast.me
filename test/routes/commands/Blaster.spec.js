const LoggerMock = require('../../mocks/LoggerMock').LoggerMock;
const ServerMock = require('../../mocks/ServerMock').ServerMock;
const SlackApiMock = require('../../mocks/SlackApiMock').SlackApiMock;
const Responses = require('../../../routes/Responses').Route;
const Blaster = require('../../../routes/commands/Blaster').Route;
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const t = require('../../shortcuts').get(lab);

t.describe('Blaster command', () => {
  let route; let server; let deps; let slackApi; let request1; let userClient;
  let teamClient; let replyCalled;

  t.beforeEach((done) => {
    server = new ServerMock();
    slackApi = new SlackApiMock();

    deps = {
      config: {
        slack: {
          client_id: 'foo',
          client_secret: 'bar',
          response_url: 'https://example.com/response',
        },
        authUrl: 'http://example.com/auth',
        rootUrl: 'https://example.com/',
        yarPassword: 'thisIsASekritPasswordThatIsVerySecure1@!',
      },
      slackApi,
      logger: new LoggerMock(),
    };

    deps.responses = new Responses(server, deps);

    request1 = {
      payload: {
        user_id: 'U10101',
        channel_id: 'C10101',
      },
    };

    const clients = slackApi.getAuthenticatedClientPair('T10101', 'U10101');
    userClient = clients.userClient;
    teamClient = clients.teamClient;

    route = new Blaster(server, deps);

    done();
  });

  t.describe('successful calls', () => {
    t.beforeEach((done) => {
      userClient.addPromiseResponse('team.info', {
        team: {
          name: 'My Team',
        },
      });
      userClient.addPromiseResponse('files.upload', {
        ok: true,
        file: {
          id: 'F10101',
          url_private: 'https://slack.com/files/my.shortcut',
        },
      });
      userClient.addPromiseResponse('users.info', {
        user: {
          name: 'testUser',
          profile: {
            display_name: 'testUser',
          },
        },
      });
      teamClient.addPromiseResponse('users.info', {
        user: {
          name: 'anotherUser',
          profile: {
            display_name: 'anotherUser',
          },
        },
      });
      teamClient.addPromiseResponse('chat.postMessage', {
        ok: true,
      });

      done();
    });

    t.it('creates a blaster shortcut file for a channel', (done) => {
      userClient.addPromiseResponse('conversations.info', {
        channel: {
          is_channel: true,
          name_normalized: 'myChannel',
        },
      });

      const reply = (value) => {
        replyCalled = value;
      };

      route.handler(request1, reply);

      setTimeout(() => {
        const userCalls = userClient.getMockCalls();
        const teamCalls = teamClient.getMockCalls();

        t.expect(replyCalled)
            .to.equal('Check your DMs for the shortcut file.');
        t.expect(userCalls[0].method).to.equal('conversations.info');
        t.expect(userCalls[0].arguments[0].channel).to.equal('C10101');
        t.expect(userCalls[1].method).to.equal('team.info');
        t.expect(userCalls[2].method).to.equal('users.info');
        t.expect(userCalls[3].method).to.equal('files.upload');
        t.expect(userCalls[3].arguments[0].filename)
            .to.equal('s__My Team-myChannel.shortcut');
        t.expect(userCalls[3].arguments[0].channels)
            .to.equal('@testUser');
        t.expect(userCalls[3].arguments[0].file.length)
            .to.be.greaterThan(16000);

        t.expect(teamCalls[0].method).to.equal('chat.postMessage');
        done();
      }, 20);
    });

    t.it('creates a blaster shortcut file for a DM', (done) => {
      userClient.addPromiseResponse('conversations.info', {
        channel: {is_im: true},
      });

      const reply = (value) => {
        replyCalled = value;
      };

      route.handler(request1, reply);

      setTimeout(() => {
        const userCalls = userClient.getMockCalls();
        const teamCalls = teamClient.getMockCalls();

        t.expect(replyCalled)
            .to.equal('Check your DMs for the shortcut file.');
        t.expect(userCalls[0].method).to.equal('conversations.info');
        t.expect(userCalls[0].arguments[0].channel).to.equal('C10101');
        t.expect(userCalls[1].method).to.equal('team.info');
        t.expect(userCalls[2].method).to.equal('users.info');
        t.expect(userCalls[3].method).to.equal('files.upload');
        t.expect(userCalls[3].arguments[0].filename)
            .to.equal('s__My Team-anotherUser.shortcut');
        t.expect(userCalls[3].arguments[0].channels)
            .to.equal('@testUser');
        t.expect(userCalls[3].arguments[0].file.length)
            .to.be.greaterThan(16000);

        t.expect(teamCalls[0].method).to.equal('users.info');
        t.expect(teamCalls[1].method).to.equal('chat.postMessage');
        done();
      }, 20);
    });

    t.it('creates a blaster shortcut file for a multi-party DM', (done) => {
      userClient.addPromiseResponse('conversations.info', {
        channel: {
          is_group: true,
          is_mpim: true,
          purpose: {
            value: 'Group messaging with @anotherUser, @thirdUser',
          },
        },
      });

      const reply = (value) => {
        replyCalled = value;
      };

      route.handler(request1, reply);

      setTimeout(() => {
        const userCalls = userClient.getMockCalls();
        const teamCalls = teamClient.getMockCalls();

        t.expect(replyCalled)
            .to.equal('Check your DMs for the shortcut file.');
        t.expect(userCalls[0].method).to.equal('conversations.info');
        t.expect(userCalls[0].arguments[0].channel).to.equal('C10101');
        t.expect(userCalls[1].method).to.equal('team.info');
        t.expect(userCalls[2].method).to.equal('users.info');
        t.expect(userCalls[3].method).to.equal('files.upload');
        t.expect(userCalls[3].arguments[0].filename).to.equal(
            's__My Team-Group messaging with @anotherUser, @thirdUser.shortcut'
        );
        t.expect(userCalls[3].arguments[0].channels)
            .to.equal('@testUser');
        t.expect(userCalls[3].arguments[0].file.length)
            .to.be.greaterThan(16000);

        t.expect(teamCalls[0].method).to.equal('chat.postMessage');
        done();
      }, 20);
    });

    t.it('creates a blaster shortcut file for a private channel', (done) => {
      userClient.addPromiseResponse('conversations.info', {
        channel: {
          is_group: true,
          is_mpim: false,
          name_normalized: 'privateChannel',
        },
      });

      const reply = (value) => {
        replyCalled = value;
      };

      route.handler(request1, reply);

      setTimeout(() => {
        const userCalls = userClient.getMockCalls();
        const teamCalls = teamClient.getMockCalls();

        t.expect(replyCalled)
            .to.equal('Check your DMs for the shortcut file.');
        t.expect(userCalls[0].method).to.equal('conversations.info');
        t.expect(userCalls[0].arguments[0].channel).to.equal('C10101');
        t.expect(userCalls[1].method).to.equal('team.info');
        t.expect(userCalls[2].method).to.equal('users.info');
        t.expect(userCalls[3].method).to.equal('files.upload');
        t.expect(userCalls[3].arguments[0].filename)
            .to.equal('s__My Team-privateChannel.shortcut');
        t.expect(userCalls[3].arguments[0].channels)
            .to.equal('@testUser');
        t.expect(userCalls[3].arguments[0].file.length)
            .to.be.greaterThan(16000);

        t.expect(teamCalls[0].method).to.equal('chat.postMessage');
        done();
      }, 20);
    });

    t.it('creates a blaster shortcut file for an unknown chat', (done) => {
      userClient.addPromiseResponse('conversations.info', {});

      const reply = (value) => {
        replyCalled = value;
      };

      route.handler(request1, reply);

      setTimeout(() => {
        const userCalls = userClient.getMockCalls();
        const teamCalls = teamClient.getMockCalls();

        t.expect(replyCalled)
            .to.equal('Check your DMs for the shortcut file.');
        t.expect(userCalls[0].method).to.equal('conversations.info');
        t.expect(userCalls[0].arguments[0].channel).to.equal('C10101');
        t.expect(userCalls[1].method).to.equal('team.info');
        t.expect(userCalls[2].method).to.equal('users.info');
        t.expect(userCalls[3].method).to.equal('files.upload');
        t.expect(userCalls[3].arguments[0].filename)
            .to.equal('s__Unknown.shortcut');
        t.expect(userCalls[3].arguments[0].channels)
            .to.equal('@testUser');
        t.expect(userCalls[3].arguments[0].file.length)
            .to.be.greaterThan(16000);

        t.expect(teamCalls[0].method).to.equal('chat.postMessage');
        done();
      }, 20);
    });
  });

  t.describe('failure modes', () => {
    t.it('asks for more permissions', (done) => {
      userClient.addPromiseThrow('conversations.info', {
        ok: false,
        data: {
          error: 'missing_scope',
        },
      });

      const reply = (value) => {
        replyCalled = value;
      };

      route.handler(request1, reply);

      setTimeout(() => {
        const userCalls = userClient.getMockCalls();
        const teamCalls = teamClient.getMockCalls();

        t.expect(replyCalled.text).to.match(/^Sorry. Either I don't have the/);
        t.expect(replyCalled.replace_original).to.equal(false);
        t.expect(userCalls[0].method).to.equal('conversations.info');
        t.expect(userCalls.length).to.equal(1);
        t.expect(teamCalls.length).to.equal(0);
        done();
      }, 20);
    });

    t.it('propogates unknown slack errors', (done) => {
      userClient.addPromiseThrow('conversations.info', {
        ok: false,
        data: {
          error: 'slack_on_fire',
        },
      });

      const reply = (value) => {
        replyCalled = value;
      };

      route.handler(request1, reply);

      setTimeout(() => {
        const userCalls = userClient.getMockCalls();
        const teamCalls = teamClient.getMockCalls();

        t.expect(replyCalled.text).to.match(/^Sorry. Either I don't have the/);
        t.expect(replyCalled.replace_original).to.equal(false);
        t.expect(userCalls[0].method).to.equal('conversations.info');
        t.expect(userCalls.length).to.equal(1);
        t.expect(teamCalls.length).to.equal(0);
        done();
      }, 20);
    });

    t.it('informs on upload failure', (done) => {
      userClient.addPromiseResponse('conversations.info', {
        channel: {
          is_channel: true,
          name_normalized: 'myChannel',
        },
      });
      userClient.addPromiseResponse('team.info', {
        team: {
          name: 'My Team',
        },
      });
      userClient.addPromiseResponse('users.info', {
        user: {
          name: 'testUser',
          profile: {
            display_name: 'testUser',
          },
        },
      });
      userClient.addPromiseThrow('files.upload', {
        ok: false,
        data: {
          error: 'no_space_on_internet',
        },
      });

      const reply = (value) => {
        replyCalled = value;
      };

      route.handler(request1, reply);

      setTimeout(() => {
        const userCalls = userClient.getMockCalls();
        const teamCalls = teamClient.getMockCalls();

        t.expect(replyCalled)
            .to.equal('Sorry, an error occurred with uploading the shortcut.');
        t.expect(userCalls.length).to.equal(4);
        t.expect(deps.logger.messages[0].error.data.error)
            .to.equal('no_space_on_internet');
        t.expect(teamCalls.length).to.equal(0);
        done();
      }, 20);
    });

    t.it('informs on bot DM failure', (done) => {
      userClient.addPromiseResponse('conversations.info', {
        channel: {
          is_channel: true,
          name_normalized: 'myChannel',
        },
      });
      userClient.addPromiseResponse('team.info', {
        team: {
          name: 'My Team',
        },
      });
      userClient.addPromiseResponse('users.info', {
        user: {
          name: 'testUser',
          profile: {
            display_name: 'testUser',
          },
        },
      });
      userClient.addPromiseResponse('files.upload', {
        ok: true,
        file: {
          id: 'F10101',
          url_private: 'https://slack.com/files/my.shortcut',
        },
      });
      teamClient.addPromiseThrow('chat.postMessage', {
        ok: false,
        data: {
          error: 'bot_is_evil',
        },
      });

      const reply = (value) => {
        replyCalled = value;
      };

      route.handler(request1, reply);

      setTimeout(() => {
        const userCalls = userClient.getMockCalls();
        const teamCalls = teamClient.getMockCalls();

        t.expect(replyCalled)
            .to.equal('Sorry, an error occurred posting your message.');
        t.expect(userCalls.length).to.equal(4);
        t.expect(deps.logger.messages[0].error.data.error)
            .to.equal('bot_is_evil');
        t.expect(teamCalls[0].method).to.equal('chat.postMessage');
        t.expect(teamCalls.length).to.equal(1);
        done();
      }, 20);
    });
  });

  t.describe('response handler', () => {
    t.it('successfully cleans up', (done) => {
      const request2 = {
        payload: {
          callback_id: 'blaster_cleanup',
          team: {id: 'T10101'},
          user: {id: 'U10101'},
          channel: {id: 'C10101'},
          actions: [{value: 'F10101'}],
          message_ts: '1234.5678',
        },
      };
      teamClient.addPromiseResponse('chat.delete', {});
      userClient.addPromiseResponse('files.delete', {});
      userClient.addPromiseResponse('users.info', {
        user: {
          name: 'testUser',
          profile: {
            display_name: 'testUser',
          },
        },
      });

      const reply = (value) => {
        replyCalled = value;
      };

      deps.responses.handler(request2, reply);

      setTimeout(() => {
        const userCalls = userClient.getMockCalls();
        const teamCalls = teamClient.getMockCalls();

        t.expect(replyCalled).to.equal('Shortcut removed from Slack.');
        t.expect(teamCalls.length).to.equal(1);
        t.expect(teamCalls[0].arguments[0].ts).to.equal('1234.5678');
        t.expect(userCalls.length).to.equal(2);
        t.expect(userCalls[1].arguments[0].file).to.equal('F10101');
        done();
      }, 20);
    });

    t.it('successfully sends a multi-blaster', (done) => {
      const request2 = {
        payload: {
          callback_id: 'blaster_cleanup',
          team: {id: 'T10101'},
          user: {id: 'U10101'},
          channel: {id: 'C10101'},
          actions: [{value: 'multi'}],
          message_ts: '1234.5678',
        },
      };
      teamClient.addPromiseResponse('chat.postMessage', {});
      userClient.addPromiseResponse('users.info', {
        user: {
          name: 'testUser',
          profile: {
            display_name: 'testUser',
          },
        },
      });
      userClient.addPromiseResponse('files.upload', {
        ok: true,
        file: {
          id: 'F10101',
          url_private: 'https://slack.com/files/my.shortcut',
        },
      });
      const reply = () => {
        replyCalled = true;
      };

      deps.responses.handler(request2, reply);

      setTimeout(() => {
        const userCalls = userClient.getMockCalls();
        const teamCalls = teamClient.getMockCalls();

        t.expect(replyCalled).to.equal(true);
        t.expect(teamCalls.length).to.equal(1);
        t.expect(teamCalls[0].arguments[0].channel).to.equal('@testUser');
        t.expect(teamCalls[0].arguments[0].title)
            .to.equal('Here\'s the Multi-blaster Shortcut.');
        t.expect(userCalls.length).to.equal(2);
        t.expect(userCalls[1].arguments[0].filename)
            .to.equal('Slack multi-blaster.shortcut');
        t.expect(userCalls[1].arguments[0].channels)
            .to.equal('@testUser');
        done();
      }, 20);
    });

    t.it('logs a payload error', (done) => {
      const request2 = {
        payload: {
          callback_id: 'blaster_cleanup',
        },
      };
      const reply = (value) => {
        replyCalled = value;
      };

      deps.responses.handler(request2, reply);

      setTimeout(() => {
        t.expect(replyCalled.output.payload.statusCode).to.equal(500);
        t.expect(deps.logger.messages[0].error.message)
            .to.equal('Payload error.');
        done();
      }, 20);
    });

    t.it('logs a chat cleanup error', (done) => {
      const request2 = {
        payload: {
          callback_id: 'blaster_cleanup',
          team: {id: 'T10101'},
          user: {id: 'U10101'},
          channel: {id: 'C10101'},
          actions: [{value: 'F10101'}],
          message_ts: '1234.5678',
        },
      };
      teamClient.addPromiseThrow('chat.delete', {
        ok: false,
        data: {
          error: 'message_not_found',
        },
      });
      userClient.addPromiseResponse('users.info', {
        user: {
          name: 'testUser',
          profile: {
            display_name: 'testUser',
          },
        },
      });
      const reply = (value) => {
        replyCalled = value;
      };

      deps.responses.handler(request2, reply);

      setTimeout(() => {
        t.expect(replyCalled.output.payload.statusCode).to.equal(500);
        t.expect(deps.logger.messages[0].error.message)
            .to.equal('Chat cleanup error.');
        done();
      }, 20);
    });

    t.it('logs a file delete error', (done) => {
      const request2 = {
        payload: {
          callback_id: 'blaster_cleanup',
          team: {id: 'T10101'},
          user: {id: 'U10101'},
          channel: {id: 'C10101'},
          actions: [{value: 'F10101'}],
          message_ts: '1234.5678',
        },
      };
      teamClient.addPromiseResponse('chat.delete', {});
      userClient.addPromiseResponse('users.info', {
        user: {
          name: 'testUser',
          profile: {
            display_name: 'testUser',
          },
        },
      });
      userClient.addPromiseThrow('files.delete', {
        ok: false,
        data: {
          error: 'file_not_found',
        },
      });
      const reply = (value) => {
        replyCalled = value;
      };

      deps.responses.handler(request2, reply);

      setTimeout(() => {
        t.expect(replyCalled.output.payload.statusCode).to.equal(500);
        t.expect(deps.logger.messages[0].error.message)
            .to.equal('File cleanup error.');
        done();
      }, 20);
    });

    t.it('logs a multi-blaster upload error', (done) => {
      const request2 = {
        payload: {
          callback_id: 'blaster_cleanup',
          team: {id: 'T10101'},
          user: {id: 'U10101'},
          channel: {id: 'C10101'},
          actions: [{value: 'multi'}],
          message_ts: '1234.5678',
        },
      };
      teamClient.addPromiseResponse('chat.postMessage', {});
      userClient.addPromiseResponse('users.info', {
        user: {
          name: 'testUser',
          profile: {
            display_name: 'testUser',
          },
        },
      });
      userClient.addPromiseResponse('files.upload', {ok: false});
      const reply = (value) => {
        replyCalled = value;
      };

      deps.responses.handler(request2, reply);

      setTimeout(() => {
        const userCalls = userClient.getMockCalls();
        const teamCalls = teamClient.getMockCalls();

        t.expect(replyCalled.text)
            .to.equal('Sorry, an error occurred with uploading the shortcut.');
        t.expect(teamCalls.length).to.equal(0);
        t.expect(userCalls.length).to.equal(2);
        done();
      }, 20);
    });
  });
});


