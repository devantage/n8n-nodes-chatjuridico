import { TestUtil } from '@devantage/n8n-custom-nodes-framework';
import { NodeOperationError } from 'n8n-workflow';

import { describeOperationCases, expectScopedProperties } from '../../testing';
import { CreateOperation } from './create';
import { CreateDraftOperation } from './create-draft';
import { DeleteOperation } from './delete';
import { ExtractSignerDataOperation } from './extract-signer-data';
import { GetOperation } from './get';
import { GetDownloadUrlOperation } from './get-download-url';
import { ListOperation } from './list';
import { SendDraftOperation } from './send-draft';
import { SignatureResource } from './signature.resource';
import { UpdateOperation } from './update';
import { UploadDraftFileOperation } from './upload-draft-file';

const createParameters: Record<string, unknown> = {
  name: 'Contrato',
  contactId: 'contact-1',
  instanceId: 'instance-1',
  fileUrl: 'https://files.example.com/contract.pdf',
  additionalFields: { file_type: 'pdf', file_name: '' },
};

describe('signature operations', (): void => {
  describeOperationCases([
    {
      label: 'lists signature documents',
      operation: new ListOperation('signature'),
      parameters: {
        returnAll: false,
        limit: 50,
        filters: { contact_id: 'contact-1', status: 'signed' },
      },
      method: 'get',
      response: { data: [{ id: 'doc-1' }], pagination: {} },
      expectedRequest: [
        'signatures',
        { contact_id: 'contact-1', status: 'signed', limit: 50 },
      ],
      expectedJson: { data: [{ id: 'doc-1' }], pagination: {} },
    },
    {
      label: 'creates and sends a document with signer fields',
      operation: new CreateOperation('signature'),
      parameters: {
        ...createParameters,
        signersInputMode: 'fields',
        signers: {
          signer: [
            {
              name: 'Maria',
              email: 'maria@example.com',
              cpf: '',
              require_selfie_photo: false,
            },
          ],
        },
        options: { idempotencyKey: 'key-1' },
      },
      method: 'post',
      response: { data: { id: 'doc-1', status: 'pending' } },
      expectedRequest: [
        'signatures',
        {
          file_type: 'pdf',
          name: 'Contrato',
          contact_id: 'contact-1',
          instance_id: 'instance-1',
          file_url: 'https://files.example.com/contract.pdf',
          signers: [
            {
              name: 'Maria',
              email: 'maria@example.com',
              require_selfie_photo: false,
            },
          ],
        },
        undefined,
        { headers: { 'X-Idempotency-Key': 'key-1' } },
      ],
      expectedJson: { id: 'doc-1', status: 'pending' },
    },
    {
      label: 'creates and sends a document with signers JSON',
      operation: new CreateOperation('signature'),
      parameters: {
        ...createParameters,
        additionalFields: {},
        signersInputMode: 'json',
        signersJson: '[{"name":"Maria","security_verifications":["LIVE"]}]',
        options: {},
      },
      method: 'post',
      response: { data: { id: 'doc-1' } },
      expectedRequest: [
        'signatures',
        {
          name: 'Contrato',
          contact_id: 'contact-1',
          instance_id: 'instance-1',
          file_url: 'https://files.example.com/contract.pdf',
          signers: [{ name: 'Maria', security_verifications: ['LIVE'] }],
        },
        undefined,
        undefined,
      ],
      expectedJson: { id: 'doc-1' },
    },
    {
      label: 'gets a signature document',
      operation: new GetOperation('signature'),
      parameters: { documentId: 'doc-1' },
      method: 'get',
      response: { data: { id: 'doc-1' } },
      expectedRequest: ['signatures/doc-1'],
      expectedJson: { id: 'doc-1' },
    },
    {
      label: 'updates a signature document',
      operation: new UpdateOperation('signature'),
      parameters: {
        documentId: 'doc-1',
        updateFields: { folder_path: 'Clientes/Maria' },
      },
      method: 'patch',
      response: { data: { id: 'doc-1' } },
      expectedRequest: [
        'signatures/doc-1',
        undefined,
        { folder_path: 'Clientes/Maria' },
      ],
      expectedJson: { id: 'doc-1' },
    },
    {
      label: 'deletes a signature document',
      operation: new DeleteOperation('signature'),
      parameters: { documentId: 'doc-1' },
      method: 'delete',
      response: { data: { deleted: true } },
      expectedRequest: ['signatures/doc-1'],
      expectedJson: { deleted: true },
    },
    {
      label: 'gets the download URL',
      operation: new GetDownloadUrlOperation('signature'),
      parameters: { documentId: 'doc-1', type: 'signed' },
      method: 'get',
      response: { data: { url: 'https://files.example.com/signed.pdf' } },
      expectedRequest: ['signatures/doc-1/download', { type: 'signed' }],
      expectedJson: { url: 'https://files.example.com/signed.pdf' },
    },
    {
      label: 'creates a draft with signers',
      operation: new CreateDraftOperation('signature'),
      parameters: {
        name: 'Procuração',
        contactId: 'contact-1',
        chatId: 'chat-1',
        additionalFields: {
          draft_id: 'doc-1',
          signers: '[{"name":"Maria"}]',
          file_url: '',
        },
      },
      method: 'post',
      response: { data: { id: 'doc-1', status: 'draft' } },
      expectedRequest: [
        'signatures/drafts',
        {
          draft_id: 'doc-1',
          name: 'Procuração',
          contact_id: 'contact-1',
          chat_id: 'chat-1',
          signers: [{ name: 'Maria' }],
        },
      ],
      expectedJson: { id: 'doc-1', status: 'draft' },
    },
    {
      label: 'creates a draft without signers',
      operation: new CreateDraftOperation('signature'),
      parameters: {
        name: 'Procuração',
        contactId: 'contact-1',
        chatId: 'chat-1',
        additionalFields: { signers: '[]' },
      },
      method: 'post',
      response: { data: { id: 'doc-1' } },
      expectedRequest: [
        'signatures/drafts',
        { name: 'Procuração', contact_id: 'contact-1', chat_id: 'chat-1' },
      ],
      expectedJson: { id: 'doc-1' },
    },
    {
      label: 'uploads the draft file',
      operation: new UploadDraftFileOperation('signature'),
      parameters: {
        draftId: 'doc-1',
        fileUrl: 'https://files.example.com/contract.docx',
        additionalFields: { file_type: 'docx', file_name: 'contract.docx' },
      },
      method: 'post',
      response: { data: { id: 'doc-1' } },
      expectedRequest: [
        'signatures/drafts/doc-1/upload',
        {
          file_type: 'docx',
          file_name: 'contract.docx',
          file_url: 'https://files.example.com/contract.docx',
        },
      ],
      expectedJson: { id: 'doc-1' },
    },
    {
      label: 'sends a draft',
      operation: new SendDraftOperation('signature'),
      parameters: { draftId: 'doc-1' },
      method: 'post',
      response: { data: { id: 'doc-1', status: 'pending' } },
      expectedRequest: ['signatures/drafts/doc-1/send'],
      expectedJson: { id: 'doc-1', status: 'pending' },
    },
    {
      label: 'extracts the signer data',
      operation: new ExtractSignerDataOperation('signature'),
      parameters: { conversationId: 'chat-1', contactId: 'contact-1' },
      method: 'post',
      response: { data: { name: 'Maria', cpf: null } },
      expectedRequest: [
        'signatures/extract-signer-data',
        { conversation_id: 'chat-1', contact_id: 'contact-1' },
      ],
      expectedJson: { name: 'Maria', cpf: null },
    },
  ]);

  it('requires at least one signer', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        ...createParameters,
        signersInputMode: 'fields',
        signers: {},
      });

    await expect(
      new CreateOperation('signature').execute.call(context as never, 0),
    ).rejects.toThrow('Please add at least one signer');
  });

  it.each([['{"name":"Maria"}'], ['["Maria"]'], ['[null]']])(
    'rejects signers JSON that is not an array of objects (%s)',
    async (signersJson: string): Promise<void> => {
      const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
        TestUtil.createExecuteFunctionsMock({
          ...createParameters,
          signersInputMode: 'json',
          signersJson,
        });

      await expect(
        new CreateOperation('signature').execute.call(context as never, 0),
      ).rejects.toThrow('Signers must be an array of objects');
    },
  );

  it('rejects invalid draft signers JSON', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        name: 'Procuração',
        contactId: 'contact-1',
        chatId: 'chat-1',
        additionalFields: { signers: '{invalid' },
      });

    await expect(
      new CreateDraftOperation('signature').execute.call(context as never, 0),
    ).rejects.toThrow(NodeOperationError);
  });

  it('requires at least one field to update', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        documentId: 'doc-1',
        updateFields: {},
      });

    await expect(
      new UpdateOperation('signature').execute.call(context as never, 0),
    ).rejects.toThrow('Please add at least one field to update');
  });

  it('registers every operation scoped to the resource', (): void => {
    const resource: SignatureResource = new SignatureResource();

    for (const name of [
      'list',
      'get',
      'create',
      'update',
      'delete',
      'getDownloadUrl',
      'createDraft',
      'uploadDraftFile',
      'sendDraft',
      'extractSignerData',
    ]) {
      expectScopedProperties(resource.getOperation(name), 'signature');
    }
  });
});
