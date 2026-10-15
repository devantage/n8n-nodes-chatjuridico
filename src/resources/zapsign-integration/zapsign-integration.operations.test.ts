import { describeOperationCases, expectScopedProperties } from '../../testing';
import { ActivateOperation } from './activate';
import { DeactivateOperation } from './deactivate';
import { GetStatusOperation } from './get-status';
import { SyncCreditsOperation } from './sync-credits';
import { ZapSignIntegrationResource } from './zapsign-integration.resource';

describe('ZapSign integration operations', (): void => {
  describeOperationCases([
    {
      label: 'gets the integration status',
      operation: new GetStatusOperation('zapSignIntegration'),
      parameters: {},
      method: 'get',
      response: { data: { is_active: true } },
      expectedRequest: ['integrations/zapsign'],
      expectedJson: { is_active: true },
    },
    {
      label: 'activates the integration',
      operation: new ActivateOperation('zapSignIntegration'),
      parameters: { apiKey: 'secret' },
      method: 'post',
      response: { data: { is_active: true, webhook_count: 2 } },
      expectedRequest: ['integrations/zapsign/activate', { api_key: 'secret' }],
      expectedJson: { is_active: true, webhook_count: 2 },
    },
    {
      label: 'deactivates the integration',
      operation: new DeactivateOperation('zapSignIntegration'),
      parameters: {},
      method: 'post',
      response: { data: { message: 'ok' } },
      expectedRequest: ['integrations/zapsign/deactivate'],
      expectedJson: { message: 'ok' },
    },
    {
      label: 'syncs the credits',
      operation: new SyncCreditsOperation('zapSignIntegration'),
      parameters: {},
      method: 'post',
      response: { data: { credits: { remaining: 10 } } },
      expectedRequest: ['integrations/zapsign/sync-credits'],
      expectedJson: { credits: { remaining: 10 } },
    },
  ]);

  it('registers every operation scoped to the resource', (): void => {
    const resource: ZapSignIntegrationResource =
      new ZapSignIntegrationResource();

    for (const name of ['getStatus', 'activate', 'deactivate', 'syncCredits']) {
      expectScopedProperties(resource.getOperation(name), 'zapSignIntegration');
    }
  });

  it('hides the API key', (): void => {
    expect(
      new ActivateOperation('zapSignIntegration').properties[0].typeOptions,
    ).toEqual({ password: true });
  });
});
