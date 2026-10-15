import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { type ApiResponse, httpClient } from '../../../utils';
import type { Funnel } from '../models';

export async function getFunnelOptions(
  this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
  const response: ApiResponse<Funnel[]> = await httpClient.get<
    ApiResponse<Funnel[]>
  >(this, 'funnels');

  return response.data.map((item: Funnel): INodePropertyOptions => ({
    name: item.name,
    value: item.id,
  }));
}
