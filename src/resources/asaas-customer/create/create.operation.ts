import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import {
  type IExecuteFunctions,
  type INodeExecutionData,
  type INodeProperties,
  NodeOperationError,
} from 'n8n-workflow';

import {
  type ApiResponse,
  httpClient,
  withOperationDisplayOptions,
} from '../../../utils';
import { asaasContactIdProperty } from '../shared';

export class CreateOperation extends ResourceOperation {
  public readonly name: string = 'create';

  public readonly displayName: string = 'Create';

  public readonly description: string =
    'Create an Asaas customer linked to a contact';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      asaasContactIdProperty,
      {
        name: 'cpfCnpj',
        displayName: 'CPF/CNPJ',
        description:
          'CPF or CNPJ of the customer. Punctuation is removed before sending and letters of alphanumeric CNPJs are kept.',
        type: 'string',
        required: true,
        default: '',
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const contactId: string = this.getNodeParameter(
      'contactId',
      itemIndex,
    ) as string;

    const rawCpfCnpj: string | number = this.getNodeParameter(
      'cpfCnpj',
      itemIndex,
    ) as string | number;

    const cpfCnpj: string = String(rawCpfCnpj)
      .replace(/[^0-9a-z]/gi, '')
      .toUpperCase();

    if (!cpfCnpj) {
      throw new NodeOperationError(
        this.getNode(),
        "'CPF/CNPJ' must contain digits or letters",
        { itemIndex },
      );
    }

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      'payments/customers/create',
      { contact_id: contactId, cpf_cnpj: cpfCnpj },
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
