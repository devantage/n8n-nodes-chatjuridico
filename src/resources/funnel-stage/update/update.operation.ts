import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import {
  type IDataObject,
  type IExecuteFunctions,
  type INodeExecutionData,
  type INodeProperties,
  NodeOperationError,
} from 'n8n-workflow';

import {
  type ApiResponse,
  compactObject,
  httpClient,
  withOperationDisplayOptions,
} from '../../../utils';
import { funnelStageFields, funnelStageIdProperty } from '../shared';

export class UpdateOperation extends ResourceOperation {
  public readonly name: string = 'update';

  public readonly displayName: string = 'Update';

  public readonly description: string = 'Update a funnel stage';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      funnelStageIdProperty,
      {
        name: 'updateFields',
        displayName: 'Update Fields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        options: [
          {
            name: 'name',
            displayName: 'Name',
            type: 'string',
            default: '',
          },
          ...funnelStageFields.filter(
            ({ name }: INodeProperties): boolean => name !== 'funnel_id',
          ),
          {
            name: 'is_active',
            displayName: 'Is Active',
            type: 'boolean',
            default: true,
          },
        ],
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const stageId: string = this.getNodeParameter(
      'stageId',
      itemIndex,
    ) as string;

    const body: IDataObject = compactObject(
      this.getNodeParameter('updateFields', itemIndex, {}),
    );

    if (!Object.keys(body).length) {
      throw new NodeOperationError(
        this.getNode(),
        'Please add at least one field to update',
        { itemIndex },
      );
    }

    const response: ApiResponse = await httpClient.patch<ApiResponse>(
      this,
      `funnel-stages/${stageId}`,
      undefined,
      body,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
