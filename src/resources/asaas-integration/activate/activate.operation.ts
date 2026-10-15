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
import { asaasApiKeyProperty } from '../shared';

export class ActivateOperation extends ResourceOperation {
  public readonly name: string = 'activate';

  public readonly displayName: string = 'Activate';

  public readonly description: string =
    'Activate the Asaas integration (deprecated by the API)';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'deprecationNotice',
        displayName:
          'This endpoint is deprecated and always answers 410 Gone. Connect Asaas from Settings → Integrations → Asaas in ChatJuridico.',
        type: 'notice',
        default: '',
      },
      asaasApiKeyProperty,
      {
        name: 'environment',
        displayName: 'Environment',
        type: 'options',
        options: [
          { name: 'Production', value: 'production' },
          { name: 'Sandbox', value: 'sandbox' },
        ],
        default: 'production',
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const apiKey: string = this.getNodeParameter('apiKey', itemIndex) as string;

    const environment: string = this.getNodeParameter(
      'environment',
      itemIndex,
    ) as string;

    const response: Partial<ApiResponse> = await httpClient.post<
      Partial<ApiResponse>
    >(this, 'integrations/asaas/activate', {
      api_key: apiKey,
      environment,
    });

    return {
      json: response.data ?? response,
      pairedItem: itemIndex,
    };
  }
}
