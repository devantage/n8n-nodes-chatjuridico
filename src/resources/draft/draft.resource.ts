import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { DeleteOperation } from './delete';
import { GetOperation } from './get';
import { ListOperation } from './list';
import { SaveOperation } from './save';

export class DraftResource extends Resource {
  public constructor() {
    super(
      'draft',
      'Draft',
      ListOperation,
      GetOperation,
      SaveOperation,
      DeleteOperation,
    );
  }
}
