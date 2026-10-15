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

  public readonly description: string = 'List AI agent simulation sessions';

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
            name: 'state',
            displayName: 'State',
            description: 'Filter by simulation state',
            type: 'options',
            options: [
              { name: 'Ongoing', value: 'ongoing' },
              { name: 'Completed', value: 'completed' },
            ],
            default: 'ongoing',
          },
          {
            name: 'agent_id',
            displayName: 'Agent ID',
            description: 'Filter by agent ID (UUID)',
            type: 'string',
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
        'simulations',
        compactObject(filters),
        200,
      ),
      pairedItem: itemIndex,
    };
  }
}
