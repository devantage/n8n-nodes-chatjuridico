import { TestUtil } from '@devantage/n8n-custom-nodes-framework';
import { NodeOperationError } from 'n8n-workflow';

import { describeOperationCases, expectScopedProperties } from '../../testing';
import { CreateOperation } from './create';
import { DeleteOperation } from './delete';
import { GetOperation } from './get';
import { ListOperation } from './list';
import { TestOperation } from './test';
import { UpdateOperation } from './update';
import { WebhookResource } from './webhook.resource';

describe('webhook operations', (): void => {
  describeOperationCases([
    {
      label: 'lists webhooks filtered by status',
      operation: new ListOperation('webhook'),
      parameters: { filters: { is_active: false } },
      method: 'get',
      response: { data: [{ id: 'webhook-1' }] },
      expectedRequest: ['webhooks', { is_active: false }],
      expectedJson: { data: [{ id: 'webhook-1' }] },
    },
    {
      label: 'gets a webhook',
      operation: new GetOperation('webhook'),
      parameters: { webhookId: 'webhook-1' },
      method: 'get',
      response: { data: { id: 'webhook-1' } },
      expectedRequest: ['webhooks/webhook-1'],
      expectedJson: { id: 'webhook-1' },
    },
    {
      label: 'creates a webhook with filters',
      operation: new CreateOperation('webhook'),
      parameters: {
        url: 'https://example.com/hook',
        events: ['message.received'],
        additionalFields: {
          description: 'Inbound messages',
          filters: '{"direction":"inbound"}',
        },
      },
      method: 'post',
      response: { data: { id: 'webhook-1', secret: 'secret' } },
      expectedRequest: [
        'webhooks',
        {
          url: 'https://example.com/hook',
          events: ['message.received'],
          description: 'Inbound messages',
          filters: { direction: 'inbound' },
        },
      ],
      expectedJson: { id: 'webhook-1', secret: 'secret' },
    },
    {
      label: 'creates a webhook without additional fields',
      operation: new CreateOperation('webhook'),
      parameters: {
        url: 'https://example.com/hook',
        events: ['contact.created'],
        additionalFields: {},
      },
      method: 'post',
      response: { data: { id: 'webhook-2' } },
      expectedRequest: [
        'webhooks',
        { url: 'https://example.com/hook', events: ['contact.created'] },
      ],
      expectedJson: { id: 'webhook-2' },
    },
    {
      label: 'updates a webhook',
      operation: new UpdateOperation('webhook'),
      parameters: {
        webhookId: 'webhook-1',
        updateFields: {
          events: ['message.sent', 'message.status_changed'],
          is_active: false,
          filters: { message_types: ['text'] },
        },
      },
      method: 'patch',
      response: { data: { id: 'webhook-1' } },
      expectedRequest: [
        'webhooks/webhook-1',
        undefined,
        {
          events: ['message.sent', 'message.status_changed'],
          is_active: false,
          filters: { message_types: ['text'] },
        },
      ],
      expectedJson: { id: 'webhook-1' },
    },
    {
      label: 'deletes a webhook',
      operation: new DeleteOperation('webhook'),
      parameters: { webhookId: 'webhook-1' },
      method: 'delete',
      response: { data: { deleted: true } },
      expectedRequest: ['webhooks/webhook-1'],
      expectedJson: { deleted: true },
    },
    {
      label: 'tests a webhook',
      operation: new TestOperation('webhook'),
      parameters: { webhookId: 'webhook-1' },
      method: 'post',
      response: { data: { delivered: true, status_code: 200 } },
      expectedRequest: ['webhooks/webhook-1/test'],
      expectedJson: { delivered: true, status_code: 200 },
    },
  ]);

  it('requires at least one field to update', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        webhookId: 'webhook-1',
        updateFields: { events: [], url: '' },
      });

    await expect(
      new UpdateOperation('webhook').execute.call(context as never, 0),
    ).rejects.toThrow('Please add at least one field to update');
  });

  it('rejects invalid filters JSON', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        url: 'https://example.com/hook',
        events: ['message.received'],
        additionalFields: { filters: '{invalid' },
      });

    await expect(
      new CreateOperation('webhook').execute.call(context as never, 0),
    ).rejects.toThrow(NodeOperationError);
  });

  it('registers every operation scoped to the resource', (): void => {
    const resource: WebhookResource = new WebhookResource();

    for (const name of ['list', 'get', 'create', 'update', 'delete', 'test']) {
      expectScopedProperties(resource.getOperation(name), 'webhook');
    }
  });
});
