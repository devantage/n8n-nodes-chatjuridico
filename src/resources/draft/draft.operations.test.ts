import { describeOperationCases, expectScopedProperties } from '../../testing';
import { DeleteOperation } from './delete';
import { DraftResource } from './draft.resource';
import { GetOperation } from './get';
import { ListOperation } from './list';
import { SaveOperation } from './save';

describe('draft operations', (): void => {
  describeOperationCases([
    {
      label: 'lists drafts',
      operation: new ListOperation('draft'),
      parameters: { limit: 20 },
      method: 'get',
      response: { data: [{ id: 'draft-1', contact_name: 'João' }] },
      expectedRequest: ['drafts', { limit: 20 }],
      expectedJson: { data: [{ id: 'draft-1', contact_name: 'João' }] },
    },
    {
      label: 'gets the draft of a conversation',
      operation: new GetOperation('draft'),
      parameters: { conversationId: 'conversation-1' },
      method: 'get',
      response: { data: { id: 'draft-1' } },
      expectedRequest: ['conversations/conversation-1/draft'],
      expectedJson: { id: 'draft-1' },
    },
    {
      label: 'saves the draft of a conversation',
      operation: new SaveOperation('draft'),
      parameters: { conversationId: 'conversation-1', draftText: 'Rascunho' },
      method: 'put',
      response: { data: { id: 'draft-1', draft_text: 'Rascunho' } },
      expectedRequest: [
        'conversations/conversation-1/draft',
        undefined,
        { draft_text: 'Rascunho' },
      ],
      expectedJson: { id: 'draft-1', draft_text: 'Rascunho' },
    },
    {
      label: 'deletes the draft of a conversation',
      operation: new DeleteOperation('draft'),
      parameters: { conversationId: 'conversation-1' },
      method: 'delete',
      response: { data: { deleted: true } },
      expectedRequest: ['conversations/conversation-1/draft'],
      expectedJson: { deleted: true },
    },
  ]);

  it('registers every operation scoped to the resource', (): void => {
    const resource: DraftResource = new DraftResource();

    for (const name of ['list', 'get', 'save', 'delete']) {
      expectScopedProperties(resource.getOperation(name), 'draft');
    }
  });
});
