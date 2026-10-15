import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import {
  type ApiResponse,
  httpClient,
  withOperationDisplayOptions,
} from '../../../utils';

export class FillDataOperation extends ResourceOperation {
  public readonly name: string = 'fillData';

  public readonly displayName: string = 'Fill Data';

  public readonly description: string =
    'Extract suggested payment data from a conversation using AI';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'conversationId',
        displayName: 'Conversation ID',
        description: 'ID of the conversation to extract the payment data from',
        type: 'string',
        required: true,
        default: '',
      },
      {
        name: 'contactId',
        displayName: 'Contact ID',
        type: 'string',
        required: true,
        default: '',
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

    const contactId: string = this.getNodeParameter(
      'contactId',
      itemIndex,
    ) as string;

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      'payments/fill-data',
      { conversation_id: conversationId, contact_id: contactId },
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
