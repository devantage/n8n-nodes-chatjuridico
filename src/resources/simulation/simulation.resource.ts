import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { CreateOperation } from './create';
import { EndOperation } from './end';
import { GetOperation } from './get';
import { ListOperation } from './list';
import { ListMessagesOperation } from './list-messages';
import { SendMessageOperation } from './send-message';

export class SimulationResource extends Resource {
  public constructor() {
    super(
      'simulation',
      'AI Agent Simulation',
      ListOperation,
      CreateOperation,
      GetOperation,
      ListMessagesOperation,
      SendMessageOperation,
      EndOperation,
    );
  }
}
