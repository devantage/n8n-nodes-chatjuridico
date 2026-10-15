import type { INodeProperties } from 'n8n-workflow';

export const webhookIdProperty: INodeProperties = {
  name: 'webhookId',
  displayName: 'Webhook ID',
  description: 'The ID (UUID) of the webhook',
  type: 'string',
  required: true,
  default: '',
};
