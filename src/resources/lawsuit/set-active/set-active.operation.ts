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

export class SetActiveOperation extends ResourceOperation {
  public readonly name: string = 'setActive';

  public readonly displayName: string = 'Set Active';

  public readonly description: string =
    'Set a lawsuit as the active one of a conversation (used by the AI)';

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

    const response: ApiResponse | undefined = await httpClient.put<
      ApiResponse | undefined
    >(this, getLawsuitPath(cnj, '/active'), undefined, {
      conversation_id: conversationId,
    });

    return {
      json: response?.data ?? { success: true },
      pairedItem: itemIndex,
    };
  }
}
