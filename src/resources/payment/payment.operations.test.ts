import { TestUtil } from '@devantage/n8n-custom-nodes-framework';
import { NodeOperationError } from 'n8n-workflow';

import { describeOperationCases, expectScopedProperties } from '../../testing';
import { AcknowledgeOverdueOperation } from './acknowledge-overdue';
import { CancelOperation } from './cancel';
import { CreateOperation } from './create';
import { FillDataOperation } from './fill-data';
import { GetOperation } from './get';
import { GetChatValuesOperation } from './get-chat-values';
import { GetDashboardOperation } from './get-dashboard';
import { GetFunnelValuesOperation } from './get-funnel-values';
import { GetTimeSeriesOperation } from './get-time-series';
import { ListOperation } from './list';
import { PaymentResource } from './payment.resource';
import { ScheduleRemindersOperation } from './schedule-reminders';
import { buildDashboardQuery, formatDate } from './shared';

describe('payment operations', (): void => {
  describeOperationCases([
    {
      label: 'lists payments with filters',
      operation: new ListOperation('payment'),
      parameters: {
        returnAll: false,
        limit: 20,
        filters: {
          contact_id: 'contact-1',
          status: 'OVERDUE',
          billing_type: 'PIX',
          due_date_start: '2025-01-01T00:00:00',
          due_date_end: '2025-01-31T23:59:59',
          overdue_acknowledged: false,
          sort_by: 'value',
        },
      },
      method: 'get',
      response: { data: [{ id: 'payment-1' }], pagination: {} },
      expectedRequest: [
        'payments',
        {
          contact_id: 'contact-1',
          status: 'OVERDUE',
          billing_type: 'PIX',
          due_date_start: '2025-01-01',
          due_date_end: '2025-01-31',
          overdue_acknowledged: false,
          sort_by: 'value',
          limit: 20,
        },
      ],
      expectedJson: { data: [{ id: 'payment-1' }], pagination: {} },
    },
    {
      label: 'lists payments without filters',
      operation: new ListOperation('payment'),
      parameters: { returnAll: false, limit: 50, filters: {} },
      method: 'get',
      response: { data: [] },
      expectedRequest: ['payments', { limit: 50 }],
      expectedJson: { data: [] },
    },
    {
      label: 'creates a payment',
      operation: new CreateOperation('payment'),
      parameters: {
        contactId: 'contact-1',
        instanceId: 'instance-1',
        value: 150,
        dueDate: '2025-06-15T00:00:00',
        billingType: 'BOLETO',
        additionalFields: {
          description: 'Honorários',
          installment_count: 3,
          interest_percentage: 1,
          fine_percentage: 2,
          discount_value: 10,
          discount_due_date: '2025-06-10T00:00:00',
        },
        options: { idempotencyKey: 'key-1' },
      },
      method: 'post',
      response: { data: { id: 'payment-1' } },
      expectedRequest: [
        'payments',
        {
          contact_id: 'contact-1',
          instance_id: 'instance-1',
          value: 150,
          due_date: '2025-06-15',
          billing_type: 'BOLETO',
          description: 'Honorários',
          installment_count: 3,
          interest_percentage: 1,
          fine_percentage: 2,
          discount_value: 10,
          discount_due_date: '2025-06-10',
        },
        undefined,
        { headers: { 'X-Idempotency-Key': 'key-1' } },
      ],
      expectedJson: { id: 'payment-1' },
    },
    {
      label: 'creates a payment without optional fields',
      operation: new CreateOperation('payment'),
      parameters: {
        contactId: 'contact-1',
        instanceId: 'instance-1',
        value: 99.9,
        dueDate: '2025-06-15',
        billingType: 'PIX',
        additionalFields: {},
        options: {},
      },
      method: 'post',
      response: { data: { id: 'payment-1' } },
      expectedRequest: [
        'payments',
        {
          contact_id: 'contact-1',
          instance_id: 'instance-1',
          value: 99.9,
          due_date: '2025-06-15',
          billing_type: 'PIX',
        },
        undefined,
        undefined,
      ],
      expectedJson: { id: 'payment-1' },
    },
    {
      label: 'gets a payment',
      operation: new GetOperation('payment'),
      parameters: { paymentId: 'payment-1' },
      method: 'get',
      response: { data: { id: 'payment-1', events: [] } },
      expectedRequest: ['payments/payment-1'],
      expectedJson: { id: 'payment-1', events: [] },
    },
    {
      label: 'cancels a payment',
      operation: new CancelOperation('payment'),
      parameters: { paymentId: 'payment-1' },
      method: 'post',
      response: { data: { message: 'cancelled' } },
      expectedRequest: ['payments/payment-1/cancel'],
      expectedJson: { message: 'cancelled' },
    },
    {
      label: 'acknowledges an overdue payment',
      operation: new AcknowledgeOverdueOperation('payment'),
      parameters: { paymentId: 'payment-1' },
      method: 'post',
      response: { data: { message: 'acknowledged' } },
      expectedRequest: ['payments/payment-1/acknowledge-overdue'],
      expectedJson: { message: 'acknowledged' },
    },
    {
      label: 'schedules payment reminders',
      operation: new ScheduleRemindersOperation('payment'),
      parameters: {
        paymentIds: 'payment-1, payment-2',
        additionalFields: {
          template_name: 'payment_reminder',
          template_language: 'pt_BR',
          template_parameters: '{"1":"name"}',
          text: '',
        },
      },
      method: 'post',
      response: { data: { scheduled_count: 2 } },
      expectedRequest: [
        'payments/schedule-reminders',
        {
          payment_ids: ['payment-1', 'payment-2'],
          template_name: 'payment_reminder',
          template_language: 'pt_BR',
          template_parameters: { '1': 'name' },
        },
      ],
      expectedJson: { scheduled_count: 2 },
    },
    {
      label: 'schedules payment reminders without additional fields',
      operation: new ScheduleRemindersOperation('payment'),
      parameters: { paymentIds: 'payment-1', additionalFields: {} },
      method: 'post',
      response: { data: { scheduled_count: 1 } },
      expectedRequest: [
        'payments/schedule-reminders',
        { payment_ids: ['payment-1'] },
      ],
      expectedJson: { scheduled_count: 1 },
    },
    {
      label: 'fills payment data from a conversation',
      operation: new FillDataOperation('payment'),
      parameters: { conversationId: 'conversation-1', contactId: 'contact-1' },
      method: 'post',
      response: { data: { value: 100 } },
      expectedRequest: [
        'payments/fill-data',
        { conversation_id: 'conversation-1', contact_id: 'contact-1' },
      ],
      expectedJson: { value: 100 },
    },
    {
      label: 'gets the dashboard',
      operation: new GetDashboardOperation('payment'),
      parameters: {
        filters: {
          period: 'month',
          start_date: '2025-01-01T00:00:00',
          date_type: 'payment_date',
          statuses: ['RECEIVED', 'CONFIRMED'],
          billing_types: [],
          user_id: 'user-1',
          compare: true,
        },
      },
      method: 'get',
      response: { data: { total_value: 10 } },
      expectedRequest: [
        'payments/dashboard',
        {
          period: 'month',
          start_date: '2025-01-01T00:00:00',
          date_type: 'payment_date',
          statuses: 'RECEIVED,CONFIRMED',
          user_id: 'user-1',
          compare: true,
        },
      ],
      expectedJson: { total_value: 10 },
    },
    {
      label: 'gets the time series',
      operation: new GetTimeSeriesOperation('payment'),
      parameters: {
        groupBy: 'week',
        filters: { billing_types: ['PIX', 'BOLETO'], end_date: '' },
      },
      method: 'get',
      response: { data: [{ period: '2025-W03' }] },
      expectedRequest: [
        'payments/dashboard/time-series',
        { group_by: 'week', billing_types: 'PIX,BOLETO' },
      ],
      expectedJson: { data: [{ period: '2025-W03' }] },
    },
    {
      label: 'gets the funnel values',
      operation: new GetFunnelValuesOperation('payment'),
      parameters: {
        filters: { start_date: '2025-01-01T10:00:00', end_date: '' },
      },
      method: 'get',
      response: { data: [{ stage_id: 'stage-1' }] },
      expectedRequest: ['payments/funnel-values', { start_date: '2025-01-01' }],
      expectedJson: { data: [{ stage_id: 'stage-1' }] },
    },
    {
      label: 'gets the chat values',
      operation: new GetChatValuesOperation('payment'),
      parameters: {
        returnAll: false,
        limit: 10,
        filters: { contact_id: 'contact-1', stage_id: '' },
      },
      method: 'get',
      response: { data: [{ chat_id: 'chat-1' }], pagination: {} },
      expectedRequest: [
        'payments/chat-values',
        { contact_id: 'contact-1', limit: 10 },
      ],
      expectedJson: { data: [{ chat_id: 'chat-1' }], pagination: {} },
    },
  ]);

  describe('schedule reminders validation', (): void => {
    it.each([
      [
        'no payment IDs are given',
        ' , ',
        'Please provide at least one payment ID',
      ],
      [
        'more than 50 payment IDs are given',
        Array.from(
          { length: 51 },
          (_value: unknown, index: number): string =>
            `payment-${String(index)}`,
        ).join(','),
        'A maximum of 50 payment IDs is allowed per request',
      ],
    ])(
      'rejects when %s',
      async (
        _label: string,
        paymentIds: string,
        message: string,
      ): Promise<void> => {
        const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
          TestUtil.createExecuteFunctionsMock({
            paymentIds,
            additionalFields: {},
          });

        await expect(
          new ScheduleRemindersOperation('payment').execute.call(
            context as never,
            0,
          ),
        ).rejects.toThrow(message);
      },
    );

    it.each(['[1,2]', 'null', '"text"', '{invalid'])(
      'rejects template parameters that are not a JSON object (%s)',
      async (templateParameters: string): Promise<void> => {
        const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
          TestUtil.createExecuteFunctionsMock({
            paymentIds: 'payment-1',
            additionalFields: { template_parameters: templateParameters },
          });

        await expect(
          new ScheduleRemindersOperation('payment').execute.call(
            context as never,
            0,
          ),
        ).rejects.toThrow(NodeOperationError);
      },
    );
  });

  describe('formatDate', (): void => {
    it.each([
      [undefined, undefined],
      [null, undefined],
      ['', undefined],
      ['2025-01-15', '2025-01-15'],
      ['2025-01-15T23:59:59.000-03:00', '2025-01-15'],
      [new Date('2025-01-15T12:00:00Z'), '2025-01-15'],
      [{ toISO: (): string => '2025-03-10T08:00:00.000-03:00' }, '2025-03-10'],
      [{ toISO: (): null => null }, undefined],
      ['15/01/2025', '15/01/2025'],
    ])(
      'formats %p as %p',
      (value: unknown, expected: string | undefined): void => {
        expect(formatDate(value)).toBe(expected);
      },
    );
  });

  describe('buildDashboardQuery', (): void => {
    it('joins lists and drops empty values', (): void => {
      expect(
        buildDashboardQuery({
          statuses: ['PENDING'],
          billing_types: 'PIX,BOLETO',
          period: '',
        }),
      ).toEqual({ statuses: 'PENDING', billing_types: 'PIX,BOLETO' });
    });
  });

  it('registers every operation scoped to the resource', (): void => {
    const resource: PaymentResource = new PaymentResource();

    for (const name of [
      'list',
      'get',
      'create',
      'cancel',
      'acknowledgeOverdue',
      'scheduleReminders',
      'fillData',
      'getDashboard',
      'getTimeSeries',
      'getFunnelValues',
      'getChatValues',
    ]) {
      expectScopedProperties(resource.getOperation(name), 'payment');
    }
  });
});
