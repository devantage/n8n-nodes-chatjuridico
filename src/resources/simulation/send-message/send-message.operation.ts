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
import { simulationIdProperty } from '../shared';

export class SendMessageOperation extends ResourceOperation {
  public readonly name: string = 'sendMessage';

  public readonly displayName: string = 'Send Message';

  public readonly description: string =
    'Send a test message in an AI agent simulation session';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      simulationIdProperty,
      {
        name: 'messageText',
        displayName: 'Message Text',
        description: 'Text of the message (max 4096 characters)',
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
            name: 'message_type',
            displayName: 'Message Type',
            description: 'Type of the message',
            type: 'string',
            default: 'text',
          },
        ],
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const simulationId: string = this.getNodeParameter(
      'simulationId',
      itemIndex,
    ) as string;

    const messageText: string = this.getNodeParameter(
      'messageText',
      itemIndex,
    ) as string;

    const additionalFields: IDataObject = this.getNodeParameter(
      'additionalFields',
      itemIndex,
      {},
    );

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      `simulations/${simulationId}/messages`,
      compactObject({ ...additionalFields, message_text: messageText }),
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
