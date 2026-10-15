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

export class GetResponseTimesOperation extends ResourceOperation {
  public readonly name: string = 'getResponseTimes';

  public readonly displayName: string = 'Get Response Times';

  public readonly description: string =
    'Get the first response time and average response time metrics';

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
            name: 'group_by',
            displayName: 'Group By',
            description: 'How the periods are grouped',
            type: 'options',
            options: [
              { name: 'Day', value: 'day' },
              { name: 'Week', value: 'week' },
              { name: 'Month', value: 'month' },
              { name: 'Quarter', value: 'quarter' },
            ],
            default: 'day',
          },
          {
            name: 'business_hours_only',
            displayName: 'Business Hours Only',
            description:
              'Whether to consider only business hours (Mon-Fri 08:00-18:00 BRT)',
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
      'analytics/response-times',
      getAnalyticsQuery.call(this, itemIndex, options),
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
