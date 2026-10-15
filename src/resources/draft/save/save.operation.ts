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

export class SaveOperation extends ResourceOperation {
  public readonly name: string = 'save';

  public readonly displayName: string = 'Save';

  public readonly description: string =
    'Create or replace the message draft of a conversation';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      conversationIdProperty,
      {
        name: 'draftText',
        displayName: 'Draft Text',
        description: 'Text of the draft (1 to 10000 characters)',
        type: 'string',
        typeOptions: {
          rows: 4,
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
    const conversationId: string = this.getNodeParameter(
      'conversationId',
      itemIndex,
    ) as string;

    const draftText: string = this.getNodeParameter(
      'draftText',
      itemIndex,
    ) as string;

    const response: ApiResponse = await httpClient.put<ApiResponse>(
      this,
      `conversations/${conversationId}/draft`,
      undefined,
      { draft_text: draftText },
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
