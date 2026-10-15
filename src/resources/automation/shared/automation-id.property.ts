import type { INodeProperties } from 'n8n-workflow';

export const automationIdProperty: INodeProperties = {
  name: 'automationId',
  displayName: 'Automation ID',
  description: 'The ID (UUID) of the automation',
  type: 'string',
  required: true,
  default: '',
};
