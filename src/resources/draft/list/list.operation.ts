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

export class ListOperation extends ResourceOperation {
  public readonly name: string = 'list';

  public readonly displayName: string = 'List';

  public readonly description: string =
    'List the pending message drafts of the office, newest first';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'limit',
        displayName: 'Limit',
        description: 'Max number of results to return',
        type: 'number',
        typeOptions: {
          minValue: 1,
          maxValue: 100,
        },
        default: 50,
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const limit: number = this.getNodeParameter('limit', itemIndex);

    const response: ApiResponse = await httpClient.get<ApiResponse>(
      this,
      'drafts',
      { limit },
    );

    return {
      json: response,
      pairedItem: itemIndex,
    };
  }
}
