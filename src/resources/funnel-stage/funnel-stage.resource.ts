import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { CreateOperation } from './create';
import { DeleteOperation } from './delete';
import { GetOperation } from './get';
import { ListOperation } from './list';
import { UpdateOperation } from './update';

export class FunnelStageResource extends Resource {
  public constructor() {
    super(
      'funnelStage',
      'Funnel Stage',
      ListOperation,
      GetOperation,
      CreateOperation,
      UpdateOperation,
      DeleteOperation,
    );
  }
}
