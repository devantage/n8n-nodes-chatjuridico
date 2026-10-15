import { TestUtil } from '@devantage/n8n-custom-nodes-framework';
import { NodeOperationError } from 'n8n-workflow';

import { describeOperationCases, expectScopedProperties } from '../../testing';
import { CreateOperation } from './create';
import { DeleteOperation } from './delete';
import { FaqResource } from './faq.resource';
import { GenerateOperation } from './generate';
import { ListOperation } from './list';
import { SuggestFromConversationsOperation } from './suggest-from-conversations';
import { UpdateOperation } from './update';

describe('faq operations', (): void => {
  describeOperationCases([
    {
      label: 'lists FAQ items',
      operation: new ListOperation('faq'),
      parameters: { agentId: 'agent-1' },
      method: 'get',
      response: { data: [{ id: 'item-1', question: 'Q', answer: 'A' }] },
      expectedRequest: ['agents/agent-1/faq'],
      expectedJson: { data: [{ id: 'item-1', question: 'Q', answer: 'A' }] },
    },
    {
      label: 'creates a single FAQ item',
      operation: new CreateOperation('faq'),
      parameters: {
        agentId: 'agent-1',
        mode: 'single',
        question: 'Q',
        answer: 'A',
      },
      method: 'post',
      response: { data: [{ id: 'item-1', question: 'Q', answer: 'A' }] },
      expectedRequest: ['agents/agent-1/faq', { question: 'Q', answer: 'A' }],
      expectedJson: { data: [{ id: 'item-1', question: 'Q', answer: 'A' }] },
    },
    {
      label: 'creates FAQ items in bulk',
      operation: new CreateOperation('faq'),
      parameters: {
        agentId: 'agent-1',
        mode: 'bulk',
        items:
          '[{"question":"Q1","answer":"A1"},{"question":"Q2","answer":"A2"}]',
      },
      method: 'post',
      response: { data: [{ id: 'item-1' }, { id: 'item-2' }] },
      expectedRequest: [
        'agents/agent-1/faq',
        {
          items: [
            { question: 'Q1', answer: 'A1' },
            { question: 'Q2', answer: 'A2' },
          ],
        },
      ],
      expectedJson: { data: [{ id: 'item-1' }, { id: 'item-2' }] },
    },
    {
      label: 'updates an FAQ item',
      operation: new UpdateOperation('faq'),
      parameters: {
        agentId: 'agent-1',
        itemId: 'item-1',
        updateFields: { answer: 'New answer', question: '' },
      },
      method: 'put',
      response: { data: { id: 'item-1', answer: 'New answer' } },
      expectedRequest: [
        'agents/agent-1/faq/item-1',
        undefined,
        { answer: 'New answer' },
      ],
      expectedJson: { id: 'item-1', answer: 'New answer' },
    },
    {
      label: 'deletes an FAQ item',
      operation: new DeleteOperation('faq'),
      parameters: { agentId: 'agent-1', itemId: 'item-1' },
      method: 'delete',
      response: { data: { deleted: true, question: 'Q' } },
      expectedRequest: ['agents/agent-1/faq/item-1'],
      expectedJson: { deleted: true, question: 'Q' },
    },
    {
      label: 'generates FAQ items',
      operation: new GenerateOperation('faq'),
      parameters: {
        agentId: 'agent-1',
        prompt: 'Labor law firm in São Paulo',
        count: 5,
      },
      method: 'post',
      response: { data: { faqs: [], count: 0 } },
      expectedRequest: [
        'agents/agent-1/faq/generate',
        { prompt: 'Labor law firm in São Paulo', count: 5 },
      ],
      expectedJson: { faqs: [], count: 0 },
    },
    {
      label: 'suggests FAQ items from specific conversations',
      operation: new SuggestFromConversationsOperation('faq'),
      parameters: {
        agentId: 'agent-1',
        options: { conversation_ids: 'chat-1, chat-2', days: 14, limit: 5 },
      },
      method: 'post',
      response: { data: { faqs: [], count: 0, conversations_analyzed: 2 } },
      expectedRequest: [
        'agents/agent-1/faq/suggest-from-conversations',
        { conversation_ids: ['chat-1', 'chat-2'], days: 14, limit: 5 },
      ],
      expectedJson: { faqs: [], count: 0, conversations_analyzed: 2 },
    },
    {
      label: 'suggests FAQ items without options',
      operation: new SuggestFromConversationsOperation('faq'),
      parameters: { agentId: 'agent-1', options: { conversation_ids: ' ' } },
      method: 'post',
      response: { data: { faqs: [], count: 0, conversations_analyzed: 0 } },
      expectedRequest: ['agents/agent-1/faq/suggest-from-conversations', {}],
      expectedJson: { faqs: [], count: 0, conversations_analyzed: 0 },
    },
  ]);

  it.each([
    ['{"question":"Q"}'],
    ['[]'],
    [JSON.stringify(new Array(51).fill({}))],
  ])('rejects invalid bulk items %#', async (items: string): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        agentId: 'agent-1',
        mode: 'bulk',
        items,
      });

    await expect(
      new CreateOperation('faq').execute.call(context as never, 0),
    ).rejects.toThrow(NodeOperationError);
  });

  it('requires at least one field to update', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        agentId: 'agent-1',
        itemId: 'item-1',
        updateFields: {},
      });

    await expect(
      new UpdateOperation('faq').execute.call(context as never, 0),
    ).rejects.toThrow('Please add at least one field to update');
  });

  it('registers every operation scoped to the resource', (): void => {
    const resource: FaqResource = new FaqResource();

    for (const name of [
      'list',
      'create',
      'update',
      'delete',
      'generate',
      'suggestFromConversations',
    ]) {
      expectScopedProperties(resource.getOperation(name), 'faq');
    }
  });
});
