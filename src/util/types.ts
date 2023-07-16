import * as pulumi from '@pulumi/pulumi';

export type TDataType = pulumi.Inputs | pulumi.Output<pulumi.Inputs> | undefined;

export type ChildResourcesFn<TData extends TDataType> = (
  parent: pulumi.Resource,
) => TData;

export type ComponentData = {
  resources: pulumi.Resource[];
};
