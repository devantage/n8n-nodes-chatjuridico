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

export class DetectEnvironmentOperation extends ResourceOperation {
  public readonly name: string = 'detectEnvironment';

  public readonly displayName: string = 'Detect Environment';

  public readonly description: string =
    'Detect whether an Asaas API key belongs to production or sandbox';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [asaasApiKeyProperty],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const apiKey: string = this.getNodeParameter('apiKey', itemIndex) as string;

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      'integrations/asaas/detect-env',
      { api_key: apiKey },
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
