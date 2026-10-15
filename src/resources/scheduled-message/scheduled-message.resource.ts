import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { CancelOperation } from './cancel';
import { CreateOperation } from './create';
import { GetOperation } from './get';
import { ListOperation } from './list';

export class ScheduledMessageResource extends Resource {
  public constructor() {
    super(
      'scheduledMessage',
      'Scheduled Message',
      ListOperation,
      GetOperation,
      CreateOperation,
      CancelOperation,
    );
  }
}
