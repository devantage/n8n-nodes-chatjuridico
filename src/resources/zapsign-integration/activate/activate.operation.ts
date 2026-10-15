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

export class ActivateOperation extends ResourceOperation {
  public readonly name: string = 'activate';

  public readonly displayName: string = 'Activate';

  public readonly description: string =
    'Activate the ZapSign integration with an API key';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'apiKey',
        displayName: 'API Key',
        description:
          'ZapSign API key. It is validated and the webhooks are registered automatically.',
        type: 'string',
        typeOptions: {
          password: true,
        },
        required: true,
        default: '',
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const apiKey: string = this.getNodeParameter('apiKey', itemIndex) as string;

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      'integrations/zapsign/activate',
      { api_key: apiKey },
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
