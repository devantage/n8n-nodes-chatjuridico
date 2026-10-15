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
  parseJson,
  withOperationDisplayOptions,
} from '../../../utils';
import { templateCategoryOptions, templateIdProperty } from '../shared';

export class UpdateOperation extends ResourceOperation {
  public readonly name: string = 'update';

  public readonly displayName: string = 'Update';

  public readonly description: string =
    'Update a WhatsApp template (its status is reset to draft)';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      templateIdProperty,
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
            description: 'Template name',
            type: 'string',
            default: '',
          },
          {
            name: 'language',
            displayName: 'Language',
            description: 'Template language code (e.g. pt_BR)',
            type: 'string',
            default: '',
          },
          {
            name: 'category',
            displayName: 'Category',
            description: 'Template category, as classified by Meta',
            type: 'options',
            options: templateCategoryOptions,
            default: 'UTILITY',
          },
          {
            name: 'components',
            displayName: 'Components (JSON)',
            description:
              'Array of template components (header, body, buttons) in the Meta format',
            type: 'json',
            default: '[]',
          },
        ],
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const templateId: string = this.getNodeParameter(
      'templateId',
      itemIndex,
    ) as string;

    const updateFields: IDataObject = this.getNodeParameter(
      'updateFields',
      itemIndex,
      {},
    );

    const body: IDataObject = compactObject({
      ...updateFields,
      components:
        updateFields.components !== undefined
          ? (parseJson.call(
              this,
              updateFields.components,
              'Components',
              itemIndex,
            ) as IDataObject[])
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
      `templates/${templateId}`,
      undefined,
      body,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
