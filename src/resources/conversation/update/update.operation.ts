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

export class UpdateOperation extends ResourceOperation {
  public readonly name: string = 'update';

  public readonly displayName: string = 'Update';

  public readonly description: string = 'Update a conversation';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      conversationIdProperty,
      {
        name: 'updateFields',
        displayName: 'Update Fields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        options: [
          {
            name: 'tag_ids',
            displayName: 'Tag Names or IDs',
            description:
              'Tags of the conversation. Replaces all current tags. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
            type: 'multiOptions',
            typeOptions: {
              loadOptionsMethod: 'getTagOptions',
            },
            default: [],
          },
          {
            name: 'stage_id',
            displayName: 'Funnel Stage Name or ID',
            description:
              'Funnel stage to move the conversation to. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
            type: 'options',
            typeOptions: {
              loadOptionsMethod: 'getFunnelStageOptions',
            },
            default: '',
          },
          {
            name: 'is_archived',
            displayName: 'Is Archived',
            description: 'Whether to archive (true) or unarchive (false)',
            type: 'boolean',
            default: false,
          },
          {
            name: 'accountable_id',
            displayName: 'Responsible Member Name or ID',
            description:
              'Member responsible for the conversation. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
            type: 'options',
            typeOptions: {
              loadOptionsMethod: 'getMemberOptions',
            },
            default: '',
          },
          {
            name: 'department_id',
            displayName: 'Department ID',
            description:
              'ID (UUID) of the department (queue) to delegate the conversation to',
            type: 'string',
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

    const body: IDataObject = compactObject(
      this.getNodeParameter('updateFields', itemIndex, {}),
    );

    if (!Object.keys(body).length) {
      throw new NodeOperationError(
        this.getNode(),
        'Please add at least one field to update',
        { itemIndex },
      );
    }

    const response: ApiResponse = await httpClient.patch<ApiResponse>(
      this,
      `conversations/${conversationId}`,
      undefined,
      body,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
