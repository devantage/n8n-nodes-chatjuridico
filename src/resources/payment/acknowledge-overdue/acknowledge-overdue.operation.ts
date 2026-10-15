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
import { paymentIdProperty } from '../shared';

export class AcknowledgeOverdueOperation extends ResourceOperation {
  public readonly name: string = 'acknowledgeOverdue';

  public readonly displayName: string = 'Acknowledge Overdue';

  public readonly description: string =
    'Mark an overdue payment as acknowledged by the team';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [paymentIdProperty],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const paymentId: string = this.getNodeParameter(
      'paymentId',
      itemIndex,
    ) as string;

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      `payments/${paymentId}/acknowledge-overdue`,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
