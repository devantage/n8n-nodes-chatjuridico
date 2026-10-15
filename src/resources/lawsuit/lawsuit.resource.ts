import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { ClearActiveOperation } from './clear-active';
import { CreateOperation } from './create';
import { GetOperation } from './get';
import { ListOperation } from './list';
import { SetActiveOperation } from './set-active';
import { UnbindConversationOperation } from './unbind-conversation';
import { UpdateOperation } from './update';

export class LawsuitResource extends Resource {
  public constructor() {
    super(
      'lawsuit',
      'Lawsuit',
      ListOperation,
      GetOperation,
      CreateOperation,
      UpdateOperation,
      UnbindConversationOperation,
      SetActiveOperation,
      ClearActiveOperation,
    );
  }
}
