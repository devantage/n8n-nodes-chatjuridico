import type { INodeProperties } from 'n8n-workflow';

export const campaignIdProperty: INodeProperties = {
  name: 'campaignId',
  displayName: 'Campaign ID',
  description: 'The ID (UUID) of the campaign',
  type: 'string',
  required: true,
  default: '',
};
