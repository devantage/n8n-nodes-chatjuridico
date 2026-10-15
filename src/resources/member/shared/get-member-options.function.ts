import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { type ApiResponse, httpClient } from '../../../utils';
import type { Member } from '../models';

export async function getMemberOptions(
  this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
  const response: ApiResponse<Member[]> = await httpClient.get<
    ApiResponse<Member[]>
  >(this, 'members');

  return response.data.map((item: Member): INodePropertyOptions => ({
    name: item.name,
    value: item.id,
  }));
}
