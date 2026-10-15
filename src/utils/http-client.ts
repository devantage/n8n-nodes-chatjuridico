import { HttpClient } from '@devantage/n8n-custom-nodes-framework';
import type { IDataObject, IN8nHttpFullResponse } from 'n8n-workflow';

export type HttpResponse<D> = Omit<IN8nHttpFullResponse, 'body'> & {
  body: D;
};

export const CHATJURIDICO_CREDENTIAL_TYPE: string = 'chatJuridicoApi';

export type Pagination = {
  has_more: boolean;
  next_cursor: string | null;
  limit: number;
};

/**
 * Every ChatJuridico response wraps its payload in a `data` envelope.
 */
export type ApiResponse<D = IDataObject> = {
  data: D;
};

export type ApiListResponse<D = IDataObject> = ApiResponse<D[]> & {
  pagination?: Pagination;
};

export const httpClient: HttpClient = new HttpClient({
  baseURL: 'https://api.jur.chat/v1/',
  credentialType: CHATJURIDICO_CREDENTIAL_TYPE,
});
