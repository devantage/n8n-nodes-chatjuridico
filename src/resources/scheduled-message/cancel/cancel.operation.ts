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
import { scheduledMessageIdProperty } from '../shared';

export class CancelOperation extends ResourceOperation {
  public readonly name: string = 'cancel';

  public readonly displayName: string = 'Cancel';

  public readonly description: string =
    'Cancel a scheduled message that is still pending';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [scheduledMessageIdProperty],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const scheduledMessageId: string = this.getNodeParameter(
      'scheduledMessageId',
      itemIndex,
    ) as string;

    const response: ApiResponse = await httpClient.delete<ApiResponse>(
      this,
      `scheduled-messages/${scheduledMessageId}`,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
