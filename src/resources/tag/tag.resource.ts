import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { CreateOperation } from './create';
import { DeleteOperation } from './delete';
import { GetOperation } from './get';
import { ListOperation } from './list';
import { UpdateOperation } from './update';

export class TagResource extends Resource {
  public constructor() {
    super(
      'tag',
      'Tag',
      ListOperation,
      GetOperation,
      CreateOperation,
      UpdateOperation,
      DeleteOperation,
    );
  }
}
