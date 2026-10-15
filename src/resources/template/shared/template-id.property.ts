import type { INodeProperties } from 'n8n-workflow';

export const templateIdProperty: INodeProperties = {
  name: 'templateId',
  displayName: 'Template ID',
  description: 'The ID (UUID) of the WhatsApp template',
  type: 'string',
  required: true,
  default: '',
};
