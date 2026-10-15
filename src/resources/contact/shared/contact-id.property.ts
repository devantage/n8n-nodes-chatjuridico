import type { INodeProperties } from 'n8n-workflow';

export const contactIdProperty: INodeProperties = {
  name: 'contactId',
  displayName: 'Contact ID',
  description: 'The ID (UUID) of the contact',
  type: 'string',
  required: true,
  default: '',
};
