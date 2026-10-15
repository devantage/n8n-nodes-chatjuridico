import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { ListOperation } from './list';

export class MemberResource extends Resource {
  public constructor() {
    super('member', 'Member', ListOperation);
  }
}
