import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { type ApiResponse, httpClient } from '../../../utils';
import type { Instance } from '../models';

export async function getInstanceOptions(
  this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
  const response: ApiResponse<Instance[]> = await httpClient.get<
    ApiResponse<Instance[]>
  >(this, 'instances');

  return response.data.map((item: Instance): INodePropertyOptions => ({
    name: item.display_phone_number
      ? `${item.name ?? 'WhatsApp'} (${item.display_phone_number})`
      : (item.name ?? item.id),
    value: item.id,
  }));
}
