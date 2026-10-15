import type { INodeProperties } from 'n8n-workflow';

export const instanceIdProperty: INodeProperties = {
  name: 'instanceId',
  displayName: 'WhatsApp Number Name or ID',
  description:
    'The WhatsApp number (instance). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  type: 'options',
  typeOptions: {
    loadOptionsMethod: 'getInstanceOptions',
  },
  required: true,
  default: '',
};
