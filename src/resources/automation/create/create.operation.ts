import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import {
  type ApiResponse,
  httpClient,
  withOperationDisplayOptions,
} from '../../../utils';
import { automationFields, buildAutomationBody } from '../shared';

export class CreateOperation extends ResourceOperation {
  public readonly name: string = 'create';

  public readonly displayName: string = 'Create';

  public readonly description: string = 'Create an automation';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'name',
        displayName: 'Name',
        description: 'Automation name (1 to 255 characters)',
        type: 'string',
        required: true,
        default: '',
      },
      {
        name: 'instanceId',
        displayName: 'WhatsApp Number Name or ID',
        description:
          'WhatsApp number the automation belongs to. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
        options: automationFields,
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const name: string = this.getNodeParameter('name', itemIndex) as string;

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
      'automations',
      buildAutomationBody.call(
        this,
        { ...additionalFields, name, instance_id: instanceId },
        itemIndex,
      ),
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
