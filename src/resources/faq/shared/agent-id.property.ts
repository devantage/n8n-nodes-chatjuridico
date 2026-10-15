import type { INodeProperties } from 'n8n-workflow';

export const agentIdProperty: INodeProperties = {
  name: 'agentId',
  displayName: 'Agent ID',
  description: 'The ID (UUID) of the AI agent that owns the FAQ',
  type: 'string',
  required: true,
  default: '',
};
