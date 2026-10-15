import type { INodeProperties } from 'n8n-workflow';

/**
 * Period fields accepted by every analytics endpoint.
 */
export const analyticsPeriodFields: INodeProperties[] = [
  {
    name: 'start_date',
    displayName: 'Start Date',
    description: 'Start of the period. Defaults to 7 days ago.',
    type: 'dateTime',
    default: '',
  },
  {
    name: 'end_date',
    displayName: 'End Date',
    description: 'End of the period. Defaults to now.',
    type: 'dateTime',
    default: '',
  },
  {
    name: 'period',
    displayName: 'Period',
    description: 'Period shortcut. Overrides the start and end dates.',
    type: 'options',
    options: [
      { name: 'Week', value: 'week' },
      { name: 'Month', value: 'month' },
      { name: 'Quarter', value: 'quarter' },
      { name: 'Year', value: 'year' },
    ],
    default: 'week',
  },
];

export const analyticsInstanceField: INodeProperties = {
  name: 'instance_id',
  displayName: 'WhatsApp Number Name or ID',
  description:
    'Return only the data of this WhatsApp number. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  type: 'options',
  typeOptions: {
    loadOptionsMethod: 'getInstanceOptions',
  },
  default: '',
};

export const analyticsTagIdsField: INodeProperties = {
  name: 'tag_ids',
  displayName: 'Tag Names or IDs',
  description:
    'Return only the data related to these tags. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  type: 'multiOptions',
  typeOptions: {
    loadOptionsMethod: 'getTagOptions',
  },
  default: [],
};

export const analyticsUserIdField: INodeProperties = {
  name: 'user_id',
  displayName: 'Member Name or ID',
  description:
    'Return only the data of this team member. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  type: 'options',
  typeOptions: {
    loadOptionsMethod: 'getMemberOptions',
  },
  default: '',
};

/**
 * Builds the `filters` collection of an analytics operation: the shared
 * period fields, the WhatsApp number (unless disabled) and any extra filter.
 */
export function createAnalyticsFiltersProperty(
  extraFilters: INodeProperties[] = [],
  includeInstance: boolean = true,
): INodeProperties {
  return {
    name: 'filters',
    displayName: 'Filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    options: [
      ...analyticsPeriodFields,
      ...(includeInstance ? [analyticsInstanceField] : []),
      ...extraFilters,
    ],
  };
}
