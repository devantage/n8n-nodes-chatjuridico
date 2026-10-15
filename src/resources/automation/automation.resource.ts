import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { CreateOperation } from './create';
import { DeleteOperation } from './delete';
import { GetOperation } from './get';
import { GetExecutionStatsOperation } from './get-execution-stats';
import { ListOperation } from './list';
import { ListExecutionsOperation } from './list-executions';
import { ToggleOperation } from './toggle';
import { UpdateOperation } from './update';

export class AutomationResource extends Resource {
  public constructor() {
    super(
      'automation',
      'Automation',
      ListOperation,
      GetOperation,
      CreateOperation,
      UpdateOperation,
      DeleteOperation,
      ToggleOperation,
      ListExecutionsOperation,
      GetExecutionStatsOperation,
    );
  }
}
