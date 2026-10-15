import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';

import { compactObject, splitList } from '../../../utils';

/**
 * Reads the `filters` collection of an analytics operation and converts it
 * into query parameters (tag lists are sent comma separated).
 */
export function getAnalyticsQuery(
  this: IExecuteFunctions,
  itemIndex: number,
  extraParams: IDataObject = {},
): IDataObject {
  const filters: IDataObject = this.getNodeParameter('filters', itemIndex, {});

  const tagIds: string[] = splitList(
    filters.tag_ids as string | string[] | undefined,
  );

  return compactObject({
    ...filters,
    tag_ids: tagIds.length ? tagIds.join(',') : undefined,
    ...extraParams,
  });
}
