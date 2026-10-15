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
  getIdempotencyOptions,
  httpClient,
  withOperationDisplayOptions,
} from '../../../utils';
import { billingTypeOptions, formatDate } from '../shared';

export class CreateOperation extends ResourceOperation {
  public readonly name: string = 'create';

  public readonly displayName: string = 'Create';

  public readonly description: string =
    'Create a payment in Asaas for a contact';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'contactId',
        displayName: 'Contact ID',
        description:
          'ID of the contact to charge. An Asaas customer is created automatically when the contact is not linked yet.',
        type: 'string',
        required: true,
        default: '',
      },
      {
        name: 'instanceId',
        displayName: 'WhatsApp Number Name or ID',
        description:
          'WhatsApp number used to send the payment. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getInstanceOptions',
        },
        required: true,
        default: '',
      },
      {
        name: 'value',
        displayName: 'Value',
        description: 'Payment amount in BRL',
        type: 'number',
        typeOptions: {
          minValue: 0.01,
          numberPrecision: 2,
        },
        required: true,
        default: 0,
      },
      {
        name: 'dueDate',
        displayName: 'Due Date',
        type: 'dateTime',
        required: true,
        default: '',
      },
      {
        name: 'billingType',
        displayName: 'Billing Type',
        type: 'options',
        options: billingTypeOptions,
        required: true,
        default: 'PIX',
      },
      {
        name: 'additionalFields',
        displayName: 'Additional Fields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        options: [
          {
            name: 'description',
            displayName: 'Description',
            description: 'Payment description (max 500 characters)',
            type: 'string',
            default: '',
          },
          {
            name: 'installment_count',
            displayName: 'Installment Count',
            description: 'Number of installments',
            type: 'number',
            typeOptions: {
              minValue: 1,
              maxValue: 12,
            },
            default: 1,
          },
          {
            name: 'interest_percentage',
            displayName: 'Interest Percentage',
            description: 'Monthly interest (max 1% by consumer protection law)',
            type: 'number',
            typeOptions: {
              minValue: 0,
              maxValue: 1,
              numberPrecision: 2,
            },
            default: 0,
          },
          {
            name: 'fine_percentage',
            displayName: 'Fine Percentage',
            description:
              'Late payment fine (max 2% by consumer protection law)',
            type: 'number',
            typeOptions: {
              minValue: 0,
              maxValue: 2,
              numberPrecision: 2,
            },
            default: 0,
          },
          {
            name: 'discount_value',
            displayName: 'Discount Value',
            description: 'Discount amount in BRL',
            type: 'number',
            typeOptions: {
              minValue: 0,
              numberPrecision: 2,
            },
            default: 0,
          },
          {
            name: 'discount_due_date',
            displayName: 'Discount Due Date',
            description: 'Date until which the discount is valid',
            type: 'dateTime',
            default: '',
          },
        ],
      },
      {
        name: 'options',
        displayName: 'Options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            name: 'idempotencyKey',
            displayName: 'Idempotency Key',
            description:
              'Unique key that prevents the payment from being created twice when the request is retried',
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
    const contactId: string = this.getNodeParameter(
      'contactId',
      itemIndex,
    ) as string;

    const instanceId: string = this.getNodeParameter(
      'instanceId',
      itemIndex,
    ) as string;

    const value: number = this.getNodeParameter('value', itemIndex) as number;

    const dueDate: string = this.getNodeParameter(
      'dueDate',
      itemIndex,
    ) as string;

    const billingType: string = this.getNodeParameter(
      'billingType',
      itemIndex,
    ) as string;

    const additionalFields: IDataObject = this.getNodeParameter(
      'additionalFields',
      itemIndex,
      {},
    );

    const options: IDataObject = this.getNodeParameter(
      'options',
      itemIndex,
      {},
    );

    const body: IDataObject = compactObject({
      ...additionalFields,
      contact_id: contactId,
      instance_id: instanceId,
      value,
      due_date: formatDate(dueDate),
      billing_type: billingType,
      discount_due_date: formatDate(additionalFields.discount_due_date),
    });

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      'payments',
      body,
      undefined,
      getIdempotencyOptions(options.idempotencyKey as string | undefined),
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
