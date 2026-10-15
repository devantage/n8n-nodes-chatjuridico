import type { INodePropertyOptions } from 'n8n-workflow';

export const paymentStatusOptions: INodePropertyOptions[] = [
  { name: 'Pending', value: 'PENDING' },
  { name: 'Received', value: 'RECEIVED' },
  { name: 'Confirmed', value: 'CONFIRMED' },
  { name: 'Overdue', value: 'OVERDUE' },
  { name: 'Refunded', value: 'REFUNDED' },
  { name: 'Cancelled', value: 'CANCELLED' },
  { name: 'Received in Cash', value: 'RECEIVED_IN_CASH' },
];

export const billingTypeOptions: INodePropertyOptions[] = [
  { name: 'PIX', value: 'PIX' },
  { name: 'Boleto', value: 'BOLETO' },
  { name: 'Credit Card', value: 'CREDIT_CARD' },
];

export const periodOptions: INodePropertyOptions[] = [
  { name: 'Week', value: 'week' },
  { name: 'Month', value: 'month' },
  { name: 'Quarter', value: 'quarter' },
  { name: 'Year', value: 'year' },
];

export const dateTypeOptions: INodePropertyOptions[] = [
  { name: 'Due Date', value: 'due_date' },
  { name: 'Payment Date', value: 'payment_date' },
  { name: 'Creation Date', value: 'created_at' },
];
