import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import { compactObject, withOperationDisplayOptions } from '../../../utils';
import { createListProperties, getListResults } from '../../shared';
import {
  billingTypeOptions,
  formatDate,
  paymentStatusOptions,
} from '../shared';

export class ListOperation extends ResourceOperation {
  public readonly name: string = 'list';

  public readonly displayName: string = 'List';

  public readonly description: string = 'List payments';

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
            description: 'Return only the payments of this contact',
            type: 'string',
            default: '',
          },
          {
            name: 'status',
            displayName: 'Status',
            type: 'options',
            options: paymentStatusOptions,
            default: 'PENDING',
          },
          {
            name: 'billing_type',
            displayName: 'Billing Type',
            type: 'options',
            options: billingTypeOptions,
            default: 'PIX',
          },
          {
            name: 'due_date_start',
            displayName: 'Due Date From',
            description: 'Return payments due on or after this date',
            type: 'dateTime',
            default: '',
          },
          {
            name: 'due_date_end',
            displayName: 'Due Date To',
            description: 'Return payments due on or before this date',
            type: 'dateTime',
            default: '',
          },
          {
            name: 'overdue_acknowledged',
            displayName: 'Overdue Acknowledged',
            description:
              'Whether to return overdue payments already acknowledged (true) or not yet acknowledged (false)',
            type: 'boolean',
            default: false,
          },
          {
            name: 'sort_by',
            displayName: 'Sort By',
            type: 'options',
            options: [
              { name: 'Due Date', value: 'due_date' },
              { name: 'Creation Date', value: 'created_at' },
              { name: 'Value', value: 'value' },
            ],
            default: 'due_date',
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

    const queryParams: IDataObject = compactObject({
      ...filters,
      due_date_start: formatDate(filters.due_date_start),
      due_date_end: formatDate(filters.due_date_end),
    });

    return {
      json: await getListResults.call(
        this,
        itemIndex,
        'payments',
        queryParams,
        200,
      ),
      pairedItem: itemIndex,
    };
  }
}
