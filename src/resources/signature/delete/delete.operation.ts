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
import { documentIdProperty } from '../shared';

export class DeleteOperation extends ResourceOperation {
  public readonly name: string = 'delete';

  public readonly displayName: string = 'Delete';

  public readonly description: string =
    'Delete a signature document. Pending or partially signed documents cannot be deleted.';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [documentIdProperty],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const documentId: string = this.getNodeParameter(
      'documentId',
      itemIndex,
    ) as string;

    const response: ApiResponse = await httpClient.delete<ApiResponse>(
      this,
      `signatures/${documentId}`,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
