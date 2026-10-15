import type { INodeProperties } from 'n8n-workflow';

export const asaasApiKeyProperty: INodeProperties = {
  name: 'apiKey',
  displayName: 'Asaas API Key',
  type: 'string',
  typeOptions: {
    password: true,
  },
  required: true,
  default: '',
};
