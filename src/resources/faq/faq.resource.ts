import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { CreateOperation } from './create';
import { DeleteOperation } from './delete';
import { GenerateOperation } from './generate';
import { ListOperation } from './list';
import { SuggestFromConversationsOperation } from './suggest-from-conversations';
import { UpdateOperation } from './update';

export class FaqResource extends Resource {
  public constructor() {
    super(
      'faq',
      'AI Agent FAQ',
      ListOperation,
      CreateOperation,
      UpdateOperation,
      DeleteOperation,
      GenerateOperation,
      SuggestFromConversationsOperation,
    );
  }
}
