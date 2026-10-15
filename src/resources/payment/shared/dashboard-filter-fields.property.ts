import type { INodeProperties } from 'n8n-workflow';

import {
  billingTypeOptions,
  dateTypeOptions,
  paymentStatusOptions,
  periodOptions,
} from './payment-options.property';

/**
 * Query filters shared by the dashboard and time series operations.
 */
export const dashboardFilterFields: INodeProperties[] = [
  {
    name: 'period',
    displayName: 'Period',
    description:
      'Date range shortcut. Use Start Date and End Date for a custom range.',
    type: 'options',
    options: periodOptions,
    default: 'month',
  },
  {
    name: 'start_date',
    displayName: 'Start Date',
    description: 'Start of the custom date range',
    type: 'dateTime',
    default: '',
  },
  {
    name: 'end_date',
    displayName: 'End Date',
    description: 'End of the custom date range',
    type: 'dateTime',
    default: '',
  },
  {
    name: 'date_type',
    displayName: 'Date Type',
    description: 'Payment date used to filter the range',
    type: 'options',
    options: dateTypeOptions,
    default: 'due_date',
  },
  {
    name: 'statuses',
    displayName: 'Statuses',
    description: 'Consider only payments with these statuses',
    type: 'multiOptions',
    options: paymentStatusOptions,
    default: [],
  },
  {
    name: 'billing_types',
    displayName: 'Billing Types',
    description: 'Consider only payments with these billing types',
    type: 'multiOptions',
    options: billingTypeOptions,
    default: [],
  },
];
