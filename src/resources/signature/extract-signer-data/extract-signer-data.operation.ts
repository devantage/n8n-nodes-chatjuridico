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

export class ExtractSignerDataOperation extends ResourceOperation {
  public readonly name: string = 'extractSignerData';

  public readonly displayName: string = 'Extract Signer Data';

  public readonly description: string =
    'Extract the signer data (email, address, CPF) from a conversation using AI';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'conversationId',
        displayName: 'Conversation ID',
        description: 'The ID (UUID) of the conversation to analyze',
        type: 'string',
        required: true,
        default: '',
      },
      {
        name: 'contactId',
        displayName: 'Contact ID',
        description: 'The ID (UUID) of the contact',
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
      'signatures/extract-signer-data',
      { conversation_id: conversationId, contact_id: contactId },
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
