import type { INodeProperties } from 'n8n-workflow';

/**
 * Filters shared by the list and count operations.
 */
export const agentSessionFilters: INodeProperties[] = [
  {
    name: 'state',
    displayName: 'State',
    description: 'Filter by session state',
    type: 'options',
    options: [
      { name: 'Ongoing', value: 'ongoing' },
      { name: 'Completed', value: 'completed' },
    ],
    default: 'ongoing',
  },
  {
    name: 'agent_id',
    displayName: 'Agent ID',
    description: 'Filter by agent ID (UUID)',
    type: 'string',
    default: '',
  },
  {
    name: 'date_start',
    displayName: 'Date Start',
    description: 'Return sessions created from this date',
    type: 'dateTime',
    default: '',
  },
  {
    name: 'date_end',
    displayName: 'Date End',
    description: 'Return sessions created until this date',
    type: 'dateTime',
    default: '',
  },
];
