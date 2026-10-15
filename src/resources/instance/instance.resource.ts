import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { GetOperation } from './get';
import { GetQrCodeOperation } from './get-qr-code';
import { GetStatusOperation } from './get-status';
import { ListOperation } from './list';
import { ReconnectOperation } from './reconnect';

export class InstanceResource extends Resource {
  public constructor() {
    super(
      'instance',
      'WhatsApp Number',
      ListOperation,
      GetOperation,
      GetStatusOperation,
      GetQrCodeOperation,
      ReconnectOperation,
    );
  }
}
