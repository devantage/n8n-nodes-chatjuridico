import type { INodeProperties } from 'n8n-workflow';

export const agentSessionIdProperty: INodeProperties = {
  name: 'sessionId',
  displayName: 'Session ID',
  description: 'The ID (UUID) of the AI agent session',
  type: 'string',
  required: true,
  default: '',
};
