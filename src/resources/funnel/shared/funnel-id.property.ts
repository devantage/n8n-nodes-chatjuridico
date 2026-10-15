import type { INodeProperties } from 'n8n-workflow';

export const funnelIdProperty: INodeProperties = {
  name: 'funnelId',
  displayName: 'Funnel Name or ID',
  description:
    'The funnel. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  type: 'options',
  typeOptions: {
    loadOptionsMethod: 'getFunnelOptions',
  },
  required: true,
  default: '',
};
