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

export class DeleteOperation extends ResourceOperation {
  public readonly name: string = 'delete';

  public readonly displayName: string = 'Delete';

  public readonly description: string =
    'Delete the message draft of a conversation';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [conversationIdProperty],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const conversationId: string = this.getNodeParameter(
      'conversationId',
      itemIndex,
    ) as string;

    const response: ApiResponse = await httpClient.delete<ApiResponse>(
      this,
      `conversations/${conversationId}/draft`,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
