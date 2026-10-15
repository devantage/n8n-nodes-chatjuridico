import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { ActivateOperation } from './activate';
import { DeactivateOperation } from './deactivate';
import { DetectEnvironmentOperation } from './detect-environment';
import { GetStatusOperation } from './get-status';

export class AsaasIntegrationResource extends Resource {
  public constructor() {
    super(
      'asaasIntegration',
      'Asaas Integration',
      GetStatusOperation,
      ActivateOperation,
      DeactivateOperation,
      DetectEnvironmentOperation,
    );
  }
}
