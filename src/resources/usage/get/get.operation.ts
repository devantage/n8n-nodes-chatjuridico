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

export class GetOperation extends ResourceOperation {
  public readonly name: string = 'get';

  public readonly displayName: string = 'Get';

  public readonly description: string =
    'Get the API usage statistics of the API key';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'days',
        displayName: 'Days',
        description: 'Number of days of the analyzed period',
        type: 'number',
        typeOptions: {
          minValue: 1,
          maxValue: 30,
        },
        default: 7,
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const days: number = this.getNodeParameter('days', itemIndex, 7) as number;

    const response: ApiResponse = await httpClient.get<ApiResponse>(
      this,
      'usage',
      { days },
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
