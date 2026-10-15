import type { INodeProperties } from 'n8n-workflow';

export const conversationIdProperty: INodeProperties = {
  name: 'conversationId',
  displayName: 'Conversation ID',
  description: 'The ID (UUID) of the conversation',
  type: 'string',
  required: true,
  default: '',
};
