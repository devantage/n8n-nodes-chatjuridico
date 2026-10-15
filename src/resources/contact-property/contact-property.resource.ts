import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { CreateOperation } from './create';
import { DeleteOperation } from './delete';
import { ListOperation } from './list';
import { UpdateOperation } from './update';

export class ContactPropertyResource extends Resource {
  public constructor() {
    super(
      'contactProperty',
      'Contact Property',
      ListOperation,
      CreateOperation,
      UpdateOperation,
      DeleteOperation,
    );
  }
}
