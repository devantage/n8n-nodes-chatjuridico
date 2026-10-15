import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import { withOperationDisplayOptions } from '../../../utils';
import { createListProperties, getListResults } from '../../shared';
import { providerField } from '../shared';

export class ListOperation extends ResourceOperation {
  public readonly name: string = 'list';

  public readonly displayName: string = 'List';

  public readonly description: string = 'List signature documents';

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
            name: 'contact_id',
            displayName: 'Contact ID',
            description: 'Return only the documents of this contact',
            type: 'string',
            default: '',
          },
          {
            name: 'status',
            displayName: 'Status',
            type: 'options',
            options: [
              { name: 'Cancelled', value: 'cancelled' },
              { name: 'Draft', value: 'draft' },
              { name: 'Expired', value: 'expired' },
              { name: 'Partially Signed', value: 'partially_signed' },
              { name: 'Pending', value: 'pending' },
              { name: 'Rejected', value: 'rejected' },
              { name: 'Signed', value: 'signed' },
            ],
            default: 'pending',
          },
          {
            ...providerField,
            description: 'Return only the documents of this provider',
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
        'signatures',
        filters,
        200,
      ),
      pairedItem: itemIndex,
    };
  }
}
