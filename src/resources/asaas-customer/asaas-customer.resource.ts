import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { CreateOperation } from './create';
import { ListOperation } from './list';
import { SyncOperation } from './sync';

export class AsaasCustomerResource extends Resource {
  public constructor() {
    super(
      'asaasCustomer',
      'Asaas Customer',
      ListOperation,
      SyncOperation,
      CreateOperation,
    );
  }
}
