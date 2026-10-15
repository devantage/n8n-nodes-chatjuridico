import { expectScopedProperties } from '../../testing';
import { BulkCreateOperation } from './bulk-create';
import { ContactResource } from './contact.resource';
import { CreateOperation } from './create';
import { DeleteOperation } from './delete';
import { FindDuplicatesOperation } from './find-duplicates';
import { GetOperation } from './get';
import { ListOperation } from './list';
import { MergeOperation } from './merge';
import { UpdateOperation } from './update';
import { UpdateProfilePictureOperation } from './update-profile-picture';

describe('ContactResource', (): void => {
  const resource: ContactResource = new ContactResource();

  it.each([
    ['list', ListOperation],
    ['get', GetOperation],
    ['create', CreateOperation],
    ['bulkCreate', BulkCreateOperation],
    ['update', UpdateOperation],
    ['delete', DeleteOperation],
    ['merge', MergeOperation],
    ['findDuplicates', FindDuplicatesOperation],
    ['updateProfilePicture', UpdateProfilePictureOperation],
  ])(
    'registers the %s operation',
    (
      name: string,
      operationClass: abstract new (...args: never[]) => unknown,
    ): void => {
      const operation: ReturnType<ContactResource['getOperation']> =
        resource.getOperation(name);

      expect(operation).toBeInstanceOf(operationClass);
      expectScopedProperties(operation, 'contact');
    },
  );
});
