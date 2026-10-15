import { TestUtil } from '@devantage/n8n-custom-nodes-framework';

import { describeOperationCases, expectScopedProperties } from '../../testing';
import { httpClient } from '../../utils';
import { ContactPropertyResource } from './contact-property.resource';
import { CreateOperation } from './create';
import { DeleteOperation } from './delete';
import { ListOperation } from './list';
import {
  getContactPropertyIdOptions,
  getContactPropertyOptions,
} from './shared';
import { UpdateOperation } from './update';

const DEFINITIONS: object = {
  data: [
    {
      id: 'property-1',
      key: 'numero_atendimento',
      name: 'Número de atendimento',
      type: 'text',
    },
  ],
};

describe('contact property operations', (): void => {
  describeOperationCases([
    {
      label: 'lists the contact property definitions',
      operation: new ListOperation('contactProperty'),
      parameters: {},
      method: 'get',
      response: DEFINITIONS,
      expectedRequest: ['contact-properties'],
      expectedJson: DEFINITIONS,
    },
    {
      label: 'creates a select property from comma separated options',
      operation: new CreateOperation('contactProperty'),
      parameters: {
        name: 'Benefício',
        type: 'select',
        additionalFields: {
          key: 'beneficio',
          options: 'Aposentadoria, Auxílio-doença',
          description: '',
          required: true,
        },
      },
      method: 'post',
      response: { data: { id: 'property-1' } },
      expectedRequest: [
        'contact-properties',
        {
          key: 'beneficio',
          options: ['Aposentadoria', 'Auxílio-doença'],
          required: true,
          name: 'Benefício',
          type: 'select',
        },
      ],
      expectedJson: { id: 'property-1' },
    },
    {
      label: 'creates a property without options',
      operation: new CreateOperation('contactProperty'),
      parameters: {
        name: 'Valor',
        type: 'number',
        additionalFields: { prefix: 'R$', options: '  ' },
      },
      method: 'post',
      response: { data: { id: 'property-2' } },
      expectedRequest: [
        'contact-properties',
        { prefix: 'R$', name: 'Valor', type: 'number' },
      ],
      expectedJson: { id: 'property-2' },
    },
    {
      label: 'renames options with a JSON array',
      operation: new UpdateOperation('contactProperty'),
      parameters: {
        propertyId: 'property-1',
        updateFields: {
          options: '[{"value":"aposentadoria","label":"Aposentadoria INSS"}]',
        },
      },
      method: 'patch',
      response: { data: { id: 'property-1' } },
      expectedRequest: [
        'contact-properties/property-1',
        undefined,
        {
          options: [{ value: 'aposentadoria', label: 'Aposentadoria INSS' }],
        },
      ],
      expectedJson: { id: 'property-1' },
    },
    {
      label: 'updates options coming from an expression array',
      operation: new UpdateOperation('contactProperty'),
      parameters: {
        propertyId: 'property-1',
        updateFields: { options: ['A', 'B'], name: 'Benefício' },
      },
      method: 'patch',
      response: { data: { id: 'property-1' } },
      expectedRequest: [
        'contact-properties/property-1',
        undefined,
        { name: 'Benefício', options: ['A', 'B'] },
      ],
      expectedJson: { id: 'property-1' },
    },
    {
      label: 'deletes a property',
      operation: new DeleteOperation('contactProperty'),
      parameters: { propertyId: 'property-1' },
      method: 'delete',
      response: { data: { deleted: true } },
      expectedRequest: ['contact-properties/property-1'],
      expectedJson: { deleted: true },
    },
  ]);

  it('requires at least one field to update', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        propertyId: 'property-1',
        updateFields: {},
      });

    await expect(
      new UpdateOperation('contactProperty').execute.call(context as never, 0),
    ).rejects.toThrow('Please add at least one field to update');
  });

  it('rejects invalid JSON options', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        propertyId: 'property-1',
        updateFields: { options: '[invalid' },
      });

    await expect(
      new UpdateOperation('contactProperty').execute.call(context as never, 0),
    ).rejects.toThrow("'Options' must be a valid JSON");
  });

  it('registers every operation scoped to the resource', (): void => {
    const resource: ContactPropertyResource = new ContactPropertyResource();

    for (const name of ['list', 'create', 'update', 'delete']) {
      expectScopedProperties(resource.getOperation(name), 'contactProperty');
    }
  });

  it('loads the property options addressed by key', async (): Promise<void> => {
    jest.spyOn(httpClient, 'get').mockResolvedValueOnce(DEFINITIONS);

    await expect(getContactPropertyOptions.call({} as never)).resolves.toEqual([
      {
        name: 'Número de atendimento (numero_atendimento)',
        value: 'numero_atendimento',
        description: 'Type: text',
      },
    ]);
  });

  it('loads the property options addressed by id', async (): Promise<void> => {
    jest.spyOn(httpClient, 'get').mockResolvedValueOnce(DEFINITIONS);

    await expect(
      getContactPropertyIdOptions.call({} as never),
    ).resolves.toEqual([
      {
        name: 'Número de atendimento',
        value: 'property-1',
        description: 'Key: numero_atendimento',
      },
    ]);
  });
});
