import {
  type IDataObject,
  type IExecuteFunctions,
  NodeOperationError,
} from 'n8n-workflow';

import { compactObject, parseJson } from '../../../utils';

/**
 * Validates a signers JSON value, which must be an array of objects.
 */
export function parseSignersJson(
  this: IExecuteFunctions,
  value: unknown,
  itemIndex: number,
): IDataObject[] {
  const signers: unknown = parseJson.call(this, value, 'Signers', itemIndex);

  if (
    !Array.isArray(signers) ||
    signers.some(
      (curSigner: unknown): boolean =>
        typeof curSigner !== 'object' ||
        curSigner === null ||
        Array.isArray(curSigner),
    )
  ) {
    throw new NodeOperationError(
      this.getNode(),
      'Signers must be an array of objects',
      { itemIndex },
    );
  }

  return signers as IDataObject[];
}

/**
 * Reads the signers of the create operation from either the fixed collection
 * or the JSON field, depending on the selected input mode.
 */
export function getSigners(
  this: IExecuteFunctions,
  itemIndex: number,
): IDataObject[] {
  const inputMode: string = this.getNodeParameter(
    'signersInputMode',
    itemIndex,
    'fields',
  ) as string;

  const signers: IDataObject[] =
    inputMode === 'json'
      ? parseSignersJson.call(
          this,
          this.getNodeParameter('signersJson', itemIndex),
          itemIndex,
        )
      : (
          (
            this.getNodeParameter('signers', itemIndex, {}) as {
              signer?: IDataObject[];
            }
          ).signer ?? []
        ).map((curSigner: IDataObject): IDataObject =>
          compactObject(curSigner),
        );

  if (!signers.length) {
    throw new NodeOperationError(
      this.getNode(),
      'Please add at least one signer',
      { itemIndex },
    );
  }

  return signers;
}
