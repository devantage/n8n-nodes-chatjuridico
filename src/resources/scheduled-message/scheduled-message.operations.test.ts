import { TestUtil } from '@devantage/n8n-custom-nodes-framework';

import { describeOperationCases, expectScopedProperties } from '../../testing';
import { CancelOperation } from './cancel';
import { CreateOperation } from './create';
import { GetOperation } from './get';
import { ListOperation } from './list';
import { ScheduledMessageResource } from './scheduled-message.resource';

describe('scheduled message operations', (): void => {
  describeOperationCases([
    {
      label: 'lists scheduled messages with filters',
      operation: new ListOperation('scheduledMessage'),
      parameters: {
        returnAll: false,
        limit: 10,
        filters: {
          status: 'pending',
          conversation_id: 'conversation-1',
          after: '2026-10-01T00:00:00',
          before: '',
        },
      },
      method: 'get',
      response: { data: [{ id: 'scheduled-1' }], pagination: {} },
      expectedRequest: [
        'scheduled-messages',
        {
          status: 'pending',
          conversation_id: 'conversation-1',
          after: '2026-10-01T00:00:00',
          limit: 10,
        },
      ],
      expectedJson: { data: [{ id: 'scheduled-1' }], pagination: {} },
    },
    {
      label: 'schedules a text message',
      operation: new CreateOperation('scheduledMessage'),
      parameters: {
        conversationId: 'conversation-1',
        scheduledAt: '2026-10-20T09:00:00',
        messageType: 'text',
        text: 'Lembrete da consulta',
        options: { idempotencyKey: 'key-1' },
      },
      method: 'post',
      response: { data: { id: 'scheduled-1', status: 'pending' } },
      expectedRequest: [
        'scheduled-messages',
        {
          conversation_id: 'conversation-1',
          scheduled_at: '2026-10-20T09:00:00',
          message_type: 'text',
          text: 'Lembrete da consulta',
        },
        undefined,
        { headers: { 'X-Idempotency-Key': 'key-1' } },
      ],
      expectedJson: { id: 'scheduled-1', status: 'pending' },
    },
    {
      label: 'schedules a media message',
      operation: new CreateOperation('scheduledMessage'),
      parameters: {
        conversationId: 'conversation-1',
        scheduledAt: '2026-10-20T09:00:00',
        messageType: 'image',
        text: '',
        fileUrl: 'https://cdn/foto.jpg',
        options: {},
      },
      method: 'post',
      response: { data: { id: 'scheduled-1' } },
      expectedRequest: [
        'scheduled-messages',
        {
          conversation_id: 'conversation-1',
          scheduled_at: '2026-10-20T09:00:00',
          message_type: 'image',
          file_url: 'https://cdn/foto.jpg',
        },
        undefined,
        undefined,
      ],
      expectedJson: { id: 'scheduled-1' },
    },
    {
      label: 'schedules a template message',
      operation: new CreateOperation('scheduledMessage'),
      parameters: {
        conversationId: 'conversation-1',
        scheduledAt: '2026-10-20T09:00:00',
        messageType: 'template',
        templateName: 'appointment_reminder',
        templateLanguage: 'pt_BR',
        templateParameters: {
          parameter: [{ key: 'body_1', value: 'João' }],
        },
        options: {},
      },
      method: 'post',
      response: { data: { id: 'scheduled-1' } },
      expectedRequest: [
        'scheduled-messages',
        {
          conversation_id: 'conversation-1',
          scheduled_at: '2026-10-20T09:00:00',
          message_type: 'template',
          template_name: 'appointment_reminder',
          template_language: 'pt_BR',
          template_parameters: { body_1: 'João' },
        },
        undefined,
        undefined,
      ],
      expectedJson: { id: 'scheduled-1' },
    },
    {
      label: 'gets a scheduled message',
      operation: new GetOperation('scheduledMessage'),
      parameters: { scheduledMessageId: 'scheduled-1' },
      method: 'get',
      response: { data: { id: 'scheduled-1' } },
      expectedRequest: ['scheduled-messages/scheduled-1'],
      expectedJson: { id: 'scheduled-1' },
    },
    {
      label: 'cancels a scheduled message',
      operation: new CancelOperation('scheduledMessage'),
      parameters: { scheduledMessageId: 'scheduled-1' },
      method: 'delete',
      response: { data: { id: 'scheduled-1', status: 'canceled' } },
      expectedRequest: ['scheduled-messages/scheduled-1'],
      expectedJson: { id: 'scheduled-1', status: 'canceled' },
    },
  ]);

  it('requires the text of text messages', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        conversationId: 'conversation-1',
        scheduledAt: '2026-10-20T09:00:00',
        messageType: 'text',
        text: '',
        options: {},
      });

    await expect(
      new CreateOperation('scheduledMessage').execute.call(context as never, 0),
    ).rejects.toThrow('Text is required for text messages');
  });

  it('registers every operation scoped to the resource', (): void => {
    const resource: ScheduledMessageResource = new ScheduledMessageResource();

    for (const name of ['list', 'get', 'create', 'cancel']) {
      expectScopedProperties(resource.getOperation(name), 'scheduledMessage');
    }
  });
});
