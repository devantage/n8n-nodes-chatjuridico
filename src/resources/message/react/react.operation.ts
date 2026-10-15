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
import { conversationIdProperty } from '../../conversation/shared';
import { messageIdProperty } from '../shared';

export class ReactOperation extends ResourceOperation {
  public readonly name: string = 'react';

  public readonly displayName: string = 'React';

  public readonly description: string = 'React to a message with an emoji';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      conversationIdProperty,
      messageIdProperty,
      {
        name: 'emoji',
        displayName: 'Emoji',
        description: 'Emoji of the reaction (e.g. 👍)',
        type: 'string',
        required: true,
        default: '',
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const conversationId: string = this.getNodeParameter(
      'conversationId',
      itemIndex,
    ) as string;

    const messageId: string = this.getNodeParameter(
      'messageId',
      itemIndex,
    ) as string;

    const emoji: string = this.getNodeParameter('emoji', itemIndex) as string;

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      `conversations/${conversationId}/messages/${messageId}/react`,
      { emoji },
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
