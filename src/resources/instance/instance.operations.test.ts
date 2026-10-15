import { describeOperationCases, expectScopedProperties } from '../../testing';
import { httpClient } from '../../utils';
import { GetOperation } from './get';
import { GetQrCodeOperation } from './get-qr-code';
import { GetStatusOperation } from './get-status';
import { InstanceResource } from './instance.resource';
import { ListOperation } from './list';
import { ReconnectOperation } from './reconnect';
import { getInstanceOptions } from './shared';

describe('instance operations', (): void => {
  describeOperationCases([
    {
      label: 'lists WhatsApp numbers',
      operation: new ListOperation('instance'),
      parameters: {},
      method: 'get',
      response: { data: [{ id: 'instance-1' }] },
      expectedRequest: ['instances'],
      expectedJson: { data: [{ id: 'instance-1' }] },
    },
    {
      label: 'gets a WhatsApp number',
      operation: new GetOperation('instance'),
      parameters: { instanceId: 'instance-1' },
      method: 'get',
      response: { data: { id: 'instance-1' } },
      expectedRequest: ['instances/instance-1'],
      expectedJson: { id: 'instance-1' },
    },
    {
      label: 'gets the connection status',
      operation: new GetStatusOperation('instance'),
      parameters: { instanceId: 'instance-1' },
      method: 'get',
      response: { data: { is_connected: true } },
      expectedRequest: ['instances/instance-1/status'],
      expectedJson: { is_connected: true },
    },
    {
      label: 'gets the QR code',
      operation: new GetQrCodeOperation('instance'),
      parameters: { instanceId: 'instance-1' },
      method: 'get',
      response: { data: { qr_code: 'base64' } },
      expectedRequest: ['instances/instance-1/qr-code'],
      expectedJson: { qr_code: 'base64' },
    },
    {
      label: 'reconnects a WhatsApp number',
      operation: new ReconnectOperation('instance'),
      parameters: { instanceId: 'instance-1' },
      method: 'post',
      response: { data: { status: 'reconnecting' } },
      expectedRequest: ['instances/instance-1/reconnect'],
      expectedJson: { status: 'reconnecting' },
    },
  ]);

  it('registers every operation scoped to the resource', (): void => {
    const resource: InstanceResource = new InstanceResource();

    for (const name of ['list', 'get', 'getStatus', 'getQrCode', 'reconnect']) {
      expectScopedProperties(resource.getOperation(name), 'instance');
    }
  });

  it('loads the WhatsApp number options', async (): Promise<void> => {
    jest.spyOn(httpClient, 'get').mockResolvedValueOnce({
      data: [
        { id: '1', name: 'Main', display_phone_number: '+55 11 9999-8888' },
        { id: '2', name: null, display_phone_number: '+55 21 9999-7777' },
        { id: '3', name: 'Sales', display_phone_number: null },
        { id: '4', name: null, display_phone_number: null },
      ],
    });

    await expect(getInstanceOptions.call({} as never)).resolves.toEqual([
      { name: 'Main (+55 11 9999-8888)', value: '1' },
      { name: 'WhatsApp (+55 21 9999-7777)', value: '2' },
      { name: 'Sales', value: '3' },
      { name: '4', value: '4' },
    ]);
  });
});
