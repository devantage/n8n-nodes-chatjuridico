import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { type ApiResponse, httpClient } from '../../../utils';
import type { FunnelStage } from '../models';

export async function getFunnelStageOptions(
  this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
  const response: ApiResponse<FunnelStage[]> = await httpClient.get<
    ApiResponse<FunnelStage[]>
  >(this, 'funnel-stages');

  return response.data.map((item: FunnelStage): INodePropertyOptions => ({
    name: item.name,
    value: item.id,
  }));
}
