import { TestUtil } from '@devantage/n8n-custom-nodes-framework';

import { describeOperationCases, expectScopedProperties } from '../../testing';
import { httpClient } from '../../utils';
import { CreateOperation } from './create';
import { DeleteOperation } from './delete';
import { GetOperation } from './get';
import { ListOperation } from './list';
import { getTagOptions } from './shared';
import { TagResource } from './tag.resource';
import { UpdateOperation } from './update';

describe('tag operations', (): void => {
  describeOperationCases([
    {
      label: 'lists tags',
      operation: new ListOperation('tag'),
      parameters: {},
      method: 'get',
      response: { data: [{ id: 'tag-1' }] },
      expectedRequest: ['tags'],
      expectedJson: { data: [{ id: 'tag-1' }] },
    },
    {
      label: 'gets a tag',
      operation: new GetOperation('tag'),
      parameters: { tagId: 'tag-1' },
      method: 'get',
      response: { data: { id: 'tag-1' } },
      expectedRequest: ['tags/tag-1'],
      expectedJson: { id: 'tag-1' },
    },
    {
      label: 'creates a tag',
      operation: new CreateOperation('tag'),
      parameters: { name: 'Urgente', additionalFields: { color_id: 3 } },
      method: 'post',
      response: { data: { id: 'tag-1' } },
      expectedRequest: ['tags', { name: 'Urgente', color_id: 3 }],
      expectedJson: { id: 'tag-1' },
    },
    {
      label: 'updates a tag',
      operation: new UpdateOperation('tag'),
      parameters: { tagId: 'tag-1', updateFields: { name: 'VIP' } },
      method: 'patch',
      response: { data: { id: 'tag-1' } },
      expectedRequest: ['tags/tag-1', undefined, { name: 'VIP' }],
      expectedJson: { id: 'tag-1' },
    },
    {
      label: 'deletes a tag',
      operation: new DeleteOperation('tag'),
      parameters: { tagId: 'tag-1' },
      method: 'delete',
      response: { data: { deleted: true } },
      expectedRequest: ['tags/tag-1'],
      expectedJson: { deleted: true },
    },
  ]);

  it('requires at least one field to update', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({ tagId: 'tag-1', updateFields: {} });

    await expect(
      new UpdateOperation('tag').execute.call(context as never, 0),
    ).rejects.toThrow('Please add at least one field to update');
  });

  it('registers every operation scoped to the resource', (): void => {
    const resource: TagResource = new TagResource();

    for (const name of ['list', 'get', 'create', 'update', 'delete']) {
      expectScopedProperties(resource.getOperation(name), 'tag');
    }
  });

  it('loads the tag options', async (): Promise<void> => {
    jest
      .spyOn(httpClient, 'get')
      .mockResolvedValueOnce({ data: [{ id: 'tag-1', name: 'VIP' }] });

    await expect(getTagOptions.call({} as never)).resolves.toEqual([
      { name: 'VIP', value: 'tag-1' },
    ]);
  });
});
