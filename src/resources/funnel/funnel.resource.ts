import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { GetOperation } from './get';
import { ListOperation } from './list';

export class FunnelResource extends Resource {
  public constructor() {
    super('funnel', 'Funnel', ListOperation, GetOperation);
  }
}
