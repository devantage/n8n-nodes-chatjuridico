import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import { compactObject, withOperationDisplayOptions } from '../../../utils';
import { createListProperties, getListResults } from '../../shared';

export class ListOperation extends ResourceOperation {
  public readonly name: string = 'list';

  public readonly displayName: string = 'List';

  public readonly description: string = 'List contacts';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      ...createListProperties(),
      {
        name: 'filters',
        displayName: 'Filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        options: [
          {
            name: 'search',
            displayName: 'Search',
            description: 'Search by contact name or phone',
            type: 'string',
            default: '',
          },
          {
            name: 'phone',
            displayName: 'Phone',
            description: 'Filter contacts by phone number (partial match)',
            type: 'string',
            default: '',
          },
          {
            name: 'tag_ids',
            displayName: 'Tag Names or IDs',
            description:
              'Filter contacts that have any of these tags. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
            type: 'multiOptions',
            typeOptions: {
              loadOptionsMethod: 'getTagOptions',
            },
            default: [],
          },
          {
            name: 'is_active',
            displayName: 'Is Active',
            description: 'Whether to return only active contacts',
            type: 'boolean',
            default: true,
          },
          {
            name: 'sort_by',
            displayName: 'Sort By',
            type: 'options',
            options: [
              { name: 'Name', value: 'name' },
              { name: 'Most Recent', value: 'recent' },
              { name: 'Creation Date', value: 'created_at' },
            ],
            default: 'name',
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

    const tagIds: string[] | undefined = filters.tag_ids as
      string[] | undefined;

    const queryParams: IDataObject = compactObject({
      ...filters,
      tag_ids: tagIds?.length ? tagIds.join(',') : undefined,
    });

    return {
      json: await getListResults.call(this, itemIndex, 'contacts', queryParams),
      pairedItem: itemIndex,
    };
  }
}
