import type { INodeProperties } from 'n8n-workflow';

export const asaasContactIdProperty: INodeProperties = {
  name: 'contactId',
  displayName: 'Contact ID',
  description: 'The ID (UUID) of the ChatJuridico contact',
  type: 'string',
  required: true,
  default: '',
};
