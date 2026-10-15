import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import {
  type ApiResponse,
  compactObject,
  httpClient,
  withOperationDisplayOptions,
} from '../../../utils';

export class ListOperation extends ResourceOperation {
  public readonly name: string = 'list';

  public readonly displayName: string = 'List';

  public readonly description: string = 'List WhatsApp templates';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'filters',
        displayName: 'Filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        options: [
          {
            name: 'instance_id',
            displayName: 'WhatsApp Number Name or ID',
            description:
              'Return only the templates of this WhatsApp number. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
            type: 'options',
            typeOptions: {
              loadOptionsMethod: 'getInstanceOptions',
            },
            default: '',
          },
          {
            name: 'status',
            displayName: 'Status',
            description:
              'Template approval status. The API returns only approved templates by default.',
            type: 'options',
            options: [
              { name: 'Approved', value: 'APPROVED' },
              { name: 'Draft', value: 'DRAFT' },
              { name: 'Pending', value: 'PENDING' },
              { name: 'Rejected', value: 'REJECTED' },
            ],
            default: 'APPROVED',
          },
          {
            name: 'search',
            displayName: 'Search',
            description: 'Search templates by name',
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
    const filters: IDataObject = this.getNodeParameter(
      'filters',
      itemIndex,
      {},
    );

    const response: ApiResponse = await httpClient.get<ApiResponse>(
      this,
      'templates',
      compactObject(filters),
    );

    return {
      json: response,
      pairedItem: itemIndex,
    };
  }
}
