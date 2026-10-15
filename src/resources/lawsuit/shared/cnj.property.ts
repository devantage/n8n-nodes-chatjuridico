import type { INodeProperties } from 'n8n-workflow';

export const cnjProperty: INodeProperties = {
  name: 'cnj',
  displayName: 'CNJ Number',
  description:
    'Lawsuit CNJ number, formatted (NNNNNNN-DD.AAAA.J.TR.OOOO) or with 20 digits',
  type: 'string',
  required: true,
  default: '',
  placeholder: '0000000-00.0000.0.00.0000',
};
