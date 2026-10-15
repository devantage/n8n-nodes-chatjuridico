import { TestUtil } from '@devantage/n8n-custom-nodes-framework';
import { NodeOperationError } from 'n8n-workflow';

import { describeOperationCases, expectScopedProperties } from '../../testing';
import { DeleteOperation } from './delete';
import { GetOperation } from './get';
import { GetMediaOperation } from './get-media';
import { ListOperation } from './list';
import { MessageResource } from './message.resource';
import { ReactOperation } from './react';
import { SendOperation } from './send';
import { SendSequenceOperation } from './send-sequence';
import { getTemplateParameters } from './shared';
import { TranscribeOperation } from './transcribe';

const ids: Record<string, string> = {
  conversationId: 'conversation-1',
  messageId: 'message-1',
};

describe('message operations', (): void => {
  describeOperationCases([
    {
      label: 'lists messages with filters',
      operation: new ListOperation('message'),
      parameters: {
        conversationId: 'conversation-1',
        returnAll: false,
        limit: 100,
        filters: { from_me: false, type: 'audio', search: '' },
      },
      method: 'get',
      response: { data: [{ id: 'message-1' }], pagination: {} },
      expectedRequest: [
        'conversations/conversation-1/messages',
        { from_me: false, type: 'audio', limit: 100 },
      ],
      expectedJson: { data: [{ id: 'message-1' }], pagination: {} },
    },
    {
      label: 'sends a text message with options',
      operation: new SendOperation('message'),
      parameters: {
        conversationId: 'conversation-1',
        messageType: 'text',
        text: 'Olá!',
        options: {
          idempotencyKey: 'key-1',
          acting_as_human: true,
          instance_id: '',
        },
      },
      method: 'post',
      response: { data: { id: 'message-1', status: 'pending' } },
      expectedRequest: [
        'conversations/conversation-1/messages',
        { type: 'text', text: 'Olá!', acting_as_human: true },
        undefined,
        { headers: { 'X-Idempotency-Key': 'key-1' } },
      ],
      expectedJson: { id: 'message-1', status: 'pending' },
    },
    {
      label: 'sends a media message',
      operation: new SendOperation('message'),
      parameters: {
        conversationId: 'conversation-1',
        messageType: 'document',
        text: 'Contrato',
        fileUrl: 'https://cdn.example.com/contrato.pdf',
        options: { instance_id: 'instance-1' },
      },
      method: 'post',
      response: { data: { id: 'message-1' } },
      expectedRequest: [
        'conversations/conversation-1/messages',
        {
          type: 'document',
          text: 'Contrato',
          file_url: 'https://cdn.example.com/contrato.pdf',
          instance_id: 'instance-1',
        },
        undefined,
        undefined,
      ],
      expectedJson: { id: 'message-1' },
    },
    {
      label: 'sends a template with key-value parameters',
      operation: new SendOperation('message'),
      parameters: {
        conversationId: 'conversation-1',
        messageType: 'template',
        text: '',
        templateName: 'appointment_reminder',
        templateLanguage: 'pt_BR',
        templateInputMode: 'parameters',
        templateParameters: {
          parameter: [
            { key: 'body_1', value: 'João' },
            { key: ' body_2 ', value: '10h' },
            { key: '', value: 'ignored' },
          ],
        },
        options: {},
      },
      method: 'post',
      response: { data: { id: 'message-1' } },
      expectedRequest: [
        'conversations/conversation-1/messages',
        {
          type: 'template',
          template: {
            name: 'appointment_reminder',
            language: 'pt_BR',
            parameters: { body_1: 'João', body_2: '10h' },
          },
        },
        undefined,
        undefined,
      ],
      expectedJson: { id: 'message-1' },
    },
    {
      label: 'sends a template with raw components',
      operation: new SendOperation('message'),
      parameters: {
        conversationId: 'conversation-1',
        messageType: 'template',
        text: 'Lembrete',
        templateName: 'appointment_reminder',
        templateLanguage: 'en_US',
        templateInputMode: 'components',
        templateComponents:
          '[{"type":"body","parameters":[{"type":"text","text":"João"}]}]',
        options: {},
      },
      method: 'post',
      response: { data: { id: 'message-1' } },
      expectedRequest: [
        'conversations/conversation-1/messages',
        {
          type: 'template',
          text: 'Lembrete',
          template: {
            name: 'appointment_reminder',
            language: 'en_US',
            components: [
              {
                type: 'body',
                parameters: [{ type: 'text', text: 'João' }],
              },
            ],
          },
        },
        undefined,
        undefined,
      ],
      expectedJson: { id: 'message-1' },
    },
    {
      label: 'sends an interactive menu',
      operation: new SendOperation('message'),
      parameters: {
        conversationId: 'conversation-1',
        messageType: 'interactive',
        interactive: '{"type":"poll","text":"Horário?","choices":["9h","10h"]}',
        options: {},
      },
      method: 'post',
      response: { data: { id: 'message-1' } },
      expectedRequest: [
        'conversations/conversation-1/messages',
        {
          type: 'interactive',
          interactive: {
            type: 'poll',
            text: 'Horário?',
            choices: ['9h', '10h'],
          },
        },
        undefined,
        undefined,
      ],
      expectedJson: { id: 'message-1' },
    },
    {
      label: 'sends a message sequence',
      operation: new SendSequenceOperation('message'),
      parameters: {
        conversationId: 'conversation-1',
        idempotencyKey: 'sequence-1',
        items: [
          {
            client_item_id: 'confirmation',
            message: { type: 'text', text: 'Confirmado' },
          },
        ],
      },
      method: 'post',
      response: { data: { batch_id: 'batch-1', created_count: 1 } },
      expectedRequest: [
        'conversations/conversation-1/message-sequence',
        {
          idempotency_key: 'sequence-1',
          items: [
            {
              client_item_id: 'confirmation',
              message: { type: 'text', text: 'Confirmado' },
            },
          ],
        },
      ],
      expectedJson: { batch_id: 'batch-1', created_count: 1 },
    },
    {
      label: 'gets a message',
      operation: new GetOperation('message'),
      parameters: ids,
      method: 'get',
      response: { data: { id: 'message-1' } },
      expectedRequest: ['conversations/conversation-1/messages/message-1'],
      expectedJson: { id: 'message-1' },
    },
    {
      label: 'deletes a message',
      operation: new DeleteOperation('message'),
      parameters: ids,
      method: 'delete',
      response: { data: { deleted: true } },
      expectedRequest: ['conversations/conversation-1/messages/message-1'],
      expectedJson: { deleted: true },
    },
    {
      label: 'reacts to a message',
      operation: new ReactOperation('message'),
      parameters: { ...ids, emoji: '👍' },
      method: 'post',
      response: { data: { message_id: 'message-1', emoji: '👍' } },
      expectedRequest: [
        'conversations/conversation-1/messages/message-1/react',
        { emoji: '👍' },
      ],
      expectedJson: { message_id: 'message-1', emoji: '👍' },
    },
    {
      label: 'transcribes an audio message',
      operation: new TranscribeOperation('message'),
      parameters: ids,
      method: 'post',
      response: { data: { message_id: 'message-1', transcription: 'Olá' } },
      expectedRequest: [
        'conversations/conversation-1/messages/message-1/transcribe',
      ],
      expectedJson: { message_id: 'message-1', transcription: 'Olá' },
    },
    {
      label: 'gets the media of a message',
      operation: new GetMediaOperation('message'),
      parameters: ids,
      method: 'get',
      response: { data: { message_id: 'message-1', file_url: 'https://x' } },
      expectedRequest: [
        'conversations/conversation-1/messages/message-1/media',
      ],
      expectedJson: { message_id: 'message-1', file_url: 'https://x' },
    },
  ]);

  it('requires the text of text messages', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        conversationId: 'conversation-1',
        messageType: 'text',
        text: '',
        options: {},
      });

    await expect(
      new SendOperation('message').execute.call(context as never, 0),
    ).rejects.toThrow('Text is required for text messages');
  });

  it('rejects template components that are not arrays', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        conversationId: 'conversation-1',
        messageType: 'template',
        text: '',
        templateName: 'reminder',
        templateLanguage: 'pt_BR',
        templateInputMode: 'components',
        templateComponents: '{"type":"body"}',
        options: {},
      });

    await expect(
      new SendOperation('message').execute.call(context as never, 0),
    ).rejects.toThrow('Template Components must be a JSON array');
  });

  it.each<[string, unknown]>([
    ['an object', '{"client_item_id":"a"}'],
    ['an empty array', '[]'],
    ['more than 10 items', JSON.stringify(new Array(11).fill({}))],
  ])(
    'rejects sequence items that are %s',
    async (_label: string, items: unknown): Promise<void> => {
      const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
        TestUtil.createExecuteFunctionsMock({
          conversationId: 'conversation-1',
          idempotencyKey: 'sequence-1',
          items,
        });

      await expect(
        new SendSequenceOperation('message').execute.call(context as never, 0),
      ).rejects.toThrow(NodeOperationError);
    },
  );

  it('registers every operation scoped to the resource', (): void => {
    const resource: MessageResource = new MessageResource();

    for (const name of [
      'list',
      'send',
      'sendSequence',
      'get',
      'delete',
      'react',
      'transcribe',
      'getMedia',
    ]) {
      expectScopedProperties(resource.getOperation(name), 'message');
    }
  });

  describe('getTemplateParameters', (): void => {
    it('returns undefined without parameters', (): void => {
      expect(getTemplateParameters(undefined)).toBeUndefined();
      expect(getTemplateParameters({ parameter: [] })).toBeUndefined();
    });

    it('stringifies non-string values', (): void => {
      expect(
        getTemplateParameters({
          parameter: [
            { key: 'body_1', value: 10 },
            { key: 'body_2' },
            { key: 'body_3', value: null },
          ],
        }),
      ).toEqual({ body_1: '10', body_2: '', body_3: '' });
    });
  });
});
