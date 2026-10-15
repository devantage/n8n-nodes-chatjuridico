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

export class SyncCreditsOperation extends ResourceOperation {
  public readonly name: string = 'syncCredits';

  public readonly displayName: string = 'Sync Credits';

  public readonly description: string =
    'Refresh the signature credit balance from ZapSign';

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
      'integrations/zapsign/sync-credits',
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
