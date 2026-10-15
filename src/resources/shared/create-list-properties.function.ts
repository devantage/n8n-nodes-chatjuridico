import type { INodeProperties } from 'n8n-workflow';

/**
 * Builds the standard `Return All` / `Limit` pair used by list operations.
 * Combine with `withOperationDisplayOptions` to scope it to an operation.
 */
export function createListProperties(
  maxLimit: number = 200,
  defaultLimit: number = 50,
): INodeProperties[] {
  return [
    {
      name: 'returnAll',
      displayName: 'Return All',
      description: 'Whether to return all results or only up to a given limit',
      type: 'boolean',
      default: false,
    },
    {
      name: 'limit',
      displayName: 'Limit',
      description: 'Max number of results to return',
      type: 'number',
      typeOptions: {
        minValue: 1,
        maxValue: maxLimit,
      },
      displayOptions: {
        show: {
          returnAll: [false],
        },
      },
      default: Math.min(defaultLimit, maxLimit),
    },
  ];
}
