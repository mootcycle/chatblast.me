/**
 * This file contains the JSON templates for the iOS Shortcuts files. Each
 * template can be populated and passed to simple-plist to generate the XML or
 * binary plist format that Shortcuts uses.
 */

exports.generateTargetShortcutJson =
    (slackToken, channelId, teamId, comment) => {
      return {
        WFWorkflowImportQuestions: [],
        WFWorkflowTypes: [
          'WatchKit',
          'ActionExtension',
        ],
        WFWorkflowInputContentItemClasses: [
          'WFAppStoreAppContentItem',
          'WFArticleContentItem',
          'WFContactContentItem',
          'WFDateContentItem',
          'WFEmailAddressContentItem',
          'WFGenericFileContentItem',
          'WFImageContentItem',
          'WFiTunesProductContentItem',
          'WFLocationContentItem',
          'WFDCMapsLinkContentItem',
          'WFAVAssetContentItem',
          'WFPDFContentItem',
          'WFPhoneNumberContentItem',
          'WFRichTextContentItem',
          'WFSafariWebPageContentItem',
          'WFStringContentItem',
          'WFURLContentItem',
        ],
        WFWorkflowActions: [
          {
            WFWorkflowActionIdentifier: 'is.workflow.actions.comment',
            WFWorkflowActionParameters: {
              WFCommentActionText: comment,
            },
          },
          {
            WFWorkflowActionIdentifier: 'is.workflow.actions.repeat.each',
            WFWorkflowActionParameters: {
              GroupingIdentifier: 'A30197F8-1D93-4D3E-9430-F65025B3A02C',
              WFControlFlowMode: 0,
            },
          },
          {
            WFWorkflowActionIdentifier: 'is.workflow.actions.setvariable',
            WFWorkflowActionParameters: {
              WFVariableName: 'accepted',
            },
          },
          {
            WFWorkflowActionIdentifier: 'is.workflow.actions.getitemtype',
            WFWorkflowActionParameters: {},
          },
          {
            WFWorkflowActionIdentifier: 'is.workflow.actions.setvariable',
            WFWorkflowActionParameters: {
              WFVariableName: 'acceptedType',
            },
          },
          {
            WFWorkflowActionIdentifier: 'is.workflow.actions.list',
            WFWorkflowActionParameters: {
              WFItems: [
                'File',
                'Image',
                'Media',
                'Photo media',
              ],
            },
          },
          {
            WFWorkflowActionIdentifier: 'is.workflow.actions.setvariable',
            WFWorkflowActionParameters: {
              WFVariableName: 'uploadTypes',
            },
          },
          {
            WFWorkflowActionIdentifier: 'is.workflow.actions.getvariable',
            WFWorkflowActionParameters: {
              WFVariable: {
                Value: {
                  VariableName: 'uploadTypes',
                  Type: 'Variable',
                },
                WFSerializationType: 'WFTextTokenAttachment',
              },
            },
          },
          {
            WFWorkflowActionIdentifier: 'is.workflow.actions.conditional',
            WFWorkflowActionParameters: {
              WFControlFlowMode: 0,
              WFConditionalActionString: {
                Value: {
                  string: '￼',
                  attachmentsByRange: {
                    '{0, 1}': {
                      VariableName: 'acceptedType',
                      Type: 'Variable',
                    },
                  },
                },
                WFSerializationType: 'WFTextTokenString',
              },
              GroupingIdentifier: 'DE5E27EF-5A2F-4614-90A7-5110A9A7F9B4',
              WFCondition: 'Contains',
            },
          },
          {
            WFWorkflowActionIdentifier: 'is.workflow.actions.url',
            WFWorkflowActionParameters: {
              WFURLActionURL: 'https://slack.com/api/files.upload',
            },
          },
          {
            WFWorkflowActionIdentifier: 'is.workflow.actions.downloadurl',
            WFWorkflowActionParameters: {
              WFHTTPHeaders: {
                Value: {
                  WFDictionaryFieldValueItems: [
                    {
                      WFKey: {
                        Value: {
                          string: 'Content-Type',
                          attachmentsByRange: {},
                        },
                        WFSerializationType: 'WFTextTokenString',
                      },
                      WFItemType: 0,
                      WFValue: {
                        Value: {
                          string: 'application/json; charset=utf-8',
                          attachmentsByRange: {},
                        },
                        WFSerializationType: 'WFTextTokenString',
                      },
                    },
                    {
                      WFKey: {
                        Value: {
                          string: 'Authorization',
                          attachmentsByRange: {},
                        },
                        WFSerializationType: 'WFTextTokenString',
                      },
                      WFItemType: 0,
                      WFValue: {
                        Value: {
                          // Left-pad the bearer token so it isn't visible
                          // during the shortcuts execution animation.
                          string: `                                                                                                                                                      Bearer ${slackToken}`, // eslint-disable-line max-len
                          attachmentsByRange: {},
                        },
                        WFSerializationType: 'WFTextTokenString',
                      },
                    },
                  ],
                },
                WFSerializationType: 'WFDictionaryFieldValue',
              },
              Advanced: true,
              ShowHeaders: true,
              WFHTTPMethod: 'POST',
              WFHTTPBodyType: 'Form',
              WFFormValues: {
                Value: {
                  WFDictionaryFieldValueItems: [
                    {
                      WFKey: {
                        Value: {
                          string: 'file',
                          attachmentsByRange: {},
                        },
                        WFSerializationType: 'WFTextTokenString',
                      },
                      WFItemType: 5,
                      WFValue: {
                        Value: {
                          Value: {
                            VariableName: 'accepted',
                            Type: 'Variable',
                          },
                          WFSerializationType: 'WFTextTokenAttachment',
                        },
                        WFSerializationType: 'WFTokenAttachmentParameterState',
                      },
                    },
                    {
                      WFKey: {
                        Value: {
                          string: 'channels',
                          attachmentsByRange: {},
                        },
                        WFSerializationType: 'WFTextTokenString',
                      },
                      WFItemType: 0,
                      WFValue: {
                        Value: {
                          string: channelId,
                          attachmentsByRange: {},
                        },
                        WFSerializationType: 'WFTextTokenString',
                      },
                    },
                  ],
                },
                WFSerializationType: 'WFDictionaryFieldValue',
              },
            },
          },
          {
            WFWorkflowActionIdentifier: 'is.workflow.actions.setvariable',
            WFWorkflowActionParameters: {
              WFVariableName: 'postResult',
            },
          },
          {
            WFWorkflowActionIdentifier: 'is.workflow.actions.conditional',
            WFWorkflowActionParameters: {
              GroupingIdentifier: 'DE5E27EF-5A2F-4614-90A7-5110A9A7F9B4',
              WFControlFlowMode: 1,
            },
          },
          {
            WFWorkflowActionIdentifier: 'is.workflow.actions.url',
            WFWorkflowActionParameters: {
              WFURLActionURL: 'https://slack.com/api/chat.postMessage',
            },
          },
          {
            WFWorkflowActionIdentifier: 'is.workflow.actions.downloadurl',
            WFWorkflowActionParameters: {
              Advanced: true,
              WFHTTPHeaders: {
                Value: {
                  WFDictionaryFieldValueItems: [
                    {
                      WFKey: {
                        Value: {
                          string: 'Content-Type',
                          attachmentsByRange: {},
                        },
                        WFSerializationType: 'WFTextTokenString',
                      },
                      WFItemType: 0,
                      WFValue: {
                        Value: {
                          string: 'application/json; charset=utf-8',
                          attachmentsByRange: {},
                        },
                        WFSerializationType: 'WFTextTokenString',
                      },
                    },
                    {
                      WFKey: {
                        Value: {
                          string: 'Authorization',
                          attachmentsByRange: {},
                        },
                        WFSerializationType: 'WFTextTokenString',
                      },
                      WFItemType: 0,
                      WFValue: {
                        Value: {
                          // Left-pad the bearer token so it isn't visible
                          // during the shortcuts execution animation.
                          string: `                                                                                                                                                      Bearer ${slackToken}`, // eslint-disable-line max-len
                          attachmentsByRange: {},
                        },
                        WFSerializationType: 'WFTextTokenString',
                      },
                    },
                  ],
                },
                WFSerializationType: 'WFDictionaryFieldValue',
              },
              ShowHeaders: true,
              WFJSONValues: {
                Value: {
                  WFDictionaryFieldValueItems: [
                    {
                      WFKey: {
                        Value: {
                          string: 'channel',
                          attachmentsByRange: {},
                        },
                        WFSerializationType: 'WFTextTokenString',
                      },
                      WFItemType: 0,
                      WFValue: {
                        Value: {
                          string: channelId,
                          attachmentsByRange: {},
                        },
                        WFSerializationType: 'WFTextTokenString',
                      },
                    },
                    {
                      WFKey: {
                        Value: {
                          string: 'as_user',
                          attachmentsByRange: {},
                        },
                        WFSerializationType: 'WFTextTokenString',
                      },
                      WFItemType: 4,
                      WFValue: {
                        Value: 1,
                        WFSerializationType: 'WFNumberSubstitutableState',
                      },
                    },
                    {
                      WFKey: {
                        Value: {
                          string: 'text',
                          attachmentsByRange: {},
                        },
                        WFSerializationType: 'WFTextTokenString',
                      },
                      WFItemType: 0,
                      WFValue: {
                        Value: {
                          string: '￼',
                          attachmentsByRange: {
                            '{0, 1}': {
                              VariableName: 'accepted',
                              Type: 'Variable',
                            },
                          },
                        },
                        WFSerializationType: 'WFTextTokenString',
                      },
                    },
                  ],
                },
                WFSerializationType: 'WFDictionaryFieldValue',
              },
              WFHTTPMethod: 'POST',
            },
          },
          {
            WFWorkflowActionIdentifier: 'is.workflow.actions.setvariable',
            WFWorkflowActionParameters: {
              WFVariableName: 'postResult',
            },
          },
          {
            WFWorkflowActionIdentifier: 'is.workflow.actions.conditional',
            WFWorkflowActionParameters: {
              WFControlFlowMode: 2,
              GroupingIdentifier: 'DE5E27EF-5A2F-4614-90A7-5110A9A7F9B4',
            },
          },
          {
            WFWorkflowActionIdentifier: 'is.workflow.actions.repeat.each',
            WFWorkflowActionParameters: {
              GroupingIdentifier: 'A30197F8-1D93-4D3E-9430-F65025B3A02C',
              WFControlFlowMode: 2,
            },
          },
          {
            WFWorkflowActionIdentifier: 'is.workflow.actions.getvariable',
            WFWorkflowActionParameters: {
              WFVariable: {
                Value: {
                  VariableName: 'postResult',
                  Type: 'Variable',
                },
                WFSerializationType: 'WFTextTokenAttachment',
              },
            },
          },
          {
            WFWorkflowActionIdentifier: 'is.workflow.actions.getvalueforkey',
            WFWorkflowActionParameters: {
              WFDictionaryKey: 'ok',
            },
          },
          {
            WFWorkflowActionIdentifier: 'is.workflow.actions.conditional',
            WFWorkflowActionParameters: {
              WFControlFlowMode: 0,
              WFConditionalActionString: 'false',
              GroupingIdentifier: '36BDEC3F-AD94-4910-A1F7-B3E308BB6614',
              WFCondition: 'Equals',
            },
          },
          {
            WFWorkflowActionIdentifier: 'is.workflow.actions.alert',
            WFWorkflowActionParameters: {
              WFAlertActionMessage: {
                Value: {
                  string: 'Chatblast failed with the following error: ￼',
                  attachmentsByRange: {
                    '{43, 1}': {
                      VariableName: 'postResult',
                      Type: 'Variable',
                    },
                  },
                },
                WFSerializationType: 'WFTextTokenString',
              },
            },
          },
          {
            WFWorkflowActionIdentifier: 'is.workflow.actions.conditional',
            WFWorkflowActionParameters: {
              GroupingIdentifier: '36BDEC3F-AD94-4910-A1F7-B3E308BB6614',
              WFControlFlowMode: 1,
            },
          },
          {
            WFWorkflowActionIdentifier: 'is.workflow.actions.conditional',
            WFWorkflowActionParameters: {
              GroupingIdentifier: '36BDEC3F-AD94-4910-A1F7-B3E308BB6614',
              WFControlFlowMode: 2,
            },
          },
          {
            WFWorkflowActionIdentifier: 'is.workflow.actions.gettext',
            WFWorkflowActionParameters: {
              WFTextActionText: `slack://channel?id=${channelId}&team=${teamId}`,
            },
          },
        ],
      };
    };

exports.generateMultiShortcutJson = (comment) => {
  return {
    WFWorkflowImportQuestions: [],
    WFWorkflowTypes: [
      'WatchKit',
      'ActionExtension',
    ],
    WFWorkflowInputContentItemClasses: [
      'WFAppStoreAppContentItem',
      'WFArticleContentItem',
      'WFContactContentItem',
      'WFDateContentItem',
      'WFEmailAddressContentItem',
      'WFGenericFileContentItem',
      'WFImageContentItem',
      'WFiTunesProductContentItem',
      'WFLocationContentItem',
      'WFDCMapsLinkContentItem',
      'WFAVAssetContentItem',
      'WFPDFContentItem',
      'WFPhoneNumberContentItem',
      'WFRichTextContentItem',
      'WFSafariWebPageContentItem',
      'WFStringContentItem',
      'WFURLContentItem',
    ],
    WFWorkflowActions: [
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.comment',
        WFWorkflowActionParameters: {
          WFCommentActionText: comment,
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.setvariable',
        WFWorkflowActionParameters: {
          WFVariableName: 'ThingsToSend',
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.getmyworkflows',
        WFWorkflowActionParameters: {},
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.setvariable',
        WFWorkflowActionParameters: {
          WFVariableName: 'AllShortcuts',
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.dictionary',
        WFWorkflowActionParameters: {
          WFItems: {
            Value: {
              WFDictionaryFieldValueItems: [],
            },
            WFSerializationType: 'WFDictionaryFieldValue',
          },
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.setvariable',
        WFWorkflowActionParameters: {
          WFVariableName: 'BlasterShortcuts',
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.getvariable',
        WFWorkflowActionParameters: {
          WFVariable: {
            Value: {
              VariableName: 'AllShortcuts',
              Type: 'Variable',
            },
            WFSerializationType: 'WFTextTokenAttachment',
          },
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.repeat.each',
        WFWorkflowActionParameters: {
          GroupingIdentifier: 'F4FCC9DE-DEB0-4AE6-A07D-E55A12786DD9',
          WFControlFlowMode: 0,
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.getitemfromlist',
        WFWorkflowActionParameters: {
          WFItemSpecifier: 'First Item',
          WFItemIndex: 1,
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.text.match',
        WFWorkflowActionParameters: {
          WFMatchTextPattern: '^s__',
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.conditional',
        WFWorkflowActionParameters: {
          WFConditionalActionString: 's__',
          GroupingIdentifier: '0A3ED4D2-A54C-487C-8044-1EA3DBCC5DB6',
          WFControlFlowMode: 0,
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.getvariable',
        WFWorkflowActionParameters: {
          WFVariable: {
            Value: {
              VariableName: 'BlasterShortcuts',
              Type: 'Variable',
            },
            WFSerializationType: 'WFTextTokenAttachment',
          },
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.setvalueforkey',
        WFWorkflowActionParameters: {
          WFDictionaryValue: {
            Value: {
              string: '￼',
              attachmentsByRange: {
                '{0, 1}': {
                  VariableName: 'Repeat Item',
                  Type: 'Variable',
                },
              },
            },
            WFSerializationType: 'WFTextTokenString',
          },
          WFDictionaryKey: {
            Value: {
              string: '￼',
              attachmentsByRange: {
                '{0, 1}': {
                  VariableName: 'Repeat Item',
                  Type: 'Variable',
                  Aggrandizements: [
                    {
                      PropertyUserInfo: 'WFItemName',
                      Type: 'WFPropertyVariableAggrandizement',
                      PropertyName: 'Name',
                    },
                  ],
                },
              },
            },
            WFSerializationType: 'WFTextTokenString',
          },
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.setvariable',
        WFWorkflowActionParameters: {
          WFVariableName: 'BlasterShortcuts',
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.conditional',
        WFWorkflowActionParameters: {
          GroupingIdentifier: '0A3ED4D2-A54C-487C-8044-1EA3DBCC5DB6',
          WFControlFlowMode: 1,
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.conditional',
        WFWorkflowActionParameters: {
          WFControlFlowMode: 2,
          GroupingIdentifier: '0A3ED4D2-A54C-487C-8044-1EA3DBCC5DB6',
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.repeat.each',
        WFWorkflowActionParameters: {
          GroupingIdentifier: 'F4FCC9DE-DEB0-4AE6-A07D-E55A12786DD9',
          WFControlFlowMode: 2,
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.getvariable',
        WFWorkflowActionParameters: {
          WFVariable: {
            Value: {
              VariableName: 'BlasterShortcuts',
              Type: 'Variable',
            },
            WFSerializationType: 'WFTextTokenAttachment',
          },
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.getvalueforkey',
        WFWorkflowActionParameters: {
          WFGetDictionaryValueType: 'All Keys',
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.filter.files',
        WFWorkflowActionParameters: {
          WFContentItemFilter: {
            Value: {
              WFActionParameterFilterPrefix: 1,
              WFContentPredicateBoundedDate: false,
              WFActionParameterFilterTemplates: [],
            },
            WFSerializationType: 'WFContentPredicateTableTemplate',
          },
          WFContentItemSortProperty: 'Name',
          WFContentItemSortOrder: 'A to Z',
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.choosefromlist',
        WFWorkflowActionParameters: {
          WFChooseFromListActionSelectMultiple: true,
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.setvariable',
        WFWorkflowActionParameters: {
          WFVariableName: 'ChosenBlasterShortcuts',
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.count',
        WFWorkflowActionParameters: {
          WFCountType: 'Items',
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.setvariable',
        WFWorkflowActionParameters: {
          WFVariableName: 'CountOfPlacesToSend',
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.getvariable',
        WFWorkflowActionParameters: {
          WFVariable: {
            Value: {
              VariableName: 'ChosenBlasterShortcuts',
              Type: 'Variable',
            },
            WFSerializationType: 'WFTextTokenAttachment',
          },
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.repeat.each',
        WFWorkflowActionParameters: {
          GroupingIdentifier: '6D94CEFF-7646-4E93-B248-82704F0B2C1B',
          WFControlFlowMode: 0,
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.getvariable',
        WFWorkflowActionParameters: {
          WFVariable: {
            Value: {
              VariableName: 'ThingsToSend',
              Type: 'Variable',
            },
            WFSerializationType: 'WFTextTokenAttachment',
          },
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.runworkflow',
        WFWorkflowActionParameters: {
          WFWorkflowName: {
            Value: {
              VariableName: 'Repeat Item',
              Type: 'Variable',
            },
            WFSerializationType: 'WFTextTokenAttachment',
          },
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.setvariable',
        WFWorkflowActionParameters: {
          WFVariableName: 'ResultOfBlasterShortcut',
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.repeat.each',
        WFWorkflowActionParameters: {
          GroupingIdentifier: '6D94CEFF-7646-4E93-B248-82704F0B2C1B',
          WFControlFlowMode: 2,
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.getvariable',
        WFWorkflowActionParameters: {
          WFVariable: {
            Value: {
              VariableName: 'CountOfPlacesToSend',
              Type: 'Variable',
            },
            WFSerializationType: 'WFTextTokenAttachment',
          },
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.conditional',
        WFWorkflowActionParameters: {
          GroupingIdentifier: 'F71279E4-F6E4-4C6A-8436-63555CEE1B3B',
          WFControlFlowMode: 0,
          WFConditionalActionString: '1',
          WFNumberValue: 1,
          WFCondition: 'Equals',
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.getvariable',
        WFWorkflowActionParameters: {
          WFVariable: {
            Value: {
              VariableName: 'ResultOfBlasterShortcut',
              Type: 'Variable',
            },
            WFSerializationType: 'WFTextTokenAttachment',
          },
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.url',
        WFWorkflowActionParameters: {
          WFURLActionURL: {
            Value: {
              string: '￼',
              attachmentsByRange: {
                '{0, 1}': {
                  VariableName: 'ResultOfBlasterShortcut',
                  Type: 'Variable',
                },
              },
            },
            WFSerializationType: 'WFTextTokenString',
          },
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.openurl',
        WFWorkflowActionParameters: {},
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.conditional',
        WFWorkflowActionParameters: {
          GroupingIdentifier: 'F71279E4-F6E4-4C6A-8436-63555CEE1B3B',
          WFControlFlowMode: 1,
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.conditional',
        WFWorkflowActionParameters: {
          GroupingIdentifier: 'F71279E4-F6E4-4C6A-8436-63555CEE1B3B',
          WFControlFlowMode: 2,
        },
      },
    ],
  };
};
