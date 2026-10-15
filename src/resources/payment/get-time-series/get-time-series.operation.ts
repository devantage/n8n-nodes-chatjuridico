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
import { buildDashboardQuery, dashboardFilterFields } from '../shared';

export class GetTimeSeriesOperation extends ResourceOperation {
  public readonly name: string = 'getTimeSeries';

  public readonly displayName: string = 'Get Time Series';

  public readonly description: string =
    'Get payment values aggregated by period';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'groupBy',
        displayName: 'Group By',
        type: 'options',
        options: [
          { name: 'Day', value: 'day' },
          { name: 'Week', value: 'week' },
          { name: 'Month', value: 'month' },
        ],
        default: 'day',
      },
      {
        name: 'filters',
        displayName: 'Filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        options: dashboardFilterFields,
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const groupBy: string = this.getNodeParameter(
      'groupBy',
      itemIndex,
    ) as string;

    const filters: IDataObject = this.getNodeParameter(
      'filters',
      itemIndex,
      {},
    );

    const response: ApiResponse = await httpClient.get<ApiResponse>(
      this,
      'payments/dashboard/time-series',
      buildDashboardQuery({ ...filters, group_by: groupBy }),
    );

    return {
      json: response,
      pairedItem: itemIndex,
    };
  }
}
