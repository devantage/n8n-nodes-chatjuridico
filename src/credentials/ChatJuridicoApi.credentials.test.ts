import { ChatJuridicoApi } from './ChatJuridicoApi.credentials';

describe('ChatJuridicoApi', (): void => {
  it('exposes the expected credential metadata', (): void => {
    const credentialType: ChatJuridicoApi = new ChatJuridicoApi();

    expect(credentialType.name).toBe('chatJuridicoApi');
    expect(credentialType.displayName).toBe('ChatJuridico API');
    expect(
      credentialType.properties.map(
        ({ name }: { name: string }): string => name,
      ),
    ).toEqual(['apiKey']);
    expect(credentialType.properties[0].typeOptions).toEqual({
      password: true,
    });
  });

  it('authenticates requests with the X-API-Key header', (): void => {
    const credentialType: ChatJuridicoApi = new ChatJuridicoApi();

    expect(credentialType.authenticate).toEqual({
      type: 'generic',
      properties: {
        headers: {
          'X-API-Key': '={{$credentials.apiKey}}',
        },
      },
    });
  });

  it('tests the credential against an authenticated endpoint', (): void => {
    const credentialType: ChatJuridicoApi = new ChatJuridicoApi();

    expect(credentialType.test).toEqual({
      request: {
        baseURL: 'https://api.jur.chat/v1/',
        url: 'usage/rate-limits',
      },
    });
  });
});
