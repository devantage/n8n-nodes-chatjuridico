import type { SendRequestOptions } from '@devantage/n8n-custom-nodes-framework';

/**
 * Builds the request options that send the `X-Idempotency-Key` header, which
 * makes the API return the original response when a mutation is retried.
 */
export function getIdempotencyOptions(
  idempotencyKey: string | undefined,
): SendRequestOptions | undefined {
  if (!idempotencyKey) {
    return undefined;
  }

  return {
    headers: {
      'X-Idempotency-Key': idempotencyKey,
    },
  };
}
