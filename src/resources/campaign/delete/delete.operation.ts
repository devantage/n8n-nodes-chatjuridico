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
import { campaignIdProperty } from '../shared';

export class DeleteOperation extends ResourceOperation {
  public readonly name: string = 'delete';

  public readonly displayName: string = 'Delete';

  public readonly description: string = 'Delete a campaign';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [campaignIdProperty],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const campaignId: string = this.getNodeParameter(
      'campaignId',
      itemIndex,
    ) as string;

    const response: ApiResponse = await httpClient.delete<ApiResponse>(
      this,
      `campaigns/${campaignId}`,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
