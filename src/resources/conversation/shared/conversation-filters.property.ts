import type { IDataObject, INodeProperties } from 'n8n-workflow';

import { compactObject } from '../../../utils';

/**
 * Filters accepted both by the list and the count operations.
 */
export const conversationCountFilters: INodeProperties[] = [
  {
    name: 'instance_id',
    displayName: 'WhatsApp Number Name or ID',
    description:
      'Return only conversations of this WhatsApp number. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
    type: 'options',
    typeOptions: {
      loadOptionsMethod: 'getInstanceOptions',
    },
    default: '',
  },
  {
    name: 'tag_ids',
    displayName: 'Tag Names or IDs',
    description:
      'Return conversations that have any of these tags. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
    type: 'multiOptions',
    typeOptions: {
      loadOptionsMethod: 'getTagOptions',
    },
    default: [],
  },
  {
    name: 'stage_id',
    displayName: 'Funnel Stage Name or ID',
    description:
      'Return only conversations in this funnel stage. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
    type: 'options',
    typeOptions: {
      loadOptionsMethod: 'getFunnelStageOptions',
    },
    default: '',
  },
  {
    name: 'is_archived',
    displayName: 'Is Archived',
    description:
      'Whether to return archived (true) or active (false) conversations',
    type: 'boolean',
    default: false,
  },
  {
    name: 'has_unread',
    displayName: 'Has Unread',
    description:
      'Whether to return conversations with unread messages (true) or fully read (false)',
    type: 'boolean',
    default: true,
  },
  {
    name: 'responsible_id',
    displayName: 'Responsible ID',
    description:
      'Return conversations assigned to this user (UUID), or use "none" for conversations without a responsible',
    type: 'string',
    default: '',
  },
];

/**
 * Converts the conversation filters collection into query parameters.
 */
export function getConversationQuery(filters: IDataObject): IDataObject {
  const tagIds: string[] | undefined = filters.tag_ids as string[] | undefined;

  return compactObject({
    ...filters,
    tag_ids: tagIds?.length ? tagIds.join(',') : undefined,
  });
}
