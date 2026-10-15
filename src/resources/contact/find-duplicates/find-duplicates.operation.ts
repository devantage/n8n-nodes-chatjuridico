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

export class FindDuplicatesOperation extends ResourceOperation {
  public readonly name: string = 'findDuplicates';

  public readonly displayName: string = 'Find Duplicates';

  public readonly description: string = 'Find potentially duplicate contacts';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'limit',
        displayName: 'Limit',
        description: 'Max number of duplicate pairs to return',
        type: 'number',
        typeOptions: {
          minValue: 1,
          maxValue: 200,
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
      'contacts/duplicates',
      { limit },
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
