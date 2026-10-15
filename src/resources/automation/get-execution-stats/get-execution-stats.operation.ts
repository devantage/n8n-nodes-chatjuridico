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
import { automationIdProperty } from '../shared';

export class GetExecutionStatsOperation extends ResourceOperation {
  public readonly name: string = 'getExecutionStats';

  public readonly displayName: string = 'Get Execution Stats';

  public readonly description: string =
    'Get the aggregated execution statistics of an automation';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [automationIdProperty],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const automationId: string = this.getNodeParameter(
      'automationId',
      itemIndex,
    ) as string;

    const response: ApiResponse = await httpClient.get<ApiResponse>(
      this,
      `automations/${automationId}/executions/stats`,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
