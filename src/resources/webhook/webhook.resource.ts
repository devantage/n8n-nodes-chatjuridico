import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { CreateOperation } from './create';
import { DeleteOperation } from './delete';
import { GetOperation } from './get';
import { ListOperation } from './list';
import { TestOperation } from './test';
import { UpdateOperation } from './update';

export class WebhookResource extends Resource {
  public constructor() {
    super(
      'webhook',
      'Webhook',
      ListOperation,
      GetOperation,
      CreateOperation,
      UpdateOperation,
      DeleteOperation,
      TestOperation,
    );
  }
}
