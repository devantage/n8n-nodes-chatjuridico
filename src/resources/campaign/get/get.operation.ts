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

export class GetOperation extends ResourceOperation {
  public readonly name: string = 'get';

  public readonly displayName: string = 'Get';

  public readonly description: string = 'Get a campaign';

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

    const response: ApiResponse = await httpClient.get<ApiResponse>(
      this,
      `campaigns/${campaignId}`,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
