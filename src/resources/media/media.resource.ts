import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { GetUploadUrlOperation } from './get-upload-url';
import { UploadOperation } from './upload';

export class MediaResource extends Resource {
  public constructor() {
    super('media', 'Media', UploadOperation, GetUploadUrlOperation);
  }
}
