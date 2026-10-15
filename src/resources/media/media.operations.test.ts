import { TestUtil } from '@devantage/n8n-custom-nodes-framework';
import type { INodeExecutionData } from 'n8n-workflow';

import { describeOperationCases, expectScopedProperties } from '../../testing';
import { httpClient } from '../../utils';
import { GetUploadUrlOperation } from './get-upload-url';
import { MediaResource } from './media.resource';
import { UploadOperation } from './upload';

describe('media operations', (): void => {
  afterEach((): void => {
    jest.restoreAllMocks();
  });

  describeOperationCases([
    {
      label: 'gets a presigned upload URL',
      operation: new GetUploadUrlOperation('media'),
      parameters: {
        fileName: 'video.mp4',
        mediaType: 'video',
        additionalFields: { content_type: 'video/mp4' },
      },
      method: 'post',
      response: { data: { upload_url: 'https://storage/put' } },
      expectedRequest: [
        'media/upload-url',
        {
          file_name: 'video.mp4',
          media_type: 'video',
          content_type: 'video/mp4',
        },
      ],
      expectedJson: { upload_url: 'https://storage/put' },
    },
  ]);

  it('uploads a binary file as base64', async (): Promise<void> => {
    const postSpy: jest.SpyInstance = jest
      .spyOn(httpClient, 'post')
      .mockResolvedValueOnce({ data: { media_url: 'https://cdn/doc.pdf' } });
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        binaryPropertyName: 'file',
        mediaType: 'document',
        uploadMethod: 'direct',
        options: {},
      });

    context.helpers.assertBinaryData.mockReturnValue(
      TestUtil.createBinaryData(),
    );

    const result: INodeExecutionData = await new UploadOperation(
      'media',
    ).execute.call(context as never, 2);

    expect(context.helpers.assertBinaryData).toHaveBeenCalledWith(2, 'file');
    expect(context.helpers.getBinaryDataBuffer).toHaveBeenCalledWith(2, 'file');
    expect(postSpy).toHaveBeenCalledWith(context, 'media/upload', {
      file_name: 'document.pdf',
      media_type: 'document',
      data: Buffer.from('test file').toString('base64'),
    });
    expect(result).toEqual({
      json: { media_url: 'https://cdn/doc.pdf' },
      pairedItem: 2,
    });
  });

  it('uploads a binary file through a presigned URL', async (): Promise<void> => {
    const postSpy: jest.SpyInstance = jest
      .spyOn(httpClient, 'post')
      .mockResolvedValueOnce({
        data: {
          upload_url: 'https://storage/put?signature=1',
          media_url: 'https://cdn/contrato.pdf',
          content_type: 'application/pdf',
          expires_in: 3600,
        },
      });
    const httpRequest: jest.Mock = jest.fn().mockResolvedValue(undefined);
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        binaryPropertyName: 'data',
        mediaType: 'document',
        uploadMethod: 'presigned',
        options: { file_name: 'contrato.pdf' },
      });

    context.helpers.assertBinaryData.mockReturnValue(
      TestUtil.createBinaryData(),
    );
    (context.helpers as Record<string, unknown>).httpRequest = httpRequest;

    const result: INodeExecutionData = await new UploadOperation(
      'media',
    ).execute.call(context as never, 0);

    expect(postSpy).toHaveBeenCalledWith(context, 'media/upload-url', {
      file_name: 'contrato.pdf',
      media_type: 'document',
      content_type: 'application/pdf',
    });
    expect(httpRequest).toHaveBeenCalledWith({
      method: 'PUT',
      url: 'https://storage/put?signature=1',
      body: Buffer.from('test file'),
      headers: { 'Content-Type': 'application/pdf' },
    });
    expect(result).toEqual({
      json: {
        media_url: 'https://cdn/contrato.pdf',
        media_type: 'document',
        content_type: 'application/pdf',
        file_size: 9,
        file_name: 'contrato.pdf',
      },
      pairedItem: 0,
    });
  });

  it('uses the content type override on presigned uploads', async (): Promise<void> => {
    const postSpy: jest.SpyInstance = jest
      .spyOn(httpClient, 'post')
      .mockResolvedValueOnce({
        data: {
          upload_url: 'https://storage/put',
          media_url: 'https://cdn/audio.ogg',
          content_type: 'audio/ogg',
          expires_in: 3600,
        },
      });
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        binaryPropertyName: 'data',
        mediaType: 'audio',
        uploadMethod: 'presigned',
        options: { content_type: 'audio/ogg' },
      });

    context.helpers.assertBinaryData.mockReturnValue(
      TestUtil.createBinaryData({ fileName: 'audio.ogg' }),
    );
    (context.helpers as Record<string, unknown>).httpRequest = jest
      .fn()
      .mockResolvedValue(undefined);

    await new UploadOperation('media').execute.call(context as never, 0);

    expect(postSpy).toHaveBeenCalledWith(context, 'media/upload-url', {
      file_name: 'audio.ogg',
      media_type: 'audio',
      content_type: 'audio/ogg',
    });
  });

  it('requires a file name', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        binaryPropertyName: 'data',
        mediaType: 'image',
        uploadMethod: 'direct',
        options: {},
      });

    context.helpers.assertBinaryData.mockReturnValue(
      TestUtil.createBinaryData({ fileName: undefined }),
    );

    await expect(
      new UploadOperation('media').execute.call(context as never, 0),
    ).rejects.toThrow(
      'The binary file has no name. Please set the "File Name" option.',
    );
  });

  it('registers every operation scoped to the resource', (): void => {
    const resource: MediaResource = new MediaResource();

    for (const name of ['upload', 'getUploadUrl']) {
      expectScopedProperties(resource.getOperation(name), 'media');
    }
  });
});
