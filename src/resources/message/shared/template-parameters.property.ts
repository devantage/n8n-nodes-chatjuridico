import type { IDataObject, INodeProperties } from 'n8n-workflow';

/**
 * Key/value pairs that fill the variables of a WhatsApp template.
 */
export const templateParametersProperty: INodeProperties = {
  name: 'templateParameters',
  displayName: 'Template Parameters',
  description:
    'Real values of the template variables: body_1, body_2... for {{1}}, {{2}} in the body, header_1 for text headers, header_image_url for media headers and button_1... for dynamic buttons',
  type: 'fixedCollection',
  typeOptions: {
    multipleValues: true,
  },
  placeholder: 'Add Parameter',
  default: {},
  options: [
    {
      name: 'parameter',
      displayName: 'Parameter',
      values: [
        {
          name: 'key',
          displayName: 'Key',
          type: 'string',
          placeholder: 'body_1',
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
};

function toText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  return value === undefined || value === null ? '' : JSON.stringify(value);
}

/**
 * Converts the template parameters fixed collection into the key/value object
 * expected by the API. Returns `undefined` when no parameter was added.
 */
export function getTemplateParameters(
  value: IDataObject | undefined,
): IDataObject | undefined {
  const parameters: IDataObject[] =
    (value?.parameter as IDataObject[] | undefined) ?? [];

  const entries: [string, string][] = parameters
    .filter(({ key }: IDataObject): boolean => typeof key === 'string' && !!key)
    .map(({ key, value: curValue }: IDataObject): [string, string] => [
      (key as string).trim(),
      toText(curValue),
    ]);

  return entries.length ? Object.fromEntries(entries) : undefined;
}
