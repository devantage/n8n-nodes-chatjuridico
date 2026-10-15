import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import type { ApiResponse } from '../../../utils';
import type { ContactProperty } from '../models';
import { listContactProperties } from './list-contact-properties.function';

/**
 * Options addressed by the property `key`, used to write contact values.
 */
export async function getContactPropertyOptions(
  this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
  const response: ApiResponse<ContactProperty[]> =
    await listContactProperties.call(this);

  return response.data.map(
    (property: ContactProperty): INodePropertyOptions => ({
      name: `${property.name} (${property.key})`,
      value: property.key,
      description: `Type: ${property.type}`,
    }),
  );
}

/**
 * Options addressed by the property `id`, used to edit or delete definitions.
 */
export async function getContactPropertyIdOptions(
  this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
  const response: ApiResponse<ContactProperty[]> =
    await listContactProperties.call(this);

  return response.data.map(
    (property: ContactProperty): INodePropertyOptions => ({
      name: property.name,
      value: property.id,
      description: `Key: ${property.key}`,
    }),
  );
}
