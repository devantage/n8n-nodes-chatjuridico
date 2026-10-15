import {
  ExecuteFunctionsMock,
  TestUtil,
} from '@devantage/n8n-custom-nodes-framework';
import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
  INodePropertyCollection,
  INodePropertyOptions,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { resourceRegistry } from '../resources';
import { ChatJuridico } from './ChatJuridico.node';

type NestedProperty = INodeProperties | INodePropertyCollection;

function mockOperation(execute: jest.Mock<Promise<unknown>, [number]>): void {
  jest.spyOn(resourceRegistry, 'getResource').mockReturnValue({
    getOperation: jest.fn().mockReturnValue({ execute }),
  } as never);
}

function collectLoadOptionsMethods(properties: NestedProperty[]): string[] {
  return properties.flatMap((curProperty: NestedProperty): string[] => {
    const methods: string[] = [];

    if ('typeOptions' in curProperty) {
      const method: unknown = curProperty.typeOptions?.loadOptionsMethod;

      if (typeof method === 'string') {
        methods.push(method);
      }
    }

    const nested: unknown = 'options' in curProperty ? curProperty.options : [];

    if (Array.isArray(nested)) {
      methods.push(
        ...collectLoadOptionsMethods(
          (nested as Array<NestedProperty | INodePropertyOptions>).filter(
            (curOption: NestedProperty | INodePropertyOptions): boolean =>
              'displayName' in curOption || 'values' in curOption,
          ) as NestedProperty[],
        ),
      );
    }

    if ('values' in curProperty) {
      methods.push(...collectLoadOptionsMethods(curProperty.values));
    }

    return methods;
  });
}

describe('ChatJuridico node', (): void => {
  afterEach((): void => {
    jest.restoreAllMocks();
  });

  it('describes the node with the registry properties and the credential', (): void => {
    const node: ChatJuridico = new ChatJuridico();

    expect(node.description.name).toBe('chatJuridico');
    expect(node.description.credentials).toEqual([
      {
        name: 'chatJuridicoApi',
        required: true,
      },
    ]);
    expect(node.description.properties[0].name).toBe('resource');
    expect(node.description.properties[0].options).toHaveLength(30);
  });

  it('lists the resources alphabetically', (): void => {
    const node: ChatJuridico = new ChatJuridico();
    const names: string[] = (
      node.description.properties[0].options as INodePropertyOptions[]
    ).map(({ name }: INodePropertyOptions): string => name);

    expect(names).toEqual(
      [...names].sort((a: string, b: string): number =>
        a.toLowerCase().localeCompare(b.toLowerCase()),
      ),
    );
  });

  it('registers every load options method referenced by the properties', (): void => {
    const node: ChatJuridico = new ChatJuridico();
    const referenced: Set<string> = new Set(
      collectLoadOptionsMethods(node.description.properties),
    );

    expect(referenced.size).toBeGreaterThan(0);

    for (const curMethod of referenced) {
      expect(node.methods?.loadOptions?.[curMethod]).toBeInstanceOf(Function);
    }
  });

  it('scopes every operation property to a resource and operation', (): void => {
    const node: ChatJuridico = new ChatJuridico();

    for (const curProperty of node.description.properties.slice(1)) {
      expect(curProperty.displayOptions?.show?.resource).toHaveLength(1);

      if (curProperty.name !== 'operation') {
        expect(curProperty.displayOptions?.show?.operation).toHaveLength(1);
      }
    }
  });

  it('executes the selected resource operation for every item', async (): Promise<void> => {
    const context: ExecuteFunctionsMock = TestUtil.createExecuteFunctionsMock({
      resource: 'contact',
      operation: 'list',
    });
    const executeMock: jest.Mock<Promise<unknown>, [number]> = jest
      .fn<Promise<unknown>, [number]>()
      .mockResolvedValue({ json: { ok: true } });

    mockOperation(executeMock);

    const node: ChatJuridico = new ChatJuridico();
    const result: INodeExecutionData[][] = await TestUtil.executeNode(
      node,
      context as unknown as IExecuteFunctions,
    );

    expect(result).toEqual([[{ json: { ok: true } }]]);
    expect(executeMock).toHaveBeenCalledWith(0);
  });

  it('throws when the resource is missing', async (): Promise<void> => {
    const context: ExecuteFunctionsMock = TestUtil.createExecuteFunctionsMock({
      operation: 'list',
    });

    await expect(
      TestUtil.executeNode(
        new ChatJuridico(),
        context as unknown as IExecuteFunctions,
      ),
    ).rejects.toThrow(NodeOperationError);
  });

  it('returns item errors instead of throwing when continueOnFail is enabled', async (): Promise<void> => {
    const context: ExecuteFunctionsMock = TestUtil.createExecuteFunctionsMock({
      resource: 'contact',
      operation: 'list',
    });
    const operationError: NodeOperationError = new NodeOperationError(
      context.getNode(),
      'operation failed',
      { itemIndex: 0 },
    );

    context.continueOnFail.mockReturnValue(true);

    mockOperation(
      jest.fn<Promise<unknown>, [number]>().mockRejectedValue(operationError),
    );

    const result: INodeExecutionData[][] = await TestUtil.executeNode(
      new ChatJuridico(),
      context as unknown as IExecuteFunctions,
    );

    expect(result).toEqual([
      [{ error: operationError, json: {}, pairedItem: 0 }],
    ]);
  });
});
