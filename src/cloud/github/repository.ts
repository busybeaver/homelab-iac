import * as pulumi from '@pulumi/pulumi';
import { BaseComponentResource, type ChildResourcesFn, type TDataType } from '../../util/';

export class GitHubRepository<TData extends TDataType> extends BaseComponentResource<TData> {
  constructor(name: string, childResourcesFn: ChildResourcesFn<TData>, opts: pulumi.ComponentResourceOptions = {}) {
    super('github:repository', name, childResourcesFn, opts);
  }
}

export type RepoData = {
  repositoryName: pulumi.Output<string>;
  defaultBranch: pulumi.Output<string>;
};
