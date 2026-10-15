import type { INodeProperties } from 'n8n-workflow';

export const clientPoloField: INodeProperties = {
  name: 'client_polo',
  displayName: 'Client Side',
  description: 'Side of the lawsuit the office client is on',
  type: 'options',
  options: [
    { name: 'Active (Plaintiff)', value: 'ATIVO' },
    { name: 'Passive (Defendant)', value: 'PASSIVO' },
  ],
  default: 'ATIVO',
};
