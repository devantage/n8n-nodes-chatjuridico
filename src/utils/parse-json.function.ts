import { type IExecuteFunctions, NodeOperationError } from 'n8n-workflow';

/**
 * Parses a `json` node parameter. n8n may hand the value over either as the
 * raw string typed by the user or as an already parsed object (expressions).
 */
export function parseJson(
  this: IExecuteFunctions,
  value: unknown,
  fieldName: string,
  itemIndex: number,
): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    throw new NodeOperationError(
      this.getNode(),
      `'${fieldName}' must be a valid JSON`,
      { itemIndex },
    );
  }
}
