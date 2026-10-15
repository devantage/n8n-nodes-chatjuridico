import type { INodeProperties } from 'n8n-workflow';

/**
 * Optional `filters` object (WebhookFilter) applied to `message.*` events
 * before delivery. Shared by the create and update operations.
 */
export const webhookFiltersProperty: INodeProperties = {
  name: 'filters',
  displayName: 'Filters (JSON)',
  description:
    'Filters applied to `message.*` events before delivery; only messages matching ALL filters are delivered. Supports `message_types`, `direction` (inbound, outbound, any), `text` ({ mode, values }), `interactive` ({ button_ids, titles }) and `reply` ({ has_token, tokens, token_prefixes }).',
  type: 'json',
  default: '{\n  "direction": "inbound",\n  "message_types": ["text"]\n}',
};
