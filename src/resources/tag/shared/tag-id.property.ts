import type { INodeProperties } from 'n8n-workflow';

export const tagIdProperty: INodeProperties = {
  name: 'tagId',
  displayName: 'Tag Name or ID',
  description:
    'The tag. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  type: 'options',
  typeOptions: {
    loadOptionsMethod: 'getTagOptions',
  },
  required: true,
  default: '',
};
