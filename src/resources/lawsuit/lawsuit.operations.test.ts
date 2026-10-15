import { TestUtil } from '@devantage/n8n-custom-nodes-framework';

import { describeOperationCases, expectScopedProperties } from '../../testing';
import { ClearActiveOperation } from './clear-active';
import { CreateOperation } from './create';
import { GetOperation } from './get';
import { LawsuitResource } from './lawsuit.resource';
import { ListOperation } from './list';
import { SetActiveOperation } from './set-active';
import { getLawsuitPath } from './shared';
import { UnbindConversationOperation } from './unbind-conversation';
import { UpdateOperation } from './update';

const CNJ: string = '0001234-56.2024.8.26.0100';
const ENCODED_CNJ: string = encodeURIComponent(CNJ);

describe('lawsuit operations', (): void => {
  describeOperationCases([
    {
      label: 'lists the lawsuits of a conversation',
      operation: new ListOperation('lawsuit'),
      parameters: {
        mode: 'conversation',
        conversationId: 'chat-1',
        maxMovements: 3,
      },
      method: 'get',
      response: { data: [{ numero_cnj: CNJ }] },
      expectedRequest: [
        'lawsuits',
        { conversation_id: 'chat-1', max_movements: 3 },
      ],
      expectedJson: { data: [{ numero_cnj: CNJ }] },
    },
    {
      label: 'lists the lawsuits of a contact',
      operation: new ListOperation('lawsuit'),
      parameters: { mode: 'contact', contactId: 'contact-1', maxMovements: 0 },
      method: 'get',
      response: { data: [] },
      expectedRequest: [
        'lawsuits',
        { contact_id: 'contact-1', max_movements: 0 },
      ],
      expectedJson: { data: [] },
    },
    {
      label: 'searches lawsuits',
      operation: new ListOperation('lawsuit'),
      parameters: {
        mode: 'search',
        returnAll: false,
        limit: 20,
        filters: { parte: 'Silva', status: 'RECURSAL', advogado_id: '' },
      },
      method: 'get',
      response: { data: [{ numero_cnj: CNJ }], pagination: {} },
      expectedRequest: [
        'lawsuits',
        { parte: 'Silva', status: 'RECURSAL', limit: 20 },
      ],
      expectedJson: { data: [{ numero_cnj: CNJ }], pagination: {} },
    },
    {
      label: 'creates a lawsuit',
      operation: new CreateOperation('lawsuit'),
      parameters: {
        cnj: ` ${CNJ} `,
        additionalFields: {
          conversation_id: 'chat-1',
          client_polo: 'ATIVO',
          set_as_active: true,
          contact_id: '',
        },
      },
      method: 'post',
      response: { data: { status: 'found' } },
      expectedRequest: [
        'lawsuits',
        {
          conversation_id: 'chat-1',
          client_polo: 'ATIVO',
          set_as_active: true,
          cnj: CNJ,
        },
      ],
      expectedJson: { status: 'found' },
    },
    {
      label: 'gets a lawsuit',
      operation: new GetOperation('lawsuit'),
      parameters: { cnj: CNJ, maxMovements: 10 },
      method: 'get',
      response: { data: { numero_cnj: CNJ } },
      expectedRequest: [`lawsuits/${ENCODED_CNJ}`, { max_movements: 10 }],
      expectedJson: { numero_cnj: CNJ },
    },
    {
      label: 'updates a lawsuit',
      operation: new UpdateOperation('lawsuit'),
      parameters: {
        cnj: CNJ,
        clearLawyer: false,
        updateFields: {
          status_operacional: 'ENCERRADO',
          advogado_user_id: 'user-1',
        },
      },
      method: 'patch',
      response: { data: { updated: true } },
      expectedRequest: [
        `lawsuits/${ENCODED_CNJ}`,
        undefined,
        { status_operacional: 'ENCERRADO', advogado_user_id: 'user-1' },
      ],
      expectedJson: { updated: true },
    },
    {
      label: 'clears the responsible lawyer of a lawsuit',
      operation: new UpdateOperation('lawsuit'),
      parameters: {
        cnj: CNJ,
        clearLawyer: true,
        updateFields: { advogado_user_id: 'user-1' },
      },
      method: 'patch',
      response: undefined,
      expectedRequest: [
        `lawsuits/${ENCODED_CNJ}`,
        undefined,
        { advogado_user_id: null },
      ],
      expectedJson: { success: true },
    },
    {
      label: 'unbinds a conversation from a lawsuit',
      operation: new UnbindConversationOperation('lawsuit'),
      parameters: { cnj: CNJ, conversationId: 'chat-1' },
      method: 'delete',
      response: { data: { unbound: true } },
      expectedRequest: [
        `lawsuits/${ENCODED_CNJ}`,
        { conversation_id: 'chat-1' },
      ],
      expectedJson: { unbound: true },
    },
    {
      label: 'sets the active lawsuit of a conversation',
      operation: new SetActiveOperation('lawsuit'),
      parameters: { cnj: CNJ, conversationId: 'chat-1' },
      method: 'put',
      response: '',
      expectedRequest: [
        `lawsuits/${ENCODED_CNJ}/active`,
        undefined,
        { conversation_id: 'chat-1' },
      ],
      expectedJson: { success: true },
    },
    {
      label: 'clears the active lawsuit of a conversation',
      operation: new ClearActiveOperation('lawsuit'),
      parameters: { cnj: CNJ, conversationId: 'chat-1' },
      method: 'delete',
      response: { data: { cleared: true } },
      expectedRequest: [
        `lawsuits/${ENCODED_CNJ}/active`,
        { conversation_id: 'chat-1' },
      ],
      expectedJson: { cleared: true },
    },
  ]);

  it('requires at least one field to update', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        cnj: CNJ,
        clearLawyer: false,
        updateFields: {},
      });

    await expect(
      new UpdateOperation('lawsuit').execute.call(context as never, 0),
    ).rejects.toThrow('Please add at least one field to update');
  });

  it('encodes the CNJ number in the path', (): void => {
    expect(getLawsuitPath(' 0001234-56.2024.8.26.0100/x ', '/active')).toBe(
      'lawsuits/0001234-56.2024.8.26.0100%2Fx/active',
    );
  });

  it('only shows the pagination properties in search mode', (): void => {
    const operation: ListOperation = new ListOperation('lawsuit');

    for (const name of ['returnAll', 'limit', 'filters']) {
      expect(
        operation.properties.find(
          (curProperty: { name: string }): boolean => curProperty.name === name,
        )?.displayOptions?.show?.mode,
      ).toEqual(['search']);
    }
  });

  it('registers every operation scoped to the resource', (): void => {
    const resource: LawsuitResource = new LawsuitResource();

    for (const name of [
      'list',
      'get',
      'create',
      'update',
      'unbindConversation',
      'setActive',
      'clearActive',
    ]) {
      expectScopedProperties(resource.getOperation(name), 'lawsuit');
    }
  });
});
