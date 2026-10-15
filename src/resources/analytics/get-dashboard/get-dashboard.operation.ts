import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IDataObject,
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

export class GetDashboardOperation extends ResourceOperation {
  public readonly name: string = 'getDashboard';

  public readonly displayName: string = 'Get Dashboard';

  public readonly description: string =
    'Get the aggregated metrics of the office';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      createAnalyticsFiltersProperty(),
      {
        name: 'options',
        displayName: 'Options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            name: 'compare',
            displayName: 'Compare With Previous Period',
            description:
              'Whether to include the percentage change compared to the previous period',
            type: 'boolean',
            default: false,
          },
        ],
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const options: IDataObject = this.getNodeParameter(
      'options',
      itemIndex,
      {},
    );

    const response: ApiResponse = await httpClient.get<ApiResponse>(
      this,
      'analytics/dashboard',
      getAnalyticsQuery.call(this, itemIndex, options),
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
