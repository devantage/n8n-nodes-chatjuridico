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

export class GetQrCodeOperation extends ResourceOperation {
  public readonly name: string = 'getQrCode';

  public readonly displayName: string = 'Get QR Code';

  public readonly description: string =
    'Get the QR code to connect a UAZAPI WhatsApp number';

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

    const response: ApiResponse = await httpClient.get<ApiResponse>(
      this,
      `instances/${instanceId}/qr-code`,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
