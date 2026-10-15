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

  public readonly description: string =
    'List the follow-ups scheduled by the AI agent';

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
            name: 'session_id',
            displayName: 'Session ID',
            description: 'Filter by AI agent session ID (UUID)',
            type: 'string',
            default: '',
          },
          {
            name: 'status',
            displayName: 'Status',
            description: 'Filter by follow-up status',
            type: 'options',
            options: [
              { name: 'Scheduled', value: 'scheduled' },
              { name: 'Processing', value: 'processing' },
              { name: 'Sent', value: 'sent' },
              { name: 'Responded', value: 'responded' },
              { name: 'Cancelled', value: 'cancelled' },
              { name: 'Failed', value: 'failed' },
            ],
            default: 'scheduled',
          },
          {
            name: 'date_start',
            displayName: 'Date Start',
            description: 'Return follow-ups from this date',
            type: 'dateTime',
            default: '',
          },
          {
            name: 'date_end',
            displayName: 'Date End',
            description: 'Return follow-ups until this date',
            type: 'dateTime',
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
        'session-follow-ups',
        compactObject(filters),
        200,
      ),
      pairedItem: itemIndex,
    };
  }
}
