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

export class DeactivateOperation extends ResourceOperation {
  public readonly name: string = 'deactivate';

  public readonly displayName: string = 'Deactivate';

  public readonly description: string =
    'Deactivate the Asaas integration, removing its webhooks and stored credentials';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      'integrations/asaas/deactivate',
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
