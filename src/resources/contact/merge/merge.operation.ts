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

export class MergeOperation extends ResourceOperation {
  public readonly name: string = 'merge';

  public readonly displayName: string = 'Merge';

  public readonly description: string =
    'Merge a duplicate contact into a primary contact';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'keeperId',
        displayName: 'Primary Contact ID',
        description: 'ID of the primary contact to keep',
        type: 'string',
        required: true,
        default: '',
      },
      {
        name: 'loserId',
        displayName: 'Duplicate Contact ID',
        description:
          'ID of the duplicate contact to absorb. It is deactivated after merging and the operation is irreversible.',
        type: 'string',
        required: true,
        default: '',
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const keeperId: string = this.getNodeParameter(
      'keeperId',
      itemIndex,
    ) as string;

    const loserId: string = this.getNodeParameter(
      'loserId',
      itemIndex,
    ) as string;

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      'contacts/merge',
      { keeper_id: keeperId, loser_id: loserId },
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
