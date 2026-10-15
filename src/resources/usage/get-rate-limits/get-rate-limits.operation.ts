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

export class GetRateLimitsOperation extends ResourceOperation {
  public readonly name: string = 'getRateLimits';

  public readonly displayName: string = 'Get Rate Limits';

  public readonly description: string =
    'Get the rate limits configured for each operation tier';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const response: ApiResponse = await httpClient.get<ApiResponse>(
      this,
      'usage/rate-limits',
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
