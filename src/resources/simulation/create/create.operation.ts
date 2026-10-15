import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import {
  type ApiResponse,
  compactObject,
  httpClient,
  withOperationDisplayOptions,
} from '../../../utils';

export class CreateOperation extends ResourceOperation {
  public readonly name: string = 'create';

  public readonly displayName: string = 'Create';

  public readonly description: string =
    'Create an AI agent simulation session in the sandbox';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'instanceId',
        displayName: 'WhatsApp Number Name or ID',
        description:
          'The WhatsApp number (instance) used by the simulation. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getInstanceOptions',
        },
        required: true,
        default: '',
      },
      {
        name: 'additionalFields',
        displayName: 'Additional Fields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        options: [
          {
            name: 'agent_id',
            displayName: 'Agent ID',
            description: 'ID (UUID) of the agent to test',
            type: 'string',
            default: '',
          },
          {
            name: 'simulation_purpose',
            displayName: 'Simulation Purpose',
            description: 'Purpose of the simulation (max 500 characters)',
            type: 'string',
            default: '',
          },
          {
            name: 'contact_name',
            displayName: 'Contact Name',
            description: 'Name of the simulated contact (max 200 characters)',
            type: 'string',
            default: 'Simulacao',
          },
        ],
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const instanceId: string = this.getNodeParameter(
      'instanceId',
      itemIndex,
    ) as string;

    const additionalFields: IDataObject = this.getNodeParameter(
      'additionalFields',
      itemIndex,
      {},
    );

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      'simulations',
      compactObject({ ...additionalFields, instance_id: instanceId }),
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
