import * as pulumi from '@pulumi/pulumi';
import type { createName } from './utilities';

export type TDataType = pulumi.Inputs | pulumi.Output<pulumi.Inputs> | undefined;

export type ChildResourcesFn<TData extends TDataType> = (
  this: unknown,
  parent: pulumi.Resource,
  options: { postfix: string; createName: ReturnType<typeof createName>; },
) => TData;

export type ComponentData = {
  resources: pulumi.Resource[];
};
