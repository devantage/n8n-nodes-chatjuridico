import { TestUtil } from '@devantage/n8n-custom-nodes-framework';
import type { INodeExecutionData } from 'n8n-workflow';

import { describeOperationCases, expectScopedProperties } from '../../testing';
import { httpClient } from '../../utils';
import { ConversationResource } from './conversation.resource';
import { CountOperation } from './count';
import { CreateOperation } from './create';
import { GetOperation } from './get';
import { ListOperation } from './list';
import { SearchOperation } from './search';
import { parseSearchFilterValue } from './shared';
import { TransferOperation } from './transfer';
import { UpdateOperation } from './update';

describe('conversation operations', (): void => {
  describeOperationCases([
    {
      label: 'lists conversations with filters',
      operation: new ListOperation('conversation'),
      parameters: {
        returnAll: false,
        limit: 25,
        filters: {
          search: 'João',
          tag_ids: ['tag-1', 'tag-2'],
          instance_id: 'instance-1',
          stage_id: '',
          responsible_id: 'none',
          is_archived: false,
          sort_by: 'name',
        },
      },
      method: 'get',
      response: { data: [{ id: 'conversation-1' }], pagination: {} },
      expectedRequest: [
        'conversations',
        {
          search: 'João',
          tag_ids: 'tag-1,tag-2',
          instance_id: 'instance-1',
          responsible_id: 'none',
          is_archived: false,
          sort_by: 'name',
          limit: 25,
        },
      ],
      expectedJson: { data: [{ id: 'conversation-1' }], pagination: {} },
    },
    {
      label: 'lists all conversations using the max page size',
      operation: new ListOperation('conversation'),
      parameters: { returnAll: true, filters: { tag_ids: [] } },
      method: 'get',
      response: {
        data: [{ id: 'conversation-1' }],
        pagination: { has_more: false, next_cursor: null, limit: 200 },
      },
      expectedRequest: ['conversations', { limit: 200 }],
      expectedJson: { data: [{ id: 'conversation-1' }] },
    },
    {
      label: 'creates a conversation',
      operation: new CreateOperation('conversation'),
      parameters: { contactId: 'contact-1', instanceId: 'instance-1' },
      method: 'post',
      response: { data: { id: 'conversation-1' } },
      expectedRequest: [
        'conversations',
        { contact_id: 'contact-1', instance_id: 'instance-1' },
      ],
      expectedJson: { id: 'conversation-1' },
    },
    {
      label: 'counts conversations',
      operation: new CountOperation('conversation'),
      parameters: {
        filters: {
          stage_id: 'stage-1',
          tag_ids: ['tag-1'],
          has_unread: true,
        },
      },
      method: 'get',
      response: { data: { count: 7 } },
      expectedRequest: [
        'conversations/count',
        { stage_id: 'stage-1', tag_ids: 'tag-1', has_unread: true },
      ],
      expectedJson: { count: 7 },
    },
    {
      label: 'searches conversations with filters, sort and cursor',
      operation: new SearchOperation('conversation'),
      parameters: {
        returnAll: false,
        limit: 20,
        filters: {
          filter: [
            { field: 'is_archived', operator: 'eq', value: 'false' },
            { field: 'tags_ids', operator: 'overlaps', value: 'tag-1, tag-2' },
            { field: 'unread_messages_count', operator: 'gt', value: '2' },
            { field: 'accountable_id', operator: 'is_null', value: '' },
            {
              field: 'last_message_text',
              operator: 'ilike',
              value: '%contrato%',
            },
          ],
        },
        sort: { rule: [{ field: 'created_at', direction: 'asc' }] },
        options: { cursor: 'cursor-1' },
      },
      method: 'post',
      response: { data: [{ id: 'conversation-1' }], pagination: {} },
      expectedRequest: [
        'conversations/search',
        {
          filters: [
            { field: 'is_archived', operator: 'eq', value: false },
            {
              field: 'tags_ids',
              operator: 'overlaps',
              value: ['tag-1', 'tag-2'],
            },
            { field: 'unread_messages_count', operator: 'gt', value: 2 },
            { field: 'accountable_id', operator: 'is_null', value: true },
            {
              field: 'last_message_text',
              operator: 'ilike',
              value: '%contrato%',
            },
          ],
          sort: [{ field: 'created_at', direction: 'asc' }],
          cursor: 'cursor-1',
          limit: 20,
        },
      ],
      expectedJson: { data: [{ id: 'conversation-1' }], pagination: {} },
    },
    {
      label: 'searches conversations without filters',
      operation: new SearchOperation('conversation'),
      parameters: {
        returnAll: false,
        limit: 50,
        filters: {},
        sort: {},
        options: {},
      },
      method: 'post',
      response: { data: [] },
      expectedRequest: ['conversations/search', { limit: 50 }],
      expectedJson: { data: [] },
    },
    {
      label: 'gets a conversation',
      operation: new GetOperation('conversation'),
      parameters: { conversationId: 'conversation-1' },
      method: 'get',
      response: { data: { id: 'conversation-1' } },
      expectedRequest: ['conversations/conversation-1'],
      expectedJson: { id: 'conversation-1' },
    },
    {
      label: 'updates a conversation',
      operation: new UpdateOperation('conversation'),
      parameters: {
        conversationId: 'conversation-1',
        updateFields: {
          tag_ids: ['tag-1'],
          accountable_id: 'member-1',
          is_archived: false,
          stage_id: '',
        },
      },
      method: 'patch',
      response: { data: { id: 'conversation-1' } },
      expectedRequest: [
        'conversations/conversation-1',
        undefined,
        { tag_ids: ['tag-1'], accountable_id: 'member-1', is_archived: false },
      ],
      expectedJson: { id: 'conversation-1' },
    },
    {
      label: 'transfers a conversation to a member with a note',
      operation: new TransferOperation('conversation'),
      parameters: {
        conversationId: 'conversation-1',
        memberId: 'member-1',
        additionalFields: { note: 'Cliente pediu retorno', department_id: '' },
      },
      method: 'post',
      response: { data: { id: 'conversation-1' } },
      expectedRequest: [
        'conversations/conversation-1/transfer',
        { member_id: 'member-1', note: 'Cliente pediu retorno' },
      ],
      expectedJson: { id: 'conversation-1' },
    },
    {
      label: 'transfers a conversation to a department',
      operation: new TransferOperation('conversation'),
      parameters: {
        conversationId: 'conversation-1',
        memberId: '',
        additionalFields: { department_id: 'department-1' },
      },
      method: 'post',
      response: { data: { id: 'conversation-1' } },
      expectedRequest: [
        'conversations/conversation-1/transfer',
        { department_id: 'department-1' },
      ],
      expectedJson: { id: 'conversation-1' },
    },
  ]);

  it('searches all conversations following the cursor', async (): Promise<void> => {
    const postSpy: jest.SpyInstance = jest
      .spyOn(httpClient, 'post')
      .mockResolvedValueOnce({
        data: [{ id: 'conversation-1' }],
        pagination: { has_more: true, next_cursor: 'cursor-2', limit: 200 },
      })
      .mockResolvedValueOnce({
        data: [{ id: 'conversation-2' }],
        pagination: { has_more: false, next_cursor: null, limit: 200 },
      });
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        returnAll: true,
        filters: {
          filter: [{ field: 'is_waiting_human', operator: 'eq', value: true }],
        },
        sort: {},
        options: {},
      });

    const result: INodeExecutionData = await new SearchOperation(
      'conversation',
    ).execute.call(context as never, 0);

    const filters: unknown[] = [
      { field: 'is_waiting_human', operator: 'eq', value: true },
    ];

    expect(postSpy).toHaveBeenNthCalledWith(
      1,
      context,
      'conversations/search',
      { filters, limit: 200 },
    );
    expect(postSpy).toHaveBeenNthCalledWith(
      2,
      context,
      'conversations/search',
      { filters, limit: 200, cursor: 'cursor-2' },
    );
    expect(result).toEqual({
      json: { data: [{ id: 'conversation-1' }, { id: 'conversation-2' }] },
      pairedItem: 0,
    });
  });

  it('requires at least one field to update', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        conversationId: 'conversation-1',
        updateFields: { stage_id: '' },
      });

    await expect(
      new UpdateOperation('conversation').execute.call(context as never, 0),
    ).rejects.toThrow('Please add at least one field to update');
  });

  it('requires a member or a department to transfer', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        conversationId: 'conversation-1',
        memberId: '',
        additionalFields: { note: 'Sem destino' },
      });

    await expect(
      new TransferOperation('conversation').execute.call(context as never, 0),
    ).rejects.toThrow(
      'Please specify a member and/or a department to transfer the conversation to',
    );
  });

  it('registers every operation scoped to the resource', (): void => {
    const resource: ConversationResource = new ConversationResource();

    for (const name of [
      'list',
      'search',
      'count',
      'get',
      'create',
      'update',
      'transfer',
    ]) {
      expectScopedProperties(resource.getOperation(name), 'conversation');
    }
  });

  describe('parseSearchFilterValue', (): void => {
    it.each<[string, string, unknown, unknown]>([
      ['is_archived', 'eq', 'TRUE', true],
      ['is_archived', 'eq', false, false],
      ['unread_messages_count', 'gte', 3, 3],
      ['unread_messages_count', 'eq', 'abc', 'abc'],
      ['unread_messages_count', 'in', '1, 2', [1, 2]],
      ['contact_id', 'in', ['id-1', 'id-2'], ['id-1', 'id-2']],
      ['accountable_id', 'is_null', 'false', false],
      ['accountable_id', 'is_null', undefined, true],
      ['last_message_type', 'eq', { type: 'text' }, '{"type":"text"}'],
      ['last_message_type', 'eq', null, ''],
    ])(
      'converts %s %s %p',
      (field: string, operator: string, value: unknown, expected: unknown) => {
        expect(parseSearchFilterValue(field, operator, value)).toEqual(
          expected,
        );
      },
    );
  });
});
