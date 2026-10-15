import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { GetOperation } from './get';
import { GetRateLimitsOperation } from './get-rate-limits';

export class UsageResource extends Resource {
  public constructor() {
    super('usage', 'API Usage', GetOperation, GetRateLimitsOperation);
  }
}
