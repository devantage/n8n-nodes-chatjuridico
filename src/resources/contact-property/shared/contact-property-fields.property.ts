import type { INodeProperties } from 'n8n-workflow';

/**
 * Optional definition fields shared by the create and update operations.
 */
export const contactPropertyFields: INodeProperties[] = [
  {
    name: 'description',
    displayName: 'Description',
    type: 'string',
    default: '',
  },
  {
    name: 'category',
    displayName: 'Category',
    description: 'Category of the field (defaults to "general")',
    type: 'string',
    default: '',
  },
  {
    name: 'required',
    displayName: 'Required',
    description: 'Whether the field is required',
    type: 'boolean',
    default: false,
  },
  {
    name: 'sensitive',
    displayName: 'Sensitive',
    description: 'Whether the value is masked in the panel until revealed',
    type: 'boolean',
    default: false,
  },
  {
    name: 'options',
    displayName: 'Options',
    description:
      'Options of select/multi select fields: a comma separated list of labels, or a JSON array (e.g. `[{"value": "current_value", "label": "New Label"}]` to rename an option keeping its value). On update, the list replaces all current options.',
    type: 'string',
    default: '',
  },
  {
    name: 'prefix',
    displayName: 'Prefix',
    description: 'Display prefix (number fields only)',
    type: 'string',
    default: '',
  },
  {
    name: 'suffix',
    displayName: 'Suffix',
    description: 'Display suffix (number fields only)',
    type: 'string',
    default: '',
  },
];
