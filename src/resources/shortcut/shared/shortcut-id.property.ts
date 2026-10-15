import type { INodeProperties } from 'n8n-workflow';

export const shortcutIdProperty: INodeProperties = {
  name: 'shortcutId',
  displayName: 'Shortcut ID',
  description: 'The ID (UUID) of the message shortcut',
  type: 'string',
  required: true,
  default: '',
};
