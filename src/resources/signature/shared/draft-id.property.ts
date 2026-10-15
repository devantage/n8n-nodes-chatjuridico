import type { INodeProperties } from 'n8n-workflow';

export const draftIdProperty: INodeProperties = {
  name: 'draftId',
  displayName: 'Draft ID',
  description: 'The ID (UUID) of the draft signature document',
  type: 'string',
  required: true,
  default: '',
};
