import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import {
  type ApiResponse,
  httpClient,
  withOperationDisplayOptions,
} from '../../../utils';
import { buildContactPropertyBody, contactPropertyFields } from '../shared';

export class CreateOperation extends ResourceOperation {
  public readonly name: string = 'create';

  public readonly displayName: string = 'Create';

  public readonly description: string =
    'Create a custom field in the contact panel';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'name',
        displayName: 'Name',
        description:
          'Name shown in the panel (unique in the office). Creating a field with the name or key of a deleted field reactivates it.',
        type: 'string',
        required: true,
        default: '',
      },
      {
        name: 'type',
        displayName: 'Type',
        type: 'options',
        required: true,
        options: [
          { name: 'Boolean', value: 'boolean' },
          { name: 'Date', value: 'date' },
          { name: 'Email', value: 'email' },
          { name: 'Multi Select', value: 'multi_select' },
          { name: 'Number', value: 'number' },
          { name: 'Phone', value: 'phone' },
          { name: 'Rich Text', value: 'rich_text' },
          { name: 'Select', value: 'select' },
          { name: 'Text', value: 'text' },
          { name: 'URL', value: 'url' },
        ],
        default: 'text',
      },
      {
        name: 'additionalFields',
        displayName: 'Additional Fields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        options: [
          {
            name: 'key',
            displayName: 'Key',
            description:
              'Key used to write values (lowercase letters, numbers and underscores). Generated from the name when empty and immutable afterwards.',
            type: 'string',
            default: '',
          },
          ...contactPropertyFields,
        ],
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const name: string = this.getNodeParameter('name', itemIndex) as string;

    const type: string = this.getNodeParameter('type', itemIndex) as string;

    const additionalFields: IDataObject = this.getNodeParameter(
      'additionalFields',
      itemIndex,
      {},
    );

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      'contact-properties',
      buildContactPropertyBody.call(
        this,
        { ...additionalFields, name, type },
        itemIndex,
      ),
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
