import type { INodeProperties } from 'n8n-workflow';

export const paymentIdProperty: INodeProperties = {
  name: 'paymentId',
  displayName: 'Payment ID',
  description: 'The ID (UUID) of the payment',
  type: 'string',
  required: true,
  default: '',
};
