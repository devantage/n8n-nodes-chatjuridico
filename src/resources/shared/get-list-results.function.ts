import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';

import { type ApiListResponse, compactObject, httpClient } from '../../utils';

/**
 * Fetches a cursor paginated list. When `Return All` is enabled every page is
 * requested and the items are merged into a single `data` array; otherwise a
 * single page is returned as-is, including its `pagination` metadata.
 */
export async function getListResults(
  this: IExecuteFunctions,
  itemIndex: number,
  resource: string,
  queryParams: IDataObject = {},
  maxLimit: number = 200,
): Promise<IDataObject> {
  const returnAll: boolean = this.getNodeParameter(
    'returnAll',
    itemIndex,
    false,
  );

  if (!returnAll) {
    const limit: number = this.getNodeParameter('limit', itemIndex, 50);

    return httpClient.get<IDataObject>(
      this,
      resource,
      compactObject({ ...queryParams, limit }),
    );
  }

  const data: IDataObject[] = [];

  let cursor: string | undefined;

  do {
    const response: ApiListResponse = await httpClient.get<ApiListResponse>(
      this,
      resource,
      compactObject({ ...queryParams, limit: maxLimit, cursor }),
    );

    data.push(...response.data);

    cursor = response.pagination?.has_more
      ? (response.pagination.next_cursor ?? undefined)
      : undefined;
  } while (cursor);

  return { data };
}
