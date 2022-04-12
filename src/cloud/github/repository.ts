import * as pulumi from '@pulumi/pulumi';

export type ChildResourcesFn = (
  parent: pulumi.Resource,
) => pulumi.Inputs | Promise<pulumi.Inputs> | pulumi.Output<pulumi.Inputs> | undefined;

export class GitHubRepository extends pulumi.ComponentResource {
  constructor(name: string, childResourcesFn: ChildResourcesFn, opts: pulumi.ComponentResourceOptions = {}) {
    super('custom:github:repository', name, {}, { ...opts, protect: true });

    this.registerOutputs(childResourcesFn(this));
  }
}
