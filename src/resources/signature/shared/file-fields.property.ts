import type { INodeProperties } from 'n8n-workflow';

export const fileUrlProperty: INodeProperties = {
  name: 'fileUrl',
  displayName: 'File URL',
  description: 'Public URL of the file to sign (PDF or DOCX, up to 10MB)',
  type: 'string',
  required: true,
  default: '',
};

export const fileNameField: INodeProperties = {
  name: 'file_name',
  displayName: 'File Name',
  type: 'string',
  default: 'document.pdf',
};

export const fileTypeField: INodeProperties = {
  name: 'file_type',
  displayName: 'File Type',
  type: 'options',
  options: [
    { name: 'PDF', value: 'pdf' },
    { name: 'DOCX', value: 'docx' },
  ],
  default: 'pdf',
};

export const providerField: INodeProperties = {
  name: 'provider',
  displayName: 'Provider',
  description:
    'Signature provider. Only needed when the office has more than one active provider.',
  type: 'options',
  options: [
    { name: 'ZapSign', value: 'zapsign' },
    { name: 'Autentique', value: 'autentique' },
  ],
  default: 'zapsign',
};
