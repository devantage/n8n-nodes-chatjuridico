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
  httpClient,
  parseJson,
  withOperationDisplayOptions,
} from '../../../utils';

export class BulkCreateOperation extends ResourceOperation {
  public readonly name: string = 'bulkCreate';

  public readonly displayName: string = 'Bulk Create';

  public readonly description: string = 'Create up to 100 contacts at once';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'contacts',
        displayName: 'Contacts (JSON)',
        description:
          'Array of contacts, each with `name`, `phone` and optionally `tags`, `stage_id` and `source`',
        type: 'json',
        required: true,
        default: '[\n  {\n    "name": "",\n    "phone": ""\n  }\n]',
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const contacts: unknown = parseJson.call(
      this,
      this.getNodeParameter('contacts', itemIndex),
      'Contacts',
      itemIndex,
    );

    if (!Array.isArray(contacts) || !contacts.length || contacts.length > 100) {
      throw new NodeOperationError(
        this.getNode(),
        'Contacts must be an array with 1 to 100 items',
        { itemIndex },
      );
    }

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      'contacts/bulk',
      { contacts: contacts as IDataObject[] },
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
