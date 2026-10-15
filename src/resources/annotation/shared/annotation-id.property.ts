import type { INodeProperties } from 'n8n-workflow';

export const annotationIdProperty: INodeProperties = {
  name: 'annotationId',
  displayName: 'Note ID',
  description: 'The ID (UUID) of the note',
  type: 'string',
  required: true,
  default: '',
};
