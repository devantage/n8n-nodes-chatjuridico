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
import { webhookIdProperty } from '../shared';

export class TestOperation extends ResourceOperation {
  public readonly name: string = 'test';

  public readonly displayName: string = 'Test';

  public readonly description: string = 'Send a test event to a webhook';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [webhookIdProperty],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const webhookId: string = this.getNodeParameter(
      'webhookId',
      itemIndex,
    ) as string;

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      `webhooks/${webhookId}/test`,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
