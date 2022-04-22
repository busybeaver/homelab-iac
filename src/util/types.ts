import * as pulumi from '@pulumi/pulumi';

export type ChildResourcesFn = (
  parent: pulumi.Resource,
) => pulumi.Inputs | Promise<pulumi.Inputs> | pulumi.Output<pulumi.Inputs> | undefined;

export type ComponentData = {
  resources: pulumi.Resource[];
};
