import { TestUtil } from '@devantage/n8n-custom-nodes-framework';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

import { describeOperationCases } from '../../testing';
import { httpClient } from '../../utils';
import { GetPropertiesOperation } from './get-properties';
import { SetPropertiesOperation } from './set-properties';

type Context = ReturnType<typeof TestUtil.createExecuteFunctionsMock>;

const UPSERT_OPTIONS: object = {
  returnFullResponse: true,
  ignoreHttpStatusErrors: true,
};

function fullResponse(statusCode: number, body: unknown): object {
  return { statusCode, body, headers: {}, statusMessage: '' };
}

describe('contact property value operations', (): void => {
  describeOperationCases([
    {
      label: 'gets the property values of a contact',
      operation: new GetPropertiesOperation('contact'),
      parameters: { contactId: 'contact-1' },
      method: 'get',
      response: { data: [{ key: 'beneficio', value: 'aposentadoria' }] },
      expectedRequest: ['contacts/contact-1/properties'],
      expectedJson: { data: [{ key: 'beneficio', value: 'aposentadoria' }] },
    },
    {
      label: 'sets property values picked as fields',
      operation: new SetPropertiesOperation('contact'),
      parameters: {
        contactId: 'contact-1',
        inputMode: 'fields',
        values: {
          property: [
            { key: 'numero_atendimento', value: '123' },
            { key: 'observacao', value: '' },
            { key: '', value: 'ignored' },
          ],
        },
        options: {},
      },
      method: 'put',
      response: fullResponse(200, {
        data: { updated: ['numero_atendimento'] },
      }),
      expectedRequest: [
        'contacts/contact-1/properties',
        undefined,
        { numero_atendimento: '123', observacao: '' },
        UPSERT_OPTIONS,
      ],
      expectedJson: { updated: ['numero_atendimento'] },
    },
    {
      label: 'sets property values from JSON',
      operation: new SetPropertiesOperation('contact'),
      parameters: {
        contactId: 'contact-1',
        inputMode: 'json',
        json: '{"beneficio":["aposentadoria"],"valor":10}',
        options: {},
      },
      method: 'put',
      response: fullResponse(200, {
        data: { updated: ['beneficio', 'valor'] },
      }),
      expectedRequest: [
        'contacts/contact-1/properties',
        undefined,
        { beneficio: ['aposentadoria'], valor: 10 },
        UPSERT_OPTIONS,
      ],
      expectedJson: { updated: ['beneficio', 'valor'] },
    },
    {
      label: 'returns partial results when invalid values are ignored',
      operation: new SetPropertiesOperation('contact'),
      parameters: {
        contactId: 'contact-1',
        inputMode: 'json',
        json: { valor: 'abc', foo: 1 },
        options: { ignoreInvalid: true },
      },
      method: 'put',
      response: fullResponse(422, {
        data: {
          updated: [],
          unknown_keys: ['foo'],
          invalid: [{ key: 'valor', error: 'must be a number' }],
        },
      }),
      expectedRequest: [
        'contacts/contact-1/properties',
        undefined,
        { valor: 'abc', foo: 1 },
        UPSERT_OPTIONS,
      ],
      expectedJson: {
        updated: [],
        unknown_keys: ['foo'],
        invalid: [{ key: 'valor', error: 'must be a number' }],
      },
    },
  ]);

  async function runSet(
    parameters: Record<string, unknown>,
    response?: object,
  ): Promise<unknown> {
    if (response) {
      jest.spyOn(httpClient, 'put').mockResolvedValueOnce(response);
    }

    const context: Context = TestUtil.createExecuteFunctionsMock({
      contactId: 'contact-1',
      options: {},
      ...parameters,
    });

    return new SetPropertiesOperation('contact').execute.call(
      context as never,
      0,
    );
  }

  it('fails listing the rejected values on a partial write', async (): Promise<void> => {
    await expect(
      runSet(
        { inputMode: 'json', json: { valor: 'abc', foo: 1 } },
        fullResponse(422, {
          data: {
            updated: [],
            unknown_keys: ['foo'],
            invalid: [{ key: 'valor', error: 'must be a number' }],
          },
        }),
      ),
    ).rejects.toThrow(
      'Some properties were not saved (foo: unknown key; valor: must be a number)',
    );
  });

  it('fails on a partial write without details', async (): Promise<void> => {
    await expect(
      runSet(
        { inputMode: 'json', json: { valor: 'abc' } },
        fullResponse(422, { data: {} }),
      ),
    ).rejects.toThrow('Some properties were not saved ()');
  });

  it('throws an API error for other failures', async (): Promise<void> => {
    await expect(
      runSet(
        { inputMode: 'json', json: { valor: 1 } },
        fullResponse(404, { error: { code: 'not_found' } }),
      ),
    ).rejects.toThrow(NodeApiError);
  });

  it('throws an API error for a 422 without a result', async (): Promise<void> => {
    await expect(
      runSet(
        { inputMode: 'json', json: { valor: 1 } },
        fullResponse(422, undefined),
      ),
    ).rejects.toThrow(NodeApiError);
  });

  it('returns an empty object when the body has no result', async (): Promise<void> => {
    await expect(
      runSet(
        { inputMode: 'json', json: { valor: 1 } },
        fullResponse(204, undefined),
      ),
    ).resolves.toEqual({ json: {}, pairedItem: 0 });
  });

  it.each([
    ['an array', '[1]'],
    ['null', 'null'],
  ])(
    'rejects JSON that is %s',
    async (_label: string, json: string): Promise<void> => {
      await expect(runSet({ inputMode: 'json', json })).rejects.toThrow(
        "'Properties (JSON)' must be an object of key/value pairs",
      );
    },
  );

  it('requires at least one property', async (): Promise<void> => {
    await expect(runSet({ inputMode: 'fields', values: {} })).rejects.toThrow(
      NodeOperationError,
    );
    await expect(runSet({ inputMode: 'json', json: '{}' })).rejects.toThrow(
      'Please add at least one property',
    );
  });
});
