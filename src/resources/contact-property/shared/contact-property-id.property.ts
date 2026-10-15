import type { INodeProperties } from 'n8n-workflow';

export const contactPropertyIdProperty: INodeProperties = {
  name: 'propertyId',
  displayName: 'Property Name or ID',
  description:
    'The contact property definition. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  type: 'options',
  typeOptions: {
    loadOptionsMethod: 'getContactPropertyIdOptions',
  },
  required: true,
  default: '',
};
