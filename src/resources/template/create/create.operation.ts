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
  parseJson,
  withOperationDisplayOptions,
} from '../../../utils';
import { templateCategoryOptions } from '../shared';

export class CreateOperation extends ResourceOperation {
  public readonly name: string = 'create';

  public readonly displayName: string = 'Create';

  public readonly description: string = 'Create a WhatsApp template as a draft';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'name',
        displayName: 'Name',
        description: 'Template name',
        type: 'string',
        required: true,
        default: '',
      },
      {
        name: 'language',
        displayName: 'Language',
        description: 'Template language code (e.g. pt_BR)',
        type: 'string',
        required: true,
        default: 'pt_BR',
      },
      {
        name: 'category',
        displayName: 'Category',
        description: 'Template category, as classified by Meta',
        type: 'options',
        options: templateCategoryOptions,
        required: true,
        default: 'UTILITY',
      },
      {
        name: 'components',
        displayName: 'Components (JSON)',
        description:
          'Array of template components (header, body, buttons) in the Meta format. Media headers can be sent as `{"type": "HEADER", "format": "IMAGE", "example": {"header_url": "<public URL>"}}`.',
        type: 'json',
        required: true,
        default: '[\n  {\n    "type": "BODY",\n    "text": ""\n  }\n]',
      },
      {
        name: 'instanceId',
        displayName: 'WhatsApp Number Name or ID',
        description:
          'WhatsApp number the template belongs to. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getInstanceOptions',
        },
        required: true,
        default: '',
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const name: string = this.getNodeParameter('name', itemIndex) as string;

    const language: string = this.getNodeParameter(
      'language',
      itemIndex,
    ) as string;

    const category: string = this.getNodeParameter(
      'category',
      itemIndex,
    ) as string;

    const components: unknown = parseJson.call(
      this,
      this.getNodeParameter('components', itemIndex),
      'Components',
      itemIndex,
    );

    const instanceId: string = this.getNodeParameter(
      'instanceId',
      itemIndex,
    ) as string;

    const body: IDataObject = {
      name,
      language,
      category,
      components: components as IDataObject[],
      instance_id: instanceId,
    };

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      'templates',
      body,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
