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
  parseJson,
  splitList,
  withOperationDisplayOptions,
} from '../../../utils';

const MAX_PAYMENT_IDS: number = 50;

export class ScheduleRemindersOperation extends ResourceOperation {
  public readonly name: string = 'scheduleReminders';

  public readonly displayName: string = 'Schedule Reminders';

  public readonly description: string =
    'Schedule WhatsApp reminders 3 days before the due date of pending payments';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'paymentIds',
        displayName: 'Payment IDs',
        description: `Comma separated list of payment IDs (max ${String(MAX_PAYMENT_IDS)})`,
        type: 'string',
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
            name: 'template_name',
            displayName: 'Template Name',
            description:
              'Name of an approved Meta template, required for reminders on Meta instances',
            type: 'string',
            default: '',
          },
          {
            name: 'template_language',
            displayName: 'Template Language',
            type: 'string',
            default: 'pt_BR',
          },
          {
            name: 'template_parameters',
            displayName: 'Template Parameters',
            description: 'JSON object mapping template parameters to values',
            type: 'json',
            default: '{}',
          },
          {
            name: 'text',
            displayName: 'Text',
            description:
              'Reminder text, used when the provider allows scheduled messages without a template',
            type: 'string',
            typeOptions: {
              rows: 4,
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
    const paymentIds: string[] = splitList(
      this.getNodeParameter('paymentIds', itemIndex) as string | string[],
    );

    if (!paymentIds.length) {
      throw new NodeOperationError(
        this.getNode(),
        'Please provide at least one payment ID',
        { itemIndex },
      );
    }

    if (paymentIds.length > MAX_PAYMENT_IDS) {
      throw new NodeOperationError(
        this.getNode(),
        `A maximum of ${String(MAX_PAYMENT_IDS)} payment IDs is allowed per request`,
        { itemIndex },
      );
    }

    const additionalFields: IDataObject = this.getNodeParameter(
      'additionalFields',
      itemIndex,
      {},
    );

    const templateParameters: unknown =
      additionalFields.template_parameters !== undefined
        ? parseJson.call(
            this,
            additionalFields.template_parameters,
            'Template Parameters',
            itemIndex,
          )
        : undefined;

    if (
      templateParameters !== undefined &&
      (typeof templateParameters !== 'object' ||
        templateParameters === null ||
        Array.isArray(templateParameters))
    ) {
      throw new NodeOperationError(
        this.getNode(),
        "'Template Parameters' must be a JSON object",
        { itemIndex },
      );
    }

    const body: IDataObject = compactObject({
      ...additionalFields,
      payment_ids: paymentIds,
      template_parameters: templateParameters,
    });

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      'payments/schedule-reminders',
      body,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
