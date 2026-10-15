import { describeOperationCases, expectScopedProperties } from '../../testing';
import { GetOperation } from './get';
import { GetRateLimitsOperation } from './get-rate-limits';
import { UsageResource } from './usage.resource';

describe('usage operations', (): void => {
  describeOperationCases([
    {
      label: 'gets the API usage',
      operation: new GetOperation('usage'),
      parameters: { days: 30 },
      method: 'get',
      response: { data: { period_days: 30, total_requests: 100 } },
      expectedRequest: ['usage', { days: 30 }],
      expectedJson: { period_days: 30, total_requests: 100 },
    },
    {
      label: 'gets the rate limits',
      operation: new GetRateLimitsOperation('usage'),
      parameters: {},
      method: 'get',
      response: { data: { tiers: {} } },
      expectedRequest: ['usage/rate-limits'],
      expectedJson: { tiers: {} },
    },
  ]);

  it('registers every operation scoped to the resource', (): void => {
    const resource: UsageResource = new UsageResource();

    for (const name of ['get', 'getRateLimits']) {
      expectScopedProperties(resource.getOperation(name), 'usage');
    }
  });
});
