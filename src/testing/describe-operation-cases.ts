import {
  type ResourceOperation,
  TestUtil,
} from '@devantage/n8n-custom-nodes-framework';
import type { INodeExecutionData } from 'n8n-workflow';

import { httpClient } from '../utils';

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export type OperationCase = {
  /** Test title */
  label: string;
  operation: ResourceOperation;
  /** Values returned by `getNodeParameter` */
  parameters: Record<string, unknown>;
  /** `httpClient` method expected to be called */
  method: HttpMethod;
  /** Value resolved by the mocked `httpClient` method */
  response: unknown;
  /** Arguments expected after the execution context (resource, query, ...) */
  expectedRequest: unknown[];
  /** Expected `json` of the returned item */
  expectedJson: unknown;
};

/**
 * Registers one test per case asserting the HTTP call performed by an
 * operation and the item it returns.
 */
export function describeOperationCases(cases: OperationCase[]): void {
  afterEach((): void => {
    jest.restoreAllMocks();
  });

  it.each<OperationCase>(cases)(
    '$label',
    async ({
      operation,
      parameters,
      method,
      response,
      expectedRequest,
      expectedJson,
    }: OperationCase): Promise<void> => {
      const requestSpy: jest.SpyInstance = jest
        .spyOn(httpClient, method)
        .mockResolvedValueOnce(response);
      const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
        TestUtil.createExecuteFunctionsMock(parameters);

      const result: INodeExecutionData = await operation.execute.call(
        context as never,
        3,
      );

      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(requestSpy).toHaveBeenCalledWith(context, ...expectedRequest);
      expect(result).toEqual({ json: expectedJson, pairedItem: 3 });
    },
  );
}

/**
 * Asserts that every property of an operation is scoped to its own
 * resource/operation pair.
 */
export function expectScopedProperties(
  operation: ResourceOperation,
  resource: string,
): void {
  for (const curProperty of operation.properties) {
    expect(curProperty.displayOptions?.show?.resource).toEqual([resource]);
    expect(curProperty.displayOptions?.show?.operation).toEqual([
      operation.name,
    ]);
  }
}
