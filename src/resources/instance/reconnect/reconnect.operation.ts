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
import { instanceIdProperty } from '../shared';

export class ReconnectOperation extends ResourceOperation {
  public readonly name: string = 'reconnect';

  public readonly displayName: string = 'Reconnect';

  public readonly description: string = 'Reconnect a WhatsApp number';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [instanceIdProperty],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const instanceId: string = this.getNodeParameter(
      'instanceId',
      itemIndex,
    ) as string;

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      `instances/${instanceId}/reconnect`,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
