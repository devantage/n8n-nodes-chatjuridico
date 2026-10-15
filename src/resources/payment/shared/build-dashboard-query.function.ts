import type { IDataObject } from 'n8n-workflow';

import { compactObject } from '../../../utils';

function joinList(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    return value.length ? value.join(',') : undefined;
  }

  return value as string | undefined;
}

/**
 * Builds the dashboard query string, joining the multi-option filters into
 * the comma separated lists expected by the API.
 */
export function buildDashboardQuery(filters: IDataObject): IDataObject {
  return compactObject({
    ...filters,
    statuses: joinList(filters.statuses),
    billing_types: joinList(filters.billing_types),
  });
}
