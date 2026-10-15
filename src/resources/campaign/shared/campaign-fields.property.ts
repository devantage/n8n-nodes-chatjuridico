import type { INodeProperties } from 'n8n-workflow';

/**
 * Optional template and audience fields shared by the create and update
 * operations. Use `buildCampaignBody` to convert them into the request body.
 */
export const campaignFields: INodeProperties[] = [
  {
    name: 'template_name',
    displayName: 'Template Name',
    description: 'Name of the approved WhatsApp template',
    type: 'string',
    default: '',
  },
  {
    name: 'template_language',
    displayName: 'Template Language',
    description: 'Template language code',
    type: 'string',
    default: 'pt_BR',
  },
  {
    name: 'recipient_tag_ids',
    displayName: 'Recipient Tag Names or IDs',
    description:
      'The audience is every contact with any of these tags. Do not use together with Recipient Contact IDs. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
    type: 'multiOptions',
    typeOptions: {
      loadOptionsMethod: 'getTagOptions',
    },
    default: [],
  },
  {
    name: 'recipient_contact_ids',
    displayName: 'Recipient Contact IDs',
    description:
      'Comma separated list of contact IDs of the campaign WhatsApp number. Do not use together with Recipient Tags.',
    type: 'string',
    default: '',
  },
];
