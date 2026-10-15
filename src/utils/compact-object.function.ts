import type { IDataObject } from 'n8n-workflow';

/**
 * Removes the keys whose value is `undefined` or an empty string, so optional
 * parameters left blank are not sent to the API. `null`, `false` and `0` are
 * kept because they are meaningful values for the API.
 */
export function compactObject(object: IDataObject): IDataObject {
  return Object.fromEntries(
    Object.entries(object).filter(
      ([, value]: [string, unknown]): boolean =>
        value !== undefined && value !== '',
    ),
  );
}
