import type { INodeProperties } from 'n8n-workflow';

const SIGNER_JSON_EXAMPLE: string =
  '[\n  {\n    "name": "",\n    "email": "",\n    "phone_number": ""\n  }\n]';

export const signersJsonDescription: string =
  'Array of signers, each with `name` and optionally `email`, `phone_number`, `phone_country`, `cpf`, `qualification`, `address`, `auth_mode`, `require_selfie_photo`, `require_document_photo`, `selfie_validation_type` and `security_verifications`';

/**
 * Signer input used by the create operation: either a list of fields or a
 * JSON array (useful when the signers come from a previous node).
 */
export const signerInputProperties: INodeProperties[] = [
  {
    name: 'signersInputMode',
    displayName: 'Signers Input Mode',
    type: 'options',
    options: [
      { name: 'Using Fields Below', value: 'fields' },
      { name: 'Using JSON', value: 'json' },
    ],
    default: 'fields',
  },
  {
    name: 'signers',
    displayName: 'Signers',
    type: 'fixedCollection',
    placeholder: 'Add Signer',
    typeOptions: {
      multipleValues: true,
    },
    default: {},
    displayOptions: {
      show: {
        signersInputMode: ['fields'],
      },
    },
    options: [
      {
        name: 'signer',
        displayName: 'Signer',
        values: [
          {
            name: 'name',
            displayName: 'Name',
            description: 'Full name of the signer',
            type: 'string',
            required: true,
            default: '',
          },
          {
            name: 'email',
            displayName: 'Email',
            type: 'string',
            placeholder: 'name@email.com',
            default: '',
          },
          {
            name: 'phone_number',
            displayName: 'Phone Number',
            description:
              'Phone number of the signer. When given in E.164 format (+5511999998888) the country code can be omitted.',
            type: 'string',
            default: '',
          },
          {
            name: 'phone_country',
            displayName: 'Phone Country Code',
            description: 'Country calling code without "+" (defaults to 55)',
            type: 'string',
            default: '',
          },
          {
            name: 'cpf',
            displayName: 'CPF',
            type: 'string',
            default: '',
          },
          {
            name: 'qualification',
            displayName: 'Qualification',
            description: 'Role of the signer (e.g. Contratante, Testemunha)',
            type: 'string',
            default: '',
          },
          {
            name: 'address',
            displayName: 'Address',
            description: 'Address of the signer (ZapSign)',
            type: 'string',
            default: '',
          },
          {
            name: 'auth_mode',
            displayName: 'Authentication Mode',
            description: 'Authentication mode used to sign',
            type: 'string',
            default: 'assinaturaTela',
          },
          {
            name: 'require_selfie_photo',
            displayName: 'Require Selfie Photo',
            description: 'Whether to require a selfie of the signer',
            type: 'boolean',
            default: false,
          },
          {
            name: 'require_document_photo',
            displayName: 'Require Document Photo',
            description: 'Whether to require a photo of the signer document',
            type: 'boolean',
            default: false,
          },
          {
            name: 'selfie_validation_type',
            displayName: 'Selfie Validation Type',
            description:
              'ZapSign biometric validation method (charged per signature). Only sent when a selfie or document photo is required.',
            type: 'string',
            default: '',
          },
        ],
      },
    ],
  },
  {
    name: 'signersJson',
    displayName: 'Signers (JSON)',
    description: signersJsonDescription,
    type: 'json',
    required: true,
    default: SIGNER_JSON_EXAMPLE,
    displayOptions: {
      show: {
        signersInputMode: ['json'],
      },
    },
  },
];
