import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import { withOperationDisplayOptions } from '../../../utils';
import { createListProperties, getListResults } from '../../shared';
import {
  analyticsUserIdField,
  createAnalyticsFiltersProperty,
  getAnalyticsQuery,
} from '../shared';

export class ListInteractionsOperation extends ResourceOperation {
  public readonly name: string = 'listInteractions';

  public readonly displayName: string = 'List Interactions';

  public readonly description: string =
    'List the interactions recorded in the office (audit trail)';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      ...createListProperties(200, 100),
      createAnalyticsFiltersProperty(
        [
          {
            name: 'chat_id',
            displayName: 'Conversation ID',
            description: 'Return only the interactions of this conversation',
            type: 'string',
            default: '',
          },
          {
            ...analyticsUserIdField,
            description:
              'Return only the interactions performed by this team member. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
          },
          {
            name: 'interaction_type',
            displayName: 'Interaction Type',
            type: 'options',
            options: [
              { name: 'Accountable Change', value: 'accountable_change' },
              { name: 'Agent Activate', value: 'agent_activate' },
              { name: 'Agent Deactivate', value: 'agent_deactivate' },
              { name: 'Archive', value: 'archive' },
              { name: 'Automation Trigger', value: 'automation_trigger' },
              { name: 'Contact Update', value: 'contact_update' },
              { name: 'Department Change', value: 'department_change' },
              { name: 'Manual Message', value: 'manual_message' },
              { name: 'Note Added', value: 'note_added' },
              { name: 'Other', value: 'other' },
              { name: 'Stage Change', value: 'stage_change' },
              { name: 'Status Change', value: 'status_change' },
              { name: 'Tag Add', value: 'tag_add' },
              { name: 'Tag Remove', value: 'tag_remove' },
              { name: 'Unarchive', value: 'unarchive' },
            ],
            default: 'stage_change',
          },
        ],
        false,
      ),
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    return {
      json: await getListResults.call(
        this,
        itemIndex,
        'analytics/interactions',
        getAnalyticsQuery.call(this, itemIndex),
        200,
      ),
      pairedItem: itemIndex,
    };
  }
}
