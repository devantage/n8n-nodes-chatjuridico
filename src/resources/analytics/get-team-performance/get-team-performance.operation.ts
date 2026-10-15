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
  analyticsUserIdField,
  createAnalyticsFiltersProperty,
  getAnalyticsQuery,
} from '../shared';

export class GetTeamPerformanceOperation extends ResourceOperation {
  public readonly name: string = 'getTeamPerformance';

  public readonly displayName: string = 'Get Team Performance';

  public readonly description: string =
    'Get the performance metrics of each team member';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [createAnalyticsFiltersProperty([analyticsUserIdField])],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const response: ApiResponse = await httpClient.get<ApiResponse>(
      this,
      'analytics/team',
      getAnalyticsQuery.call(this, itemIndex),
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
