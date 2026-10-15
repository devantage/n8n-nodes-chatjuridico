import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';

import { compactObject, parseJson } from '../../../utils';

/**
 * Converts the automation collection fields into the request body, parsing
 * the `flow_json` field.
 */
export function buildAutomationBody(
  this: IExecuteFunctions,
  fields: IDataObject,
  itemIndex: number,
): IDataObject {
  return compactObject({
    ...fields,
    flow_json:
      fields.flow_json !== undefined
        ? (parseJson.call(
            this,
            fields.flow_json,
            'Flow',
            itemIndex,
          ) as IDataObject)
        : undefined,
  });
}
