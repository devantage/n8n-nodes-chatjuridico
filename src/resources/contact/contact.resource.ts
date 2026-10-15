import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { BulkCreateOperation } from './bulk-create';
import { CreateOperation } from './create';
import { DeleteOperation } from './delete';
import { FindDuplicatesOperation } from './find-duplicates';
import { GetOperation } from './get';
import { GetPropertiesOperation } from './get-properties';
import { ListOperation } from './list';
import { MergeOperation } from './merge';
import { SetPropertiesOperation } from './set-properties';
import { UpdateOperation } from './update';
import { UpdateProfilePictureOperation } from './update-profile-picture';

export class ContactResource extends Resource {
  public constructor() {
    super(
      'contact',
      'Contact',
      ListOperation,
      GetOperation,
      CreateOperation,
      BulkCreateOperation,
      UpdateOperation,
      DeleteOperation,
      MergeOperation,
      FindDuplicatesOperation,
      UpdateProfilePictureOperation,
      GetPropertiesOperation,
      SetPropertiesOperation,
    );
  }
}
