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

export class DailyCountOperation extends ResourceOperation {
  public readonly name: string = 'dailyCount';

  public readonly displayName: string = 'Daily Count';

  public readonly description: string =
    'Get the number of AI agent sessions grouped by day';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'dateStart',
        displayName: 'Date Start',
        description: 'Start of the period',
        type: 'dateTime',
        required: true,
        default: '',
      },
      {
        name: 'dateEnd',
        displayName: 'Date End',
        description: 'End of the period',
        type: 'dateTime',
        required: true,
        default: '',
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const dateStart: string = this.getNodeParameter(
      'dateStart',
      itemIndex,
    ) as string;

    const dateEnd: string = this.getNodeParameter(
      'dateEnd',
      itemIndex,
    ) as string;

    const response: ApiResponse = await httpClient.get<ApiResponse>(
      this,
      'agent-sessions/daily-count',
      { date_start: dateStart, date_end: dateEnd },
    );

    return {
      json: response,
      pairedItem: itemIndex,
    };
  }
}
