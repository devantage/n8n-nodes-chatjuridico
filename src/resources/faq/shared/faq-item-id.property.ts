import type { INodeProperties } from 'n8n-workflow';

export const faqItemIdProperty: INodeProperties = {
  name: 'itemId',
  displayName: 'FAQ Item ID',
  description: 'The ID (UUID) of the FAQ item',
  type: 'string',
  required: true,
  default: '',
};
