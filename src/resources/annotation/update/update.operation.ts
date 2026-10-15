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
import { annotationIdProperty } from '../shared';

export class UpdateOperation extends ResourceOperation {
  public readonly name: string = 'update';

  public readonly displayName: string = 'Update';

  public readonly description: string = 'Update the text of a note';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      conversationIdProperty,
      annotationIdProperty,
      {
        name: 'text',
        displayName: 'Text',
        description: 'New text of the note (1 to 5000 characters)',
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

    const annotationId: string = this.getNodeParameter(
      'annotationId',
      itemIndex,
    ) as string;

    const text: string = this.getNodeParameter('text', itemIndex) as string;

    const response: ApiResponse = await httpClient.patch<ApiResponse>(
      this,
      `conversations/${conversationId}/annotations/${annotationId}`,
      undefined,
      { text },
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
