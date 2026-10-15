import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import { compactObject, withOperationDisplayOptions } from '../../../utils';
import { createListProperties, getListResults } from '../../shared';

export class GetChatValuesOperation extends ResourceOperation {
  public readonly name: string = 'getChatValues';

  public readonly displayName: string = 'Get Chat Values';

  public readonly description: string =
    'Get payment values aggregated by conversation';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      ...createListProperties(200, 50),
      {
        name: 'filters',
        displayName: 'Filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        options: [
          {
            name: 'contact_id',
            displayName: 'Contact ID',
            type: 'string',
            default: '',
          },
          {
            name: 'stage_id',
            displayName: 'Funnel Stage Name or ID',
            description:
              'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
            type: 'options',
            typeOptions: {
              loadOptionsMethod: 'getFunnelStageOptions',
            },
            default: '',
          },
        ],
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const filters: IDataObject = this.getNodeParameter(
      'filters',
      itemIndex,
      {},
    );

    return {
      json: await getListResults.call(
        this,
        itemIndex,
        'payments/chat-values',
        compactObject(filters),
        200,
      ),
      pairedItem: itemIndex,
    };
  }
}
