import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import { compactObject, withOperationDisplayOptions } from '../../../utils';
import { createListProperties, getListResults } from '../../shared';

export class ListOperation extends ResourceOperation {
  public readonly name: string = 'list';

  public readonly displayName: string = 'List';

  public readonly description: string = 'List scheduled messages';

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
            name: 'status',
            displayName: 'Status',
            type: 'options',
            options: [
              { name: 'Pending', value: 'pending' },
              { name: 'Processing', value: 'processing' },
              { name: 'Automation Pending', value: 'automation_pending' },
              { name: 'Automation Sending', value: 'automation_sending' },
              { name: 'Sent', value: 'sent' },
              { name: 'Failed', value: 'failed' },
              { name: 'Error', value: 'error' },
              { name: 'Canceled', value: 'canceled' },
            ],
            default: 'pending',
          },
          {
            name: 'conversation_id',
            displayName: 'Conversation ID',
            description:
              'Return only the scheduled messages of this conversation (UUID)',
            type: 'string',
            default: '',
          },
          {
            name: 'after',
            displayName: 'Scheduled After',
            description: 'Return messages scheduled after this date',
            type: 'dateTime',
            default: '',
          },
          {
            name: 'before',
            displayName: 'Scheduled Before',
            description: 'Return messages scheduled before this date',
            type: 'dateTime',
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
        'scheduled-messages',
        compactObject(filters),
        200,
      ),
      pairedItem: itemIndex,
    };
  }
}
