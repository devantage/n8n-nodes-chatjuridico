import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { DeleteOperation } from './delete';
import { GetOperation } from './get';
import { GetMediaOperation } from './get-media';
import { ListOperation } from './list';
import { ReactOperation } from './react';
import { SendOperation } from './send';
import { SendSequenceOperation } from './send-sequence';
import { TranscribeOperation } from './transcribe';

export class MessageResource extends Resource {
  public constructor() {
    super(
      'message',
      'Message',
      ListOperation,
      SendOperation,
      SendSequenceOperation,
      GetOperation,
      DeleteOperation,
      ReactOperation,
      TranscribeOperation,
      GetMediaOperation,
    );
  }
}
