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

export class CancelOperation extends ResourceOperation {
  public readonly name: string = 'cancel';

  public readonly displayName: string = 'Cancel';

  public readonly description: string =
    'Cancel a scheduled, paused or running campaign';

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

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      `campaigns/${campaignId}/cancel`,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
