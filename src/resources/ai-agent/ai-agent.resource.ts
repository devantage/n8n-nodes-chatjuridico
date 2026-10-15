import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { ActivateOperation } from './activate';
import { DeactivateOperation } from './deactivate';
import { GetStatusOperation } from './get-status';

export class AiAgentResource extends Resource {
  public constructor() {
    super(
      'aiAgent',
      'AI Agent',
      GetStatusOperation,
      ActivateOperation,
      DeactivateOperation,
    );
  }
}
