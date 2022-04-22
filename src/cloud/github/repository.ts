import * as pulumi from '@pulumi/pulumi';
import { ChildResourcesFn } from '../../util/types';

export class GitHubRepository extends pulumi.ComponentResource {
  constructor(name: string, childResourcesFn: ChildResourcesFn, opts: pulumi.ComponentResourceOptions = {}) {
    super('custom:github:repository', name, {}, { ...opts, protect: true });

    this.registerOutputs(childResourcesFn(this));
  }
}
