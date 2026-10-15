import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import type { ApiResponse } from '../../../utils';
import type { ContactProperty } from '../models';
import { listContactProperties } from '../shared';

export class ListOperation extends ResourceOperation {
  public readonly name: string = 'list';

  public readonly displayName: string = 'List';

  public readonly description: string =
    'List the custom fields shown in the contact panel';

  public readonly properties: INodeProperties[] = [];

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const response: ApiResponse<ContactProperty[]> =
      await listContactProperties.call(this);

    return {
      json: response,
      pairedItem: itemIndex,
    };
  }
}
