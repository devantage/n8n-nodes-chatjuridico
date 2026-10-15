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
import { conversationIdProperty } from '../shared';

export class DeactivateOperation extends ResourceOperation {
  public readonly name: string = 'deactivate';

  public readonly displayName: string = 'Deactivate';

  public readonly description: string =
    'Deactivate the AI agent in a conversation';

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

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      `conversations/${conversationId}/agent/deactivate`,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
