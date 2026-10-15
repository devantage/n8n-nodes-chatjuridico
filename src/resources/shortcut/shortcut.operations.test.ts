import { TestUtil } from '@devantage/n8n-custom-nodes-framework';

import { describeOperationCases, expectScopedProperties } from '../../testing';
import { CreateOperation } from './create';
import { DeleteOperation } from './delete';
import { GetOperation } from './get';
import { ListOperation } from './list';
import { ShortcutResource } from './shortcut.resource';
import { UpdateOperation } from './update';

describe('shortcut operations', (): void => {
  describeOperationCases([
    {
      label: 'lists shortcuts',
      operation: new ListOperation('shortcut'),
      parameters: {},
      method: 'get',
      response: { data: [{ id: 'shortcut-1' }] },
      expectedRequest: ['shortcuts'],
      expectedJson: { data: [{ id: 'shortcut-1' }] },
    },
    {
      label: 'gets a shortcut',
      operation: new GetOperation('shortcut'),
      parameters: { shortcutId: 'shortcut-1' },
      method: 'get',
      response: { data: { id: 'shortcut-1' } },
      expectedRequest: ['shortcuts/shortcut-1'],
      expectedJson: { id: 'shortcut-1' },
    },
    {
      label: 'creates a shortcut',
      operation: new CreateOperation('shortcut'),
      parameters: { trigger: '/ola', message: 'Olá, tudo bem?' },
      method: 'post',
      response: { data: { id: 'shortcut-1' } },
      expectedRequest: [
        'shortcuts',
        { trigger: '/ola', message: 'Olá, tudo bem?' },
      ],
      expectedJson: { id: 'shortcut-1' },
    },
    {
      label: 'updates a shortcut',
      operation: new UpdateOperation('shortcut'),
      parameters: {
        shortcutId: 'shortcut-1',
        updateFields: { message: 'Bom dia!', trigger: '' },
      },
      method: 'patch',
      response: { data: { id: 'shortcut-1' } },
      expectedRequest: [
        'shortcuts/shortcut-1',
        undefined,
        { message: 'Bom dia!' },
      ],
      expectedJson: { id: 'shortcut-1' },
    },
    {
      label: 'deletes a shortcut',
      operation: new DeleteOperation('shortcut'),
      parameters: { shortcutId: 'shortcut-1' },
      method: 'delete',
      response: { data: { deleted: true } },
      expectedRequest: ['shortcuts/shortcut-1'],
      expectedJson: { deleted: true },
    },
  ]);

  it('requires at least one field to update', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        shortcutId: 'shortcut-1',
        updateFields: {},
      });

    await expect(
      new UpdateOperation('shortcut').execute.call(context as never, 0),
    ).rejects.toThrow('Please add at least one field to update');
  });

  it('registers every operation scoped to the resource', (): void => {
    const resource: ShortcutResource = new ShortcutResource();

    for (const name of ['list', 'get', 'create', 'update', 'delete']) {
      expectScopedProperties(resource.getOperation(name), 'shortcut');
    }
  });
});
