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
  withOperationDisplayOptions,
} from '../../../utils';
import { conversationIdProperty } from '../../conversation/shared';

export class CreateOperation extends ResourceOperation {
  public readonly name: string = 'create';

  public readonly displayName: string = 'Create';

  public readonly description: string =
    'Add an internal note to a conversation';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      conversationIdProperty,
      {
        name: 'text',
        displayName: 'Text',
        description:
          'Text of the note (1 to 5000 characters). Mentions can be embedded as @[uuid|Name].',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        required: true,
        default: '',
      },
      {
        name: 'additionalFields',
        displayName: 'Additional Fields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        options: [
          {
            name: 'mentions',
            displayName: 'Mention Member Names or IDs',
            description:
              'Members to mention (up to 50). Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
            type: 'multiOptions',
            typeOptions: {
              loadOptionsMethod: 'getMemberOptions',
            },
            default: [],
          },
          {
            name: 'send_email',
            displayName: 'Send Email',
            description:
              'Whether mentions of this note may trigger emails. In-app notifications are not affected.',
            type: 'boolean',
            default: true,
          },
        ],
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const conversationId: string = this.getNodeParameter(
      'conversationId',
      itemIndex,
    ) as string;

    const text: string = this.getNodeParameter('text', itemIndex) as string;

    const additionalFields: IDataObject = this.getNodeParameter(
      'additionalFields',
      itemIndex,
      {},
    );

    const mentions: string[] | undefined = additionalFields.mentions as
      string[] | undefined;

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      `conversations/${conversationId}/annotations`,
      compactObject({
        ...additionalFields,
        text,
        mentions: mentions?.length ? mentions : undefined,
      }),
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
