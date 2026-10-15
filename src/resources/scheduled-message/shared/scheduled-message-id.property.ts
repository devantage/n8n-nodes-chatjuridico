import type { INodeProperties } from 'n8n-workflow';

export const scheduledMessageIdProperty: INodeProperties = {
  name: 'scheduledMessageId',
  displayName: 'Scheduled Message ID',
  description: 'The ID (UUID) of the scheduled message',
  type: 'string',
  required: true,
  default: '',
};
