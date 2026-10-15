import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import {
  type IDataObject,
  type IExecuteFunctions,
  type INodeExecutionData,
  type INodeProperties,
  NodeOperationError,
} from 'n8n-workflow';

import {
  type ApiResponse,
  compactObject,
  httpClient,
  withOperationDisplayOptions,
} from '../../../utils';
import { conversationIdProperty } from '../shared';

export class TransferOperation extends ResourceOperation {
  public readonly name: string = 'transfer';

  public readonly displayName: string = 'Transfer';

  public readonly description: string =
    'Transfer a conversation to a member and/or department';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      conversationIdProperty,
      {
        name: 'memberId',
        displayName: 'Member Name or ID',
        description:
          'Member to transfer the conversation to. Leave empty to transfer only to a department. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getMemberOptions',
        },
        default: '',
      },
      {
        name: 'additionalFields',
        displayName: 'Additional Fields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        options: [
          {
            name: 'department_id',
            displayName: 'Department ID',
            description:
              'ID (UUID) of the department (queue) to transfer the conversation to',
            type: 'string',
            default: '',
          },
          {
            name: 'note',
            displayName: 'Note',
            description:
              'Reason for the transfer. Creates a note in the conversation (up to 5000 characters).',
            type: 'string',
            typeOptions: {
              rows: 4,
            },
            default: '',
          },
        ],
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

    const memberId: string = this.getNodeParameter(
      'memberId',
      itemIndex,
      '',
    ) as string;

    const additionalFields: IDataObject = this.getNodeParameter(
      'additionalFields',
      itemIndex,
      {},
    );

    const body: IDataObject = compactObject({
      ...additionalFields,
      member_id: memberId,
    });

    if (!body.member_id && !body.department_id) {
      throw new NodeOperationError(
        this.getNode(),
        'Please specify a member and/or a department to transfer the conversation to',
        { itemIndex },
      );
    }

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      `conversations/${conversationId}/transfer`,
      body,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
