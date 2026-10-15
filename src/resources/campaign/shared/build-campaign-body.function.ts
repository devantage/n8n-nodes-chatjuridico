import type { IDataObject } from 'n8n-workflow';

import { compactObject, splitList } from '../../../utils';

/**
 * Converts the campaign collection fields into the request body, turning the
 * recipient lists into arrays and dropping them when empty.
 */
export function buildCampaignBody(fields: IDataObject): IDataObject {
  const tagIds: string[] = splitList(
    fields.recipient_tag_ids as string | string[] | undefined,
  );

  const contactIds: string[] = splitList(
    fields.recipient_contact_ids as string | string[] | undefined,
  );

  return compactObject({
    ...fields,
    recipient_tag_ids: tagIds.length ? tagIds : undefined,
    recipient_contact_ids: contactIds.length ? contactIds : undefined,
  });
}
