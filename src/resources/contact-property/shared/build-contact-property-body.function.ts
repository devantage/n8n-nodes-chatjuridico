import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';

import { compactObject, parseJson, splitList } from '../../../utils';

/**
 * Converts the definition fields into the API body. `options` accepts either a
 * comma separated list of labels or a JSON array of labels/option objects.
 */
export function buildContactPropertyBody(
  this: IExecuteFunctions,
  fields: IDataObject,
  itemIndex: number,
): IDataObject {
  const { options, ...otherFields }: IDataObject = fields;

  let parsedOptions: unknown;

  if (Array.isArray(options)) {
    parsedOptions = options;
  } else if (typeof options === 'string' && options.trim().startsWith('[')) {
    parsedOptions = parseJson.call(this, options, 'Options', itemIndex);
  } else if (typeof options === 'string' && options.trim()) {
    parsedOptions = splitList(options);
  }

  return compactObject({
    ...otherFields,
    options: parsedOptions as IDataObject[] | undefined,
  });
}
