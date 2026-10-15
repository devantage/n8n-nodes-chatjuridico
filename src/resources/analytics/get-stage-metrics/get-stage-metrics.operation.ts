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

export class GetStageMetricsOperation extends ResourceOperation {
  public readonly name: string = 'getStageMetrics';

  public readonly displayName: string = 'Get Stage Metrics';

  public readonly description: string = 'Get the metrics of each funnel stage';

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
      'analytics/stages',
      getAnalyticsQuery.call(this, itemIndex),
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
