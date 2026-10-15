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
import {
  analyticsTagIdsField,
  createAnalyticsFiltersProperty,
  getAnalyticsQuery,
} from '../shared';

export class GetContactMetricsOperation extends ResourceOperation {
  public readonly name: string = 'getContactMetrics';

  public readonly displayName: string = 'Get Contact Metrics';

  public readonly description: string = 'Get the contact metrics of the office';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'view',
        displayName: 'View',
        description: 'Which view of the contact metrics to return',
        type: 'options',
        options: [
          {
            name: 'Geographic',
            value: 'geographic',
            description: 'Contacts by region (area code)',
          },
          {
            name: 'Heatmap',
            value: 'heatmap',
            description: 'Contact creation patterns by hour and weekday',
          },
          {
            name: 'Overview',
            value: 'overview',
            description: 'Totals and growth',
          },
          {
            name: 'Sources',
            value: 'sources',
            description: 'Contacts by source',
          },
          {
            name: 'Stages',
            value: 'stages',
            description: 'Contacts by funnel stage',
          },
          {
            name: 'Tags',
            value: 'tags',
            description: 'Contacts by tag',
          },
        ],
        default: 'overview',
      },
      createAnalyticsFiltersProperty([analyticsTagIdsField]),
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const view: string = this.getNodeParameter('view', itemIndex) as string;

    const response: ApiResponse = await httpClient.get<ApiResponse>(
      this,
      'analytics/contacts',
      getAnalyticsQuery.call(this, itemIndex, { view }),
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
