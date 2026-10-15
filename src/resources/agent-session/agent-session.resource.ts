import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { CompleteOperation } from './complete';
import { CountOperation } from './count';
import { DailyCountOperation } from './daily-count';
import { GetOperation } from './get';
import { ListOperation } from './list';
import { ListEvaluationsOperation } from './list-evaluations';
import { ListLogsOperation } from './list-logs';
import { SendFeedbackOperation } from './send-feedback';

export class AgentSessionResource extends Resource {
  public constructor() {
    super(
      'agentSession',
      'AI Agent Session',
      ListOperation,
      CountOperation,
      DailyCountOperation,
      GetOperation,
      CompleteOperation,
      SendFeedbackOperation,
      ListEvaluationsOperation,
      ListLogsOperation,
    );
  }
}
