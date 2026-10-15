import { describeOperationCases, expectScopedProperties } from '../../testing';
import { AnnotationResource } from './annotation.resource';
import { CreateOperation } from './create';
import { DeleteOperation } from './delete';
import { GetOperation } from './get';
import { ListOperation } from './list';
import { UpdateOperation } from './update';

const ids: Record<string, string> = {
  conversationId: 'conversation-1',
  annotationId: 'note-1',
};

describe('annotation operations', (): void => {
  describeOperationCases([
    {
      label: 'lists the notes of a conversation',
      operation: new ListOperation('annotation'),
      parameters: { conversationId: 'conversation-1' },
      method: 'get',
      response: { data: [{ id: 'note-1' }] },
      expectedRequest: ['conversations/conversation-1/annotations'],
      expectedJson: { data: [{ id: 'note-1' }] },
    },
    {
      label: 'creates a note with mentions',
      operation: new CreateOperation('annotation'),
      parameters: {
        conversationId: 'conversation-1',
        text: 'Cliente enviou documentos',
        additionalFields: { mentions: ['member-1'], send_email: false },
      },
      method: 'post',
      response: { data: { id: 'note-1' } },
      expectedRequest: [
        'conversations/conversation-1/annotations',
        {
          text: 'Cliente enviou documentos',
          mentions: ['member-1'],
          send_email: false,
        },
      ],
      expectedJson: { id: 'note-1' },
    },
    {
      label: 'creates a note without mentions',
      operation: new CreateOperation('annotation'),
      parameters: {
        conversationId: 'conversation-1',
        text: 'Retornar amanhã',
        additionalFields: { mentions: [] },
      },
      method: 'post',
      response: { data: { id: 'note-1' } },
      expectedRequest: [
        'conversations/conversation-1/annotations',
        { text: 'Retornar amanhã' },
      ],
      expectedJson: { id: 'note-1' },
    },
    {
      label: 'gets a note',
      operation: new GetOperation('annotation'),
      parameters: ids,
      method: 'get',
      response: { data: { id: 'note-1' } },
      expectedRequest: ['conversations/conversation-1/annotations/note-1'],
      expectedJson: { id: 'note-1' },
    },
    {
      label: 'updates a note',
      operation: new UpdateOperation('annotation'),
      parameters: { ...ids, text: 'Texto revisado' },
      method: 'patch',
      response: { data: { id: 'note-1', is_edited: true } },
      expectedRequest: [
        'conversations/conversation-1/annotations/note-1',
        undefined,
        { text: 'Texto revisado' },
      ],
      expectedJson: { id: 'note-1', is_edited: true },
    },
    {
      label: 'deletes a note',
      operation: new DeleteOperation('annotation'),
      parameters: ids,
      method: 'delete',
      response: { data: { deleted: true } },
      expectedRequest: ['conversations/conversation-1/annotations/note-1'],
      expectedJson: { deleted: true },
    },
  ]);

  it('registers every operation scoped to the resource', (): void => {
    const resource: AnnotationResource = new AnnotationResource();

    for (const name of ['list', 'get', 'create', 'update', 'delete']) {
      expectScopedProperties(resource.getOperation(name), 'annotation');
    }
  });
});
