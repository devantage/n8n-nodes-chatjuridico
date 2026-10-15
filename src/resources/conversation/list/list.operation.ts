import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import { withOperationDisplayOptions } from '../../../utils';
import { createListProperties, getListResults } from '../../shared';
import { conversationCountFilters, getConversationQuery } from '../shared';

export class ListOperation extends ResourceOperation {
  public readonly name: string = 'list';

  public readonly displayName: string = 'List';

  public readonly description: string = 'List conversations';

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
            name: 'search',
            displayName: 'Search',
            description: 'Search conversations by contact name or phone',
            type: 'string',
            default: '',
          },
          {
            name: 'contact_id',
            displayName: 'Contact ID',
            description: 'Return only the conversation of this contact (UUID)',
            type: 'string',
            default: '',
          },
          ...conversationCountFilters,
          {
            name: 'date_start',
            displayName: 'Last Message After',
            description:
              'Return conversations whose last message was sent from this date on',
            type: 'dateTime',
            default: '',
          },
          {
            name: 'date_end',
            displayName: 'Last Message Before',
            description:
              'Return conversations whose last message was sent up to this date',
            type: 'dateTime',
            default: '',
          },
          {
            name: 'is_waiting_human',
            displayName: 'Is Waiting Human',
            description:
              'Whether to return only conversations waiting for human attendance',
            type: 'boolean',
            default: true,
          },
          {
            name: 'agent_is_active',
            displayName: 'AI Agent Is Active',
            description:
              'Whether to return conversations with the AI agent active (true) or inactive (false)',
            type: 'boolean',
            default: true,
          },
          {
            name: 'is_ctwa_origin',
            displayName: 'Is Click-to-WhatsApp Origin',
            description:
              'Whether to return only conversations originated from Click-to-WhatsApp ads',
            type: 'boolean',
            default: true,
          },
          {
            name: 'customer_service_window_status',
            displayName: 'Customer Service Window Status',
            description:
              'Status of the 24h customer service window. Applies only to Meta numbers.',
            type: 'options',
            options: [
              { name: 'Open', value: 'open' },
              { name: 'Expiring', value: 'expiring' },
              { name: 'Closed', value: 'closed' },
            ],
            default: 'open',
          },
          {
            name: 'free_entry_point_window_open',
            displayName: 'Free Entry Point Window Open',
            description:
              'Whether the free Click-to-WhatsApp ad window is open (messages sent now are free). Applies only to Meta numbers.',
            type: 'boolean',
            default: true,
          },
          {
            name: 'sort_by',
            displayName: 'Sort By',
            type: 'options',
            options: [
              { name: 'Most Recent', value: 'recent' },
              { name: 'Contact Name', value: 'name' },
              { name: 'Creation Date', value: 'created_at' },
            ],
            default: 'recent',
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
        'conversations',
        getConversationQuery(filters),
        200,
      ),
      pairedItem: itemIndex,
    };
  }
}
