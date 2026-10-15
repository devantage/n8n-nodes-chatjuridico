import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { CancelOperation } from './cancel';
import { ListOperation } from './list';

export class FollowUpResource extends Resource {
  public constructor() {
    super('followUp', 'AI Agent Follow-Up', ListOperation, CancelOperation);
  }
}
