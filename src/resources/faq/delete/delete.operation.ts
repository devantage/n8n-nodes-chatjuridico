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
import { agentIdProperty, faqItemIdProperty } from '../shared';

export class DeleteOperation extends ResourceOperation {
  public readonly name: string = 'delete';

  public readonly displayName: string = 'Delete';

  public readonly description: string = 'Delete an FAQ item of an AI agent';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [agentIdProperty, faqItemIdProperty],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const agentId: string = this.getNodeParameter(
      'agentId',
      itemIndex,
    ) as string;

    const itemId: string = this.getNodeParameter('itemId', itemIndex) as string;

    const response: ApiResponse = await httpClient.delete<ApiResponse>(
      this,
      `agents/${agentId}/faq/${itemId}`,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
