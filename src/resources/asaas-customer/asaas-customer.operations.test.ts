import { TestUtil } from '@devantage/n8n-custom-nodes-framework';

import { describeOperationCases, expectScopedProperties } from '../../testing';
import { AsaasCustomerResource } from './asaas-customer.resource';
import { CreateOperation } from './create';
import { ListOperation } from './list';
import { SyncOperation } from './sync';

describe('asaas customer operations', (): void => {
  describeOperationCases([
    {
      label: 'lists Asaas customers with filters',
      operation: new ListOperation('asaasCustomer'),
      parameters: {
        returnAll: false,
        limit: 30,
        filters: { search: 'Maria', has_asaas_link: false },
      },
      method: 'get',
      response: { data: [{ contact_id: 'contact-1' }], pagination: {} },
      expectedRequest: [
        'payments/customers',
        { search: 'Maria', has_asaas_link: false, limit: 30 },
      ],
      expectedJson: { data: [{ contact_id: 'contact-1' }], pagination: {} },
    },
    {
      label: 'lists Asaas customers without filters',
      operation: new ListOperation('asaasCustomer'),
      parameters: { returnAll: false, limit: 50, filters: { search: '' } },
      method: 'get',
      response: { data: [] },
      expectedRequest: ['payments/customers', { limit: 50 }],
      expectedJson: { data: [] },
    },
    {
      label: 'syncs an Asaas customer',
      operation: new SyncOperation('asaasCustomer'),
      parameters: { contactId: 'contact-1' },
      method: 'post',
      response: { data: { message: 'synced' } },
      expectedRequest: ['payments/customers/sync', { contact_id: 'contact-1' }],
      expectedJson: { message: 'synced' },
    },
    {
      label: 'creates an Asaas customer stripping the CPF/CNPJ punctuation',
      operation: new CreateOperation('asaasCustomer'),
      parameters: { contactId: 'contact-1', cpfCnpj: '123.456.789-00' },
      method: 'post',
      response: { data: { message: 'created' } },
      expectedRequest: [
        'payments/customers/create',
        { contact_id: 'contact-1', cpf_cnpj: '12345678900' },
      ],
      expectedJson: { message: 'created' },
    },
    {
      label: 'keeps the letters of alphanumeric CNPJs',
      operation: new CreateOperation('asaasCustomer'),
      parameters: { contactId: 'contact-1', cpfCnpj: '12.abc.345/01de-56' },
      method: 'post',
      response: { data: { message: 'created' } },
      expectedRequest: [
        'payments/customers/create',
        { contact_id: 'contact-1', cpf_cnpj: '12ABC34501DE56' },
      ],
      expectedJson: { message: 'created' },
    },
  ]);

  it('rejects a CPF/CNPJ without digits or letters', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        contactId: 'contact-1',
        cpfCnpj: '..-/',
      });

    await expect(
      new CreateOperation('asaasCustomer').execute.call(context as never, 0),
    ).rejects.toThrow("'CPF/CNPJ' must contain digits or letters");
  });

  it('registers every operation scoped to the resource', (): void => {
    const resource: AsaasCustomerResource = new AsaasCustomerResource();

    for (const name of ['list', 'sync', 'create']) {
      expectScopedProperties(resource.getOperation(name), 'asaasCustomer');
    }
  });
});
