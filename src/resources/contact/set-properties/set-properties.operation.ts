import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import {
  type IDataObject,
  type IExecuteFunctions,
  type INodeExecutionData,
  type INodeProperties,
  type JsonObject,
  NodeApiError,
  NodeOperationError,
} from 'n8n-workflow';

import {
  type ApiResponse,
  httpClient,
  type HttpResponse,
  parseJson,
  withOperationDisplayOptions,
} from '../../../utils';
import { contactIdProperty } from '../shared';

type PropertyValue = {
  key: string;
  value: unknown;
};

type UpsertResult = IDataObject & {
  unknown_keys?: string[];
  invalid?: Array<{ key: string; error: string }>;
};

export class SetPropertiesOperation extends ResourceOperation {
  public readonly name: string = 'setProperties';

  public readonly displayName: string = 'Set Properties';

  public readonly description: string =
    'Write the custom property values of a contact';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      contactIdProperty,
      {
        name: 'inputMode',
        displayName: 'Input Mode',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Fields',
            value: 'fields',
            description: 'Pick each property and its value',
          },
          {
            name: 'JSON',
            value: 'json',
            description: 'Send a flat object of key/value pairs',
          },
        ],
        default: 'fields',
      },
      {
        name: 'values',
        displayName: 'Properties',
        description:
          'An empty value clears the property. Use an expression to send numbers, booleans or arrays (multi select).',
        type: 'fixedCollection',
        placeholder: 'Add Property',
        typeOptions: {
          multipleValues: true,
        },
        displayOptions: {
          show: {
            inputMode: ['fields'],
          },
        },
        default: {},
        options: [
          {
            name: 'property',
            displayName: 'Property',
            values: [
              {
                name: 'key',
                displayName: 'Property Name or Key',
                description:
                  'Choose from the list, or specify a key using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
                type: 'options',
                typeOptions: {
                  loadOptionsMethod: 'getContactPropertyOptions',
                },
                default: '',
              },
              {
                name: 'value',
                displayName: 'Value',
                type: 'string',
                default: '',
              },
            ],
          },
        ],
      },
      {
        name: 'json',
        displayName: 'Properties (JSON)',
        description:
          'Flat object addressed by the property key, e.g. `{"numero_atendimento": "123", "beneficio": ["aposentadoria"]}`. `null`, `""` or `[]` clears a property.',
        type: 'json',
        displayOptions: {
          show: {
            inputMode: ['json'],
          },
        },
        default: '{}',
      },
      {
        name: 'options',
        displayName: 'Options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            name: 'ignoreInvalid',
            displayName: 'Ignore Invalid Values',
            description:
              'Whether to return the result instead of failing when some keys are unknown or values are invalid. The valid values are saved either way.',
            type: 'boolean',
            default: false,
          },
        ],
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const contactId: string = this.getNodeParameter(
      'contactId',
      itemIndex,
    ) as string;

    const inputMode: string = this.getNodeParameter(
      'inputMode',
      itemIndex,
    ) as string;

    const options: IDataObject = this.getNodeParameter(
      'options',
      itemIndex,
      {},
    );

    let body: IDataObject;

    if (inputMode === 'json') {
      const parsed: unknown = parseJson.call(
        this,
        this.getNodeParameter('json', itemIndex),
        'Properties (JSON)',
        itemIndex,
      );

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new NodeOperationError(
          this.getNode(),
          "'Properties (JSON)' must be an object of key/value pairs",
          { itemIndex },
        );
      }

      body = parsed as IDataObject;
    } else {
      const values: { property?: PropertyValue[] } = this.getNodeParameter(
        'values',
        itemIndex,
        {},
      ) as { property?: PropertyValue[] };

      body = Object.fromEntries(
        (values.property ?? [])
          .filter(({ key }: PropertyValue): boolean => Boolean(key))
          .map(({ key, value }: PropertyValue): [string, unknown] => [
            key,
            value,
          ]),
      ) as IDataObject;
    }

    if (!Object.keys(body).length) {
      throw new NodeOperationError(
        this.getNode(),
        'Please add at least one property',
        { itemIndex },
      );
    }

    // A 422 means the valid values were saved but some were rejected, so the
    // response body is still read instead of failing straight away.
    const response: HttpResponse<
      Partial<ApiResponse<UpsertResult>> | undefined
    > = await httpClient.put<
      HttpResponse<Partial<ApiResponse<UpsertResult>> | undefined>
    >(this, `contacts/${contactId}/properties`, undefined, body, {
      returnFullResponse: true,
      ignoreHttpStatusErrors: true,
    });

    const result: UpsertResult | undefined = response.body?.data;

    if (
      response.statusCode >= 400 &&
      (response.statusCode !== 422 || !result)
    ) {
      throw new NodeApiError(
        this.getNode(),
        (response.body ?? {
          message: `Request failed with status ${String(response.statusCode)}`,
        }) as JsonObject,
        {
          httpCode: String(response.statusCode),
          itemIndex,
        },
      );
    }

    if (response.statusCode === 422 && result && !options.ignoreInvalid) {
      const problems: string[] = [
        ...(result.unknown_keys ?? []).map(
          (key: string): string => `${key}: unknown key`,
        ),
        ...(result.invalid ?? []).map(
          ({ key, error }: { key: string; error: string }): string =>
            `${key}: ${error}`,
        ),
      ];

      throw new NodeOperationError(
        this.getNode(),
        `Some properties were not saved (${problems.join('; ')})`,
        {
          itemIndex,
          description:
            'The valid values were saved. Enable "Ignore Invalid Values" to continue anyway.',
        },
      );
    }

    return {
      json: result ?? {},
      pairedItem: itemIndex,
    };
  }
}
