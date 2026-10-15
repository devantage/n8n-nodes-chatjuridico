import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { ActivateOperation } from './activate';
import { DeactivateOperation } from './deactivate';
import { GetStatusOperation } from './get-status';
import { SyncCreditsOperation } from './sync-credits';

export class ZapSignIntegrationResource extends Resource {
  public constructor() {
    super(
      'zapSignIntegration',
      'ZapSign Integration',
      GetStatusOperation,
      ActivateOperation,
      DeactivateOperation,
      SyncCreditsOperation,
    );
  }
}
