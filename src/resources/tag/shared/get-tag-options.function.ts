import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { type ApiResponse, httpClient } from '../../../utils';
import type { Tag } from '../models';

export async function getTagOptions(
  this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
  const response: ApiResponse<Tag[]> = await httpClient.get<ApiResponse<Tag[]>>(
    this,
    'tags',
  );

  return response.data.map((item: Tag): INodePropertyOptions => ({
    name: item.name,
    value: item.id,
  }));
}
