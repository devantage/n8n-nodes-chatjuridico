import { TestUtil } from '@devantage/n8n-custom-nodes-framework';
import { NodeOperationError } from 'n8n-workflow';

import { describeOperationCases } from '../../testing';
import { BulkCreateOperation } from './bulk-create';
import { CreateOperation } from './create';
import { DeleteOperation } from './delete';
import { FindDuplicatesOperation } from './find-duplicates';
import { GetOperation } from './get';
import { ListOperation } from './list';
import { MergeOperation } from './merge';
import { UpdateOperation } from './update';
import { UpdateProfilePictureOperation } from './update-profile-picture';

describe('contact operations', (): void => {
  describeOperationCases([
    {
      label: 'lists contacts with filters',
      operation: new ListOperation('contact'),
      parameters: {
        returnAll: false,
        limit: 25,
        filters: {
          search: 'João',
          tag_ids: ['tag-1', 'tag-2'],
          is_active: false,
        },
      },
      method: 'get',
      response: { data: [{ id: 'contact-1' }], pagination: {} },
      expectedRequest: [
        'contacts',
        { search: 'João', tag_ids: 'tag-1,tag-2', is_active: false, limit: 25 },
      ],
      expectedJson: { data: [{ id: 'contact-1' }], pagination: {} },
    },
    {
      label: 'lists contacts without filters',
      operation: new ListOperation('contact'),
      parameters: { returnAll: false, limit: 50, filters: { tag_ids: [] } },
      method: 'get',
      response: { data: [] },
      expectedRequest: ['contacts', { limit: 50 }],
      expectedJson: { data: [] },
    },
    {
      label: 'gets a contact',
      operation: new GetOperation('contact'),
      parameters: { contactId: 'contact-1' },
      method: 'get',
      response: { data: { id: 'contact-1' } },
      expectedRequest: ['contacts/contact-1'],
      expectedJson: { id: 'contact-1' },
    },
    {
      label: 'creates a contact',
      operation: new CreateOperation('contact'),
      parameters: {
        name: 'Carlos',
        phone: '5531977776666',
        additionalFields: { tags: 'lead, vip', source: 'api', stage_id: '' },
      },
      method: 'post',
      response: { data: { id: 'contact-1' } },
      expectedRequest: [
        'contacts',
        {
          name: 'Carlos',
          phone: '5531977776666',
          tags: ['lead', 'vip'],
          source: 'api',
        },
      ],
      expectedJson: { id: 'contact-1' },
    },
    {
      label: 'bulk creates contacts',
      operation: new BulkCreateOperation('contact'),
      parameters: {
        contacts: '[{"name":"A","phone":"1"}]',
      },
      method: 'post',
      response: { data: { created: 1, failed: 0, results: [] } },
      expectedRequest: [
        'contacts/bulk',
        { contacts: [{ name: 'A', phone: '1' }] },
      ],
      expectedJson: { created: 1, failed: 0, results: [] },
    },
    {
      label: 'updates a contact',
      operation: new UpdateOperation('contact'),
      parameters: {
        contactId: 'contact-1',
        updateFields: { is_starred: true, tags: 'vip' },
      },
      method: 'patch',
      response: { data: { id: 'contact-1' } },
      expectedRequest: [
        'contacts/contact-1',
        undefined,
        { is_starred: true, tags: ['vip'] },
      ],
      expectedJson: { id: 'contact-1' },
    },
    {
      label: 'deletes a contact',
      operation: new DeleteOperation('contact'),
      parameters: { contactId: 'contact-1' },
      method: 'delete',
      response: { data: { deleted: true } },
      expectedRequest: ['contacts/contact-1'],
      expectedJson: { deleted: true },
    },
    {
      label: 'merges contacts',
      operation: new MergeOperation('contact'),
      parameters: { keeperId: 'keeper', loserId: 'loser' },
      method: 'post',
      response: { data: { success: true } },
      expectedRequest: [
        'contacts/merge',
        { keeper_id: 'keeper', loser_id: 'loser' },
      ],
      expectedJson: { success: true },
    },
    {
      label: 'finds duplicate contacts',
      operation: new FindDuplicatesOperation('contact'),
      parameters: { limit: 10 },
      method: 'get',
      response: { data: { duplicates: [], total_found: 0 } },
      expectedRequest: ['contacts/duplicates', { limit: 10 }],
      expectedJson: { duplicates: [], total_found: 0 },
    },
    {
      label: 'updates the profile picture',
      operation: new UpdateProfilePictureOperation('contact'),
      parameters: { contactId: 'contact-1' },
      method: 'post',
      response: { data: { id: 'contact-1' } },
      expectedRequest: ['contacts/contact-1/profile-picture'],
      expectedJson: { id: 'contact-1' },
    },
  ]);

  it('rejects bulk payloads that are not arrays', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({ contacts: '{"name":"A"}' });

    await expect(
      new BulkCreateOperation('contact').execute.call(context as never, 0),
    ).rejects.toThrow(NodeOperationError);
  });

  it('requires at least one field to update', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        contactId: 'contact-1',
        updateFields: {},
      });

    await expect(
      new UpdateOperation('contact').execute.call(context as never, 0),
    ).rejects.toThrow('Please add at least one field to update');
  });
});
