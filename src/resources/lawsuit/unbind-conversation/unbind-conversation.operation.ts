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

export class UnbindConversationOperation extends ResourceOperation {
  public readonly name: string = 'unbindConversation';

  public readonly displayName: string = 'Unbind Conversation';

  public readonly description: string =
    'Unbind a conversation from an office lawsuit';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      cnjProperty,
      {
        ...conversationIdProperty,
        description:
          'The ID (UUID) of the conversation to unbind. When it is the last bound conversation, the lawsuit link is archived.',
      },
    ],
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
    >(this, getLawsuitPath(cnj), { conversation_id: conversationId });

    return {
      json: response?.data ?? { success: true },
      pairedItem: itemIndex,
    };
  }
}
