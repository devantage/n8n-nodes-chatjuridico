import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { CancelOperation } from './cancel';
import { CreateOperation } from './create';
import { DeleteOperation } from './delete';
import { GetOperation } from './get';
import { GetAnalyticsOperation } from './get-analytics';
import { ListOperation } from './list';
import { ListRecipientsOperation } from './list-recipients';
import { SendOperation } from './send';
import { UpdateOperation } from './update';

export class CampaignResource extends Resource {
  public constructor() {
    super(
      'campaign',
      'Campaign',
      ListOperation,
      GetOperation,
      CreateOperation,
      UpdateOperation,
      DeleteOperation,
      ListRecipientsOperation,
      GetAnalyticsOperation,
      SendOperation,
      CancelOperation,
    );
  }
}
