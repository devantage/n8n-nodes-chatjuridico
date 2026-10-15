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
import { clientPoloField, cnjProperty, getLawsuitPath } from '../shared';

export class UpdateOperation extends ResourceOperation {
  public readonly name: string = 'update';

  public readonly displayName: string = 'Update';

  public readonly description: string =
    'Update the client side, status or responsible lawyer of an office lawsuit';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      cnjProperty,
      {
        name: 'clearLawyer',
        displayName: 'Clear Responsible Lawyer',
        description:
          'Whether to remove the responsible lawyer of the lawsuit. Overrides the "Responsible Lawyer" field.',
        type: 'boolean',
        default: false,
      },
      {
        name: 'updateFields',
        displayName: 'Update Fields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        options: [
          clientPoloField,
          {
            name: 'status_operacional',
            displayName: 'Status',
            description: 'Operational status of the lawsuit in the office',
            type: 'options',
            options: [
              { name: 'Appeal', value: 'RECURSAL' },
              { name: 'Awaiting Closure', value: 'AGUARDANDO_BAIXA' },
              { name: 'Closed', value: 'ENCERRADO' },
              { name: 'Enforcement', value: 'EXECUCAO' },
              { name: 'Knowledge Phase', value: 'CONHECIMENTO' },
            ],
            default: 'CONHECIMENTO',
          },
          {
            name: 'advogado_user_id',
            displayName: 'Responsible Lawyer Name or ID',
            description:
              'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
            type: 'options',
            typeOptions: {
              loadOptionsMethod: 'getMemberOptions',
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
    const cnj: string = this.getNodeParameter('cnj', itemIndex) as string;

    const clearLawyer: boolean = this.getNodeParameter(
      'clearLawyer',
      itemIndex,
      false,
    ) as boolean;

    const updateFields: IDataObject = this.getNodeParameter(
      'updateFields',
      itemIndex,
      {},
    );

    const body: IDataObject = compactObject({
      ...updateFields,
      advogado_user_id: clearLawyer ? null : updateFields.advogado_user_id,
    });

    if (!Object.keys(body).length) {
      throw new NodeOperationError(
        this.getNode(),
        'Please add at least one field to update',
        { itemIndex },
      );
    }

    const response: ApiResponse | undefined = await httpClient.patch<
      ApiResponse | undefined
    >(this, getLawsuitPath(cnj), undefined, body);

    return {
      json: response?.data ?? { success: true },
      pairedItem: itemIndex,
    };
  }
}
