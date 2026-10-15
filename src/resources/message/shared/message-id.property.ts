import type { INodeProperties } from 'n8n-workflow';

export const messageIdProperty: INodeProperties = {
  name: 'messageId',
  displayName: 'Message ID',
  description: 'The ID (UUID) of the message',
  type: 'string',
  required: true,
  default: '',
};
