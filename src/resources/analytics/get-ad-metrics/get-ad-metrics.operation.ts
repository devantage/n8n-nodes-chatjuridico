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
import { createAnalyticsFiltersProperty, getAnalyticsQuery } from '../shared';

export class GetAdMetricsOperation extends ResourceOperation {
  public readonly name: string = 'getAdMetrics';

  public readonly displayName: string = 'Get Ad Metrics';

  public readonly description: string =
    'Get the metrics of conversations started from Click-to-WhatsApp ads';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [createAnalyticsFiltersProperty()],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const response: ApiResponse = await httpClient.get<ApiResponse>(
      this,
      'analytics/ads',
      getAnalyticsQuery.call(this, itemIndex),
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
