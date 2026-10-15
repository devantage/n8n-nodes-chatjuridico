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
import { draftIdProperty } from '../shared';

export class SendDraftOperation extends ResourceOperation {
  public readonly name: string = 'sendDraft';

  public readonly displayName: string = 'Send Draft';

  public readonly description: string =
    'Send a draft document for signature. It must have a file and at least one signer.';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [draftIdProperty],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const draftId: string = this.getNodeParameter(
      'draftId',
      itemIndex,
    ) as string;

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      `signatures/drafts/${draftId}/send`,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
