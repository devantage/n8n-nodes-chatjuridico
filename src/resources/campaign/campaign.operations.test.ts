import { TestUtil } from '@devantage/n8n-custom-nodes-framework';

import { describeOperationCases, expectScopedProperties } from '../../testing';
import { CampaignResource } from './campaign.resource';
import { CancelOperation } from './cancel';
import { CreateOperation } from './create';
import { DeleteOperation } from './delete';
import { GetOperation } from './get';
import { GetAnalyticsOperation } from './get-analytics';
import { ListOperation } from './list';
import { ListRecipientsOperation } from './list-recipients';
import { SendOperation } from './send';
import { buildCampaignBody } from './shared';
import { UpdateOperation } from './update';

describe('campaign operations', (): void => {
  describeOperationCases([
    {
      label: 'lists campaigns with filters',
      operation: new ListOperation('campaign'),
      parameters: {
        returnAll: false,
        limit: 25,
        filters: { status: 'running', search: 'Black Friday' },
      },
      method: 'get',
      response: { data: [{ id: 'campaign-1' }], pagination: {} },
      expectedRequest: [
        'campaigns',
        { status: 'running', search: 'Black Friday', limit: 25 },
      ],
      expectedJson: { data: [{ id: 'campaign-1' }], pagination: {} },
    },
    {
      label: 'gets a campaign',
      operation: new GetOperation('campaign'),
      parameters: { campaignId: 'campaign-1' },
      method: 'get',
      response: { data: { id: 'campaign-1' } },
      expectedRequest: ['campaigns/campaign-1'],
      expectedJson: { id: 'campaign-1' },
    },
    {
      label: 'creates a campaign with tag recipients',
      operation: new CreateOperation('campaign'),
      parameters: {
        name: 'Black Friday',
        instanceId: 'instance-1',
        additionalFields: {
          template_name: 'promo',
          template_language: 'pt_BR',
          recipient_tag_ids: ['tag-1', 'tag-2'],
          recipient_contact_ids: '',
        },
      },
      method: 'post',
      response: { data: { id: 'campaign-1' } },
      expectedRequest: [
        'campaigns',
        {
          name: 'Black Friday',
          instance_id: 'instance-1',
          template_name: 'promo',
          template_language: 'pt_BR',
          recipient_tag_ids: ['tag-1', 'tag-2'],
        },
      ],
      expectedJson: { id: 'campaign-1' },
    },
    {
      label: 'creates a campaign with contact recipients',
      operation: new CreateOperation('campaign'),
      parameters: {
        name: 'Follow-up',
        instanceId: 'instance-1',
        additionalFields: {
          recipient_tag_ids: [],
          recipient_contact_ids: 'contact-1, contact-2',
        },
      },
      method: 'post',
      response: { data: { id: 'campaign-2' } },
      expectedRequest: [
        'campaigns',
        {
          name: 'Follow-up',
          instance_id: 'instance-1',
          recipient_contact_ids: ['contact-1', 'contact-2'],
        },
      ],
      expectedJson: { id: 'campaign-2' },
    },
    {
      label: 'updates a campaign',
      operation: new UpdateOperation('campaign'),
      parameters: {
        campaignId: 'campaign-1',
        updateFields: {
          name: 'Black Friday 2026',
          scheduled_at: '2026-10-20T10:00:00-03:00',
        },
      },
      method: 'patch',
      response: { data: { id: 'campaign-1' } },
      expectedRequest: [
        'campaigns/campaign-1',
        undefined,
        {
          name: 'Black Friday 2026',
          scheduled_at: '2026-10-20T10:00:00-03:00',
        },
      ],
      expectedJson: { id: 'campaign-1' },
    },
    {
      label: 'deletes a campaign',
      operation: new DeleteOperation('campaign'),
      parameters: { campaignId: 'campaign-1' },
      method: 'delete',
      response: { data: { deleted: true } },
      expectedRequest: ['campaigns/campaign-1'],
      expectedJson: { deleted: true },
    },
    {
      label: 'lists the campaign recipients',
      operation: new ListRecipientsOperation('campaign'),
      parameters: { campaignId: 'campaign-1', returnAll: false, limit: 10 },
      method: 'get',
      response: { data: [{ id: 'recipient-1' }], pagination: {} },
      expectedRequest: ['campaigns/campaign-1/recipients', { limit: 10 }],
      expectedJson: { data: [{ id: 'recipient-1' }], pagination: {} },
    },
    {
      label: 'gets the campaign analytics',
      operation: new GetAnalyticsOperation('campaign'),
      parameters: { campaignId: 'campaign-1' },
      method: 'get',
      response: { data: { delivery_rate: 98.5 } },
      expectedRequest: ['campaigns/campaign-1/analytics'],
      expectedJson: { delivery_rate: 98.5 },
    },
    {
      label: 'sends a campaign with an idempotency key',
      operation: new SendOperation('campaign'),
      parameters: {
        campaignId: 'campaign-1',
        options: { idempotencyKey: 'key-1' },
      },
      method: 'post',
      response: { data: { id: 'campaign-1', status: 'running' } },
      expectedRequest: [
        'campaigns/campaign-1/send',
        undefined,
        undefined,
        { headers: { 'X-Idempotency-Key': 'key-1' } },
      ],
      expectedJson: { id: 'campaign-1', status: 'running' },
    },
    {
      label: 'sends a campaign without options',
      operation: new SendOperation('campaign'),
      parameters: { campaignId: 'campaign-1', options: {} },
      method: 'post',
      response: { success: true },
      expectedRequest: [
        'campaigns/campaign-1/send',
        undefined,
        undefined,
        undefined,
      ],
      expectedJson: { success: true },
    },
    {
      label: 'cancels a campaign',
      operation: new CancelOperation('campaign'),
      parameters: { campaignId: 'campaign-1' },
      method: 'post',
      response: { data: { id: 'campaign-1', status: 'cancelled' } },
      expectedRequest: ['campaigns/campaign-1/cancel'],
      expectedJson: { id: 'campaign-1', status: 'cancelled' },
    },
  ]);

  it('requires at least one field to update', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        campaignId: 'campaign-1',
        updateFields: { recipient_tag_ids: [], recipient_contact_ids: '' },
      });

    await expect(
      new UpdateOperation('campaign').execute.call(context as never, 0),
    ).rejects.toThrow('Please add at least one field to update');
  });

  it('builds the campaign body from the collection fields', (): void => {
    expect(
      buildCampaignBody({
        template_name: '',
        recipient_tag_ids: 'tag-1,tag-2',
        recipient_contact_ids: ['contact-1'],
      }),
    ).toEqual({
      recipient_tag_ids: ['tag-1', 'tag-2'],
      recipient_contact_ids: ['contact-1'],
    });
  });

  it('registers every operation scoped to the resource', (): void => {
    const resource: CampaignResource = new CampaignResource();

    for (const name of [
      'list',
      'get',
      'create',
      'update',
      'delete',
      'listRecipients',
      'getAnalytics',
      'send',
      'cancel',
    ]) {
      expectScopedProperties(resource.getOperation(name), 'campaign');
    }
  });
});
