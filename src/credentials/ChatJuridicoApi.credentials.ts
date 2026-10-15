import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class ChatJuridicoApi implements ICredentialType {
  public name: string = 'chatJuridicoApi';

  public displayName: string = 'ChatJuridico API';

  public documentationUrl: string = 'https://api.jur.chat/v1/openapi.json';

  public properties: INodeProperties[] = [
    {
      name: 'apiKey',
      displayName: 'API Key',
      description:
        'API key generated in the ChatJuridico dashboard under Settings > Developers (format `cj_live_...`)',
      type: 'string',
      typeOptions: { password: true },
      required: true,
      default: '',
    },
  ];

  public authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        'X-API-Key': '={{$credentials.apiKey}}',
      },
    },
  };

  public test: ICredentialTestRequest = {
    request: {
      baseURL: 'https://api.jur.chat/v1/',
      url: 'usage/rate-limits',
    },
  };
}
