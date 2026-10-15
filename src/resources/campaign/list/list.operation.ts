import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import { withOperationDisplayOptions } from '../../../utils';
import { createListProperties, getListResults } from '../../shared';

export class ListOperation extends ResourceOperation {
  public readonly name: string = 'list';

  public readonly displayName: string = 'List';

  public readonly description: string = 'List campaigns';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      ...createListProperties(200, 50),
      {
        name: 'filters',
        displayName: 'Filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        options: [
          {
            name: 'status',
            displayName: 'Status',
            type: 'options',
            options: [
              { name: 'Cancelled', value: 'cancelled' },
              { name: 'Completed', value: 'completed' },
              { name: 'Draft', value: 'draft' },
              { name: 'Failed', value: 'failed' },
              { name: 'Paused', value: 'paused' },
              { name: 'Running', value: 'running' },
              { name: 'Scheduled', value: 'scheduled' },
            ],
            default: 'draft',
          },
          {
            name: 'search',
            displayName: 'Search',
            description: 'Search campaigns by name',
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

    return {
      json: await getListResults.call(
        this,
        itemIndex,
        'campaigns',
        filters,
        200,
      ),
      pairedItem: itemIndex,
    };
  }
}
