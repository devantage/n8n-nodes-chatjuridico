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
import { cnjProperty, conversationIdProperty, getLawsuitPath } from '../shared';

export class ClearActiveOperation extends ResourceOperation {
  public readonly name: string = 'clearActive';

  public readonly displayName: string = 'Clear Active';

  public readonly description: string =
    'Remove a lawsuit from the active lawsuits of a conversation';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [cnjProperty, conversationIdProperty],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const cnj: string = this.getNodeParameter('cnj', itemIndex) as string;

    const conversationId: string = this.getNodeParameter(
      'conversationId',
      itemIndex,
    ) as string;

    const response: ApiResponse | undefined = await httpClient.delete<
      ApiResponse | undefined
    >(this, getLawsuitPath(cnj, '/active'), {
      conversation_id: conversationId,
    });

    return {
      json: response?.data ?? { success: true },
      pairedItem: itemIndex,
    };
  }
}
