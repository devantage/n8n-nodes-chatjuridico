import type { IAllExecuteFunctions } from 'n8n-workflow';

import { type ApiResponse, httpClient } from '../../../utils';
import type { ContactProperty } from '../models';

export async function listContactProperties(
  this: IAllExecuteFunctions,
): Promise<ApiResponse<ContactProperty[]>> {
  return httpClient.get<ApiResponse<ContactProperty[]>>(
    this,
    'contact-properties',
  );
}
