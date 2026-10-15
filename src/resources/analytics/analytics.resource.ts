import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { GetAdMetricsOperation } from './get-ad-metrics';
import { GetContactMetricsOperation } from './get-contact-metrics';
import { GetDashboardOperation } from './get-dashboard';
import { GetResponseTimesOperation } from './get-response-times';
import { GetStageMetricsOperation } from './get-stage-metrics';
import { GetTeamPerformanceOperation } from './get-team-performance';
import { ListConversationsOperation } from './list-conversations';
import { ListInteractionsOperation } from './list-interactions';

export class AnalyticsResource extends Resource {
  public constructor() {
    super(
      'analytics',
      'Analytics',
      GetDashboardOperation,
      GetContactMetricsOperation,
      GetTeamPerformanceOperation,
      GetStageMetricsOperation,
      GetResponseTimesOperation,
      ListInteractionsOperation,
      ListConversationsOperation,
      GetAdMetricsOperation,
    );
  }
}
