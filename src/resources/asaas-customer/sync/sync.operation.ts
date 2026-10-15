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
import { asaasContactIdProperty } from '../shared';

export class SyncOperation extends ResourceOperation {
  public readonly name: string = 'sync';

  public readonly displayName: string = 'Sync';

  public readonly description: string =
    'Sync a contact with its Asaas customer record';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [asaasContactIdProperty],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const contactId: string = this.getNodeParameter(
      'contactId',
      itemIndex,
    ) as string;

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      'payments/customers/sync',
      { contact_id: contactId },
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
