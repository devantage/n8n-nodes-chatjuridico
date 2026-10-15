import type { INodePropertyOptions } from 'n8n-workflow';

import { splitList } from '../../../utils';

export const SEARCH_FILTER_FIELDS: INodePropertyOptions[] = [
  { name: 'Accountable ID', value: 'accountable_id' },
  { name: 'AI Agent Is Active', value: 'agent_is_active_local' },
  { name: 'Contact ID', value: 'contact_id' },
  { name: 'Conversation ID', value: 'unique_id' },
  { name: 'Created At', value: 'created_at' },
  {
    name: 'Customer Service Window Status',
    value: 'customer_service_window_status',
  },
  { name: 'Funnel Stage ID', value: 'office_stage_id' },
  { name: 'Is Archived', value: 'is_archived' },
  { name: 'Is Click-to-WhatsApp Origin', value: 'is_ctwa_origin' },
  { name: 'Is Waiting Human', value: 'is_waiting_human' },
  { name: 'Last Message At', value: 'last_message_at' },
  { name: 'Last Message Text', value: 'last_message_text' },
  { name: 'Last Message Type', value: 'last_message_type' },
  { name: 'Phone ID', value: 'phone_id' },
  { name: 'Tag IDs', value: 'tags_ids' },
  { name: 'Unread Messages Count', value: 'unread_messages_count' },
  { name: 'WhatsApp Number ID', value: 'instance_id' },
];

const BOOLEAN_FIELDS: string[] = [
  'agent_is_active_local',
  'is_archived',
  'is_ctwa_origin',
  'is_waiting_human',
];

const NUMBER_FIELDS: string[] = ['unread_messages_count'];

const LIST_OPERATORS: string[] = ['in', 'overlaps'];

type ScalarValue = string | number | boolean;

function toText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return value.toString();
  }

  if (value === undefined || value === null) {
    return '';
  }

  return JSON.stringify(value);
}

function convertScalar(field: string, value: unknown): ScalarValue {
  const text: string = toText(value).trim();

  if (BOOLEAN_FIELDS.includes(field)) {
    return text.toLowerCase() === 'true';
  }

  if (NUMBER_FIELDS.includes(field)) {
    const numberValue: number = Number(text);

    return text !== '' && !Number.isNaN(numberValue) ? numberValue : text;
  }

  return text;
}

/**
 * Converts the text typed by the user into the value type expected by the
 * search endpoint for the given field and operator.
 */
export function parseSearchFilterValue(
  field: string,
  operator: string,
  value: unknown,
): ScalarValue | ScalarValue[] {
  if (operator === 'is_null') {
    return toText(value).trim().toLowerCase() !== 'false';
  }

  if (LIST_OPERATORS.includes(operator)) {
    const values: unknown[] = Array.isArray(value)
      ? value
      : splitList(toText(value));

    return values.map((curValue: unknown): ScalarValue =>
      convertScalar(field, curValue),
    );
  }

  return convertScalar(field, value);
}
