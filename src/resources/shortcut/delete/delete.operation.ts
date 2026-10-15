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
import { shortcutIdProperty } from '../shared';

export class DeleteOperation extends ResourceOperation {
  public readonly name: string = 'delete';

  public readonly displayName: string = 'Delete';

  public readonly description: string = 'Delete a message shortcut';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [shortcutIdProperty],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const shortcutId: string = this.getNodeParameter(
      'shortcutId',
      itemIndex,
    ) as string;

    const response: ApiResponse = await httpClient.delete<ApiResponse>(
      this,
      `shortcuts/${shortcutId}`,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
