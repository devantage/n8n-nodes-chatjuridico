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
import { conversationIdProperty } from '../../conversation/shared';
import { messageIdProperty } from '../shared';

export class DeleteOperation extends ResourceOperation {
  public readonly name: string = 'delete';

  public readonly displayName: string = 'Delete';

  public readonly description: string =
    'Delete a message sent by the office and revoke it on WhatsApp';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [conversationIdProperty, messageIdProperty],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const conversationId: string = this.getNodeParameter(
      'conversationId',
      itemIndex,
    ) as string;

    const messageId: string = this.getNodeParameter(
      'messageId',
      itemIndex,
    ) as string;

    const response: ApiResponse = await httpClient.delete<ApiResponse>(
      this,
      `conversations/${conversationId}/messages/${messageId}`,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
