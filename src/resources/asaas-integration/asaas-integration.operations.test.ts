import { describeOperationCases, expectScopedProperties } from '../../testing';
import { ActivateOperation } from './activate';
import { AsaasIntegrationResource } from './asaas-integration.resource';
import { DeactivateOperation } from './deactivate';
import { DetectEnvironmentOperation } from './detect-environment';
import { GetStatusOperation } from './get-status';

describe('asaas integration operations', (): void => {
  describeOperationCases([
    {
      label: 'gets the integration status',
      operation: new GetStatusOperation('asaasIntegration'),
      parameters: {},
      method: 'get',
      response: { data: { is_active: true } },
      expectedRequest: ['integrations/asaas'],
      expectedJson: { is_active: true },
    },
    {
      label: 'activates the integration',
      operation: new ActivateOperation('asaasIntegration'),
      parameters: { apiKey: 'secret', environment: 'sandbox' },
      method: 'post',
      response: { data: { is_active: true } },
      expectedRequest: [
        'integrations/asaas/activate',
        { api_key: 'secret', environment: 'sandbox' },
      ],
      expectedJson: { is_active: true },
    },
    {
      label: 'activates the integration when the response has no envelope',
      operation: new ActivateOperation('asaasIntegration'),
      parameters: { apiKey: 'secret', environment: 'production' },
      method: 'post',
      response: { message: 'ok' },
      expectedRequest: [
        'integrations/asaas/activate',
        { api_key: 'secret', environment: 'production' },
      ],
      expectedJson: { message: 'ok' },
    },
    {
      label: 'deactivates the integration',
      operation: new DeactivateOperation('asaasIntegration'),
      parameters: {},
      method: 'post',
      response: { data: { message: 'deactivated' } },
      expectedRequest: ['integrations/asaas/deactivate'],
      expectedJson: { message: 'deactivated' },
    },
    {
      label: 'detects the API key environment',
      operation: new DetectEnvironmentOperation('asaasIntegration'),
      parameters: { apiKey: 'secret' },
      method: 'post',
      response: { data: { environment: 'sandbox' } },
      expectedRequest: ['integrations/asaas/detect-env', { api_key: 'secret' }],
      expectedJson: { environment: 'sandbox' },
    },
  ]);

  it('registers every operation scoped to the resource', (): void => {
    const resource: AsaasIntegrationResource = new AsaasIntegrationResource();

    for (const name of [
      'getStatus',
      'activate',
      'deactivate',
      'detectEnvironment',
    ]) {
      expectScopedProperties(resource.getOperation(name), 'asaasIntegration');
    }
  });
});
