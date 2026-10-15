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

export class GetStatusOperation extends ResourceOperation {
  public readonly name: string = 'getStatus';

  public readonly displayName: string = 'Get Status';

  public readonly description: string =
    'Get the status of the Asaas integration';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const response: ApiResponse = await httpClient.get<ApiResponse>(
      this,
      'integrations/asaas',
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
