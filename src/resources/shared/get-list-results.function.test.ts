import { TestUtil } from '@devantage/n8n-custom-nodes-framework';

import { httpClient } from '../../utils';
import { getListResults } from './get-list-results.function';

describe('getListResults', (): void => {
  afterEach((): void => {
    jest.restoreAllMocks();
  });

  it('returns a single page limited by the configured limit', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({ returnAll: false, limit: 10 });
    const page: object = {
      data: [{ id: '1' }],
      pagination: { has_more: true, next_cursor: '1', limit: 10 },
    };
    const getSpy: jest.SpyInstance = jest
      .spyOn(httpClient, 'get')
      .mockResolvedValueOnce(page);

    await expect(
      getListResults.call(context as never, 0, 'contacts', {
        search: 'João',
        phone: '',
      }),
    ).resolves.toEqual(page);

    expect(getSpy).toHaveBeenCalledWith(context, 'contacts', {
      search: 'João',
      limit: 10,
    });
  });

  it('follows the cursor until every page is fetched', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({ returnAll: true });
    const getSpy: jest.SpyInstance = jest
      .spyOn(httpClient, 'get')
      .mockResolvedValueOnce({
        data: [{ id: '1' }],
        pagination: { has_more: true, next_cursor: 'cursor-1', limit: 100 },
      })
      .mockResolvedValueOnce({
        data: [{ id: '2' }],
        pagination: { has_more: false, next_cursor: null, limit: 100 },
      });

    await expect(
      getListResults.call(context as never, 0, 'contacts', {}, 100),
    ).resolves.toEqual({ data: [{ id: '1' }, { id: '2' }] });

    expect(getSpy).toHaveBeenNthCalledWith(1, context, 'contacts', {
      limit: 100,
    });
    expect(getSpy).toHaveBeenNthCalledWith(2, context, 'contacts', {
      limit: 100,
      cursor: 'cursor-1',
    });
  });

  it('stops when the response has no pagination metadata', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({ returnAll: true });

    jest.spyOn(httpClient, 'get').mockResolvedValueOnce({
      data: [{ id: '1' }],
    });

    await expect(
      getListResults.call(context as never, 0, 'drafts'),
    ).resolves.toEqual({ data: [{ id: '1' }] });
  });
});
