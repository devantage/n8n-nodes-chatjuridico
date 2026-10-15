import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { CreateOperation } from './create';
import { CreateDraftOperation } from './create-draft';
import { DeleteOperation } from './delete';
import { ExtractSignerDataOperation } from './extract-signer-data';
import { GetOperation } from './get';
import { GetDownloadUrlOperation } from './get-download-url';
import { ListOperation } from './list';
import { SendDraftOperation } from './send-draft';
import { UpdateOperation } from './update';
import { UploadDraftFileOperation } from './upload-draft-file';

export class SignatureResource extends Resource {
  public constructor() {
    super(
      'signature',
      'Signature Document (ZapSign)',
      ListOperation,
      GetOperation,
      CreateOperation,
      UpdateOperation,
      DeleteOperation,
      GetDownloadUrlOperation,
      CreateDraftOperation,
      UploadDraftFileOperation,
      SendDraftOperation,
      ExtractSignerDataOperation,
    );
  }
}
