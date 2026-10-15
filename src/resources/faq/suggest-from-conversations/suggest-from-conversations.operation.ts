import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import {
  type ApiResponse,
  compactObject,
  httpClient,
  splitList,
  withOperationDisplayOptions,
} from '../../../utils';
import { agentIdProperty } from '../shared';

export class SuggestFromConversationsOperation extends ResourceOperation {
  public readonly name: string = 'suggestFromConversations';

  public readonly displayName: string = 'Suggest From Conversations';

  public readonly description: string =
    'Suggest FAQ items with AI from recent conversations (items are not saved)';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      agentIdProperty,
      {
        name: 'options',
        displayName: 'Options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            name: 'conversation_ids',
            displayName: 'Conversation IDs',
            description:
              'Comma separated list of specific conversation IDs to analyze (max 20)',
            type: 'string',
            default: '',
          },
          {
            name: 'days',
            displayName: 'Days',
            description: 'Period in days to look for recent conversations',
            type: 'number',
            typeOptions: {
              minValue: 1,
              maxValue: 30,
            },
            default: 7,
          },
          {
            name: 'limit',
            displayName: 'Limit',
            description: 'Max number of suggestions',
            type: 'number',
            typeOptions: {
              minValue: 1,
              maxValue: 30,
            },
            default: 10,
          },
        ],
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const agentId: string = this.getNodeParameter(
      'agentId',
      itemIndex,
    ) as string;

    const options: IDataObject = this.getNodeParameter(
      'options',
      itemIndex,
      {},
    );

    const conversationIds: string[] = splitList(
      options.conversation_ids as string | undefined,
    );

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      `agents/${agentId}/faq/suggest-from-conversations`,
      compactObject({
        ...options,
        conversation_ids: conversationIds.length ? conversationIds : undefined,
      }),
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
