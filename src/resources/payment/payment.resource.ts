import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { AcknowledgeOverdueOperation } from './acknowledge-overdue';
import { CancelOperation } from './cancel';
import { CreateOperation } from './create';
import { FillDataOperation } from './fill-data';
import { GetOperation } from './get';
import { GetChatValuesOperation } from './get-chat-values';
import { GetDashboardOperation } from './get-dashboard';
import { GetFunnelValuesOperation } from './get-funnel-values';
import { GetTimeSeriesOperation } from './get-time-series';
import { ListOperation } from './list';
import { ScheduleRemindersOperation } from './schedule-reminders';

export class PaymentResource extends Resource {
  public constructor() {
    super(
      'payment',
      'Payment (Asaas)',
      ListOperation,
      GetOperation,
      CreateOperation,
      CancelOperation,
      AcknowledgeOverdueOperation,
      ScheduleRemindersOperation,
      FillDataOperation,
      GetDashboardOperation,
      GetTimeSeriesOperation,
      GetFunnelValuesOperation,
      GetChatValuesOperation,
    );
  }
}
