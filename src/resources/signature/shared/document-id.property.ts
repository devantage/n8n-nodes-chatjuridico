import type { INodeProperties } from 'n8n-workflow';

export const documentIdProperty: INodeProperties = {
  name: 'documentId',
  displayName: 'Document ID',
  description: 'The ID (UUID) of the signature document',
  type: 'string',
  required: true,
  default: '',
};
