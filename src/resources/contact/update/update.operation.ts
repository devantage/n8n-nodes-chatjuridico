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
  splitList,
  withOperationDisplayOptions,
} from '../../../utils';
import { contactIdProperty } from '../shared';

export class UpdateOperation extends ResourceOperation {
  public readonly name: string = 'update';

  public readonly displayName: string = 'Update';

  public readonly description: string = 'Update a contact';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      contactIdProperty,
      {
        name: 'updateFields',
        displayName: 'Update Fields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        options: [
          {
            name: 'name',
            displayName: 'Name',
            type: 'string',
            default: '',
          },
          {
            name: 'phone',
            displayName: 'Phone',
            description: 'Phone in international format',
            type: 'string',
            default: '',
          },
          {
            name: 'tags',
            displayName: 'Tags',
            description:
              'Comma separated list of tags. Replaces all current tags.',
            type: 'string',
            default: '',
          },
          {
            name: 'stage_id',
            displayName: 'Funnel Stage Name or ID',
            description:
              'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
            type: 'options',
            typeOptions: {
              loadOptionsMethod: 'getFunnelStageOptions',
            },
            default: '',
          },
          {
            name: 'is_active',
            displayName: 'Is Active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'is_starred',
            displayName: 'Is Starred',
            type: 'boolean',
            default: false,
          },
        ],
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const contactId: string = this.getNodeParameter(
      'contactId',
      itemIndex,
    ) as string;

    const updateFields: IDataObject = this.getNodeParameter(
      'updateFields',
      itemIndex,
      {},
    );

    const body: IDataObject = compactObject({
      ...updateFields,
      tags:
        updateFields.tags !== undefined
          ? splitList(updateFields.tags as string)
          : undefined,
    });

    if (!Object.keys(body).length) {
      throw new NodeOperationError(
        this.getNode(),
        'Please add at least one field to update',
        { itemIndex },
      );
    }

    const response: ApiResponse = await httpClient.patch<ApiResponse>(
      this,
      `contacts/${contactId}`,
      undefined,
      body,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
