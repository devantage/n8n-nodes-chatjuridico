import { TestUtil } from '@devantage/n8n-custom-nodes-framework';
import { NodeOperationError } from 'n8n-workflow';

import { parseJson } from './parse-json.function';

describe('parseJson', (): void => {
  const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
    TestUtil.createExecuteFunctionsMock();

  it('parses JSON strings', (): void => {
    expect(parseJson.call(context as never, '{"a":1}', 'Field', 0)).toEqual({
      a: 1,
    });
  });

  it('returns already parsed values untouched', (): void => {
    expect(parseJson.call(context as never, [1, 2], 'Field', 0)).toEqual([
      1, 2,
    ]);
  });

  it('throws a node error for invalid JSON', (): void => {
    expect((): unknown =>
      parseJson.call(context as never, '{invalid', 'Field', 0),
    ).toThrow(NodeOperationError);
  });
});
