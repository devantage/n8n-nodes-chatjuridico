import { TestUtil } from '@devantage/n8n-custom-nodes-framework';
import { NodeOperationError } from 'n8n-workflow';

import { describeOperationCases, expectScopedProperties } from '../../testing';
import { CreateOperation } from './create';
import { DeleteOperation } from './delete';
import { GetOperation } from './get';
import { ListOperation } from './list';
import { TemplateResource } from './template.resource';
import { UpdateOperation } from './update';

describe('template operations', (): void => {
  describeOperationCases([
    {
      label: 'lists templates with filters',
      operation: new ListOperation('template'),
      parameters: {
        filters: { instance_id: 'instance-1', status: 'DRAFT', search: '' },
      },
      method: 'get',
      response: { data: [{ id: 'template-1' }] },
      expectedRequest: [
        'templates',
        { instance_id: 'instance-1', status: 'DRAFT' },
      ],
      expectedJson: { data: [{ id: 'template-1' }] },
    },
    {
      label: 'gets a template',
      operation: new GetOperation('template'),
      parameters: { templateId: 'template-1' },
      method: 'get',
      response: { data: { id: 'template-1' } },
      expectedRequest: ['templates/template-1'],
      expectedJson: { id: 'template-1' },
    },
    {
      label: 'creates a template',
      operation: new CreateOperation('template'),
      parameters: {
        name: 'boas_vindas',
        language: 'pt_BR',
        category: 'UTILITY',
        components: '[{"type":"BODY","text":"Olá"}]',
        instanceId: 'instance-1',
      },
      method: 'post',
      response: { data: { id: 'template-1' } },
      expectedRequest: [
        'templates',
        {
          name: 'boas_vindas',
          language: 'pt_BR',
          category: 'UTILITY',
          components: [{ type: 'BODY', text: 'Olá' }],
          instance_id: 'instance-1',
        },
      ],
      expectedJson: { id: 'template-1' },
    },
    {
      label: 'updates a template',
      operation: new UpdateOperation('template'),
      parameters: {
        templateId: 'template-1',
        updateFields: {
          category: 'MARKETING',
          components: [{ type: 'BODY', text: 'Oi' }],
          language: '',
        },
      },
      method: 'patch',
      response: { data: { id: 'template-1' } },
      expectedRequest: [
        'templates/template-1',
        undefined,
        { category: 'MARKETING', components: [{ type: 'BODY', text: 'Oi' }] },
      ],
      expectedJson: { id: 'template-1' },
    },
    {
      label: 'deletes a template',
      operation: new DeleteOperation('template'),
      parameters: { templateId: 'template-1' },
      method: 'delete',
      response: { data: { deleted: true } },
      expectedRequest: ['templates/template-1'],
      expectedJson: { deleted: true },
    },
  ]);

  it('requires at least one field to update', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        templateId: 'template-1',
        updateFields: {},
      });

    await expect(
      new UpdateOperation('template').execute.call(context as never, 0),
    ).rejects.toThrow('Please add at least one field to update');
  });

  it('rejects invalid components JSON', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        name: 'boas_vindas',
        language: 'pt_BR',
        category: 'UTILITY',
        components: '[{invalid',
        instanceId: 'instance-1',
      });

    await expect(
      new CreateOperation('template').execute.call(context as never, 0),
    ).rejects.toThrow(NodeOperationError);
  });

  it('registers every operation scoped to the resource', (): void => {
    const resource: TemplateResource = new TemplateResource();

    for (const name of ['list', 'get', 'create', 'update', 'delete']) {
      expectScopedProperties(resource.getOperation(name), 'template');
    }
  });
});
