import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { CountOperation } from './count';
import { CreateOperation } from './create';
import { GetOperation } from './get';
import { ListOperation } from './list';
import { SearchOperation } from './search';
import { TransferOperation } from './transfer';
import { UpdateOperation } from './update';

export class ConversationResource extends Resource {
  public constructor() {
    super(
      'conversation',
      'Conversation',
      ListOperation,
      SearchOperation,
      CountOperation,
      GetOperation,
      CreateOperation,
      UpdateOperation,
      TransferOperation,
    );
  }
}
