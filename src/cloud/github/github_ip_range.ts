import * as github from '@pulumi/github';
import * as pulumi from '@pulumi/pulumi';

export type IpRanges = Pick<github.GetIpRangesResult, 'actionsIpv4s' | 'pagesIpv4s' | 'id'>;
type GitHubIpRangesInput = pulumi.Inputs & { ipRanges: IpRanges; };

class GitHubIpRanges extends pulumi.CustomResource {
  public readonly ipRanges: pulumi.Output<IpRanges>; // needs to be of type Output

  constructor(name: string, props: GitHubIpRangesInput, opts: pulumi.ComponentResourceOptions = {}) {
    super('custom:github:ipRanges', name, {}, {
      ...opts,
      protect: true,
    }, true);

    this.ipRanges = pulumi.output(props.ipRanges);
  }

  static async get(name: string, opts?: pulumi.CustomResourceOptions): Promise<GitHubIpRanges> {
    const { actionsIpv4s, pagesIpv4s, id } = await github.getIpRanges();
    return new GitHubIpRanges(name, { ipRanges: { actionsIpv4s, pagesIpv4s, id } }, opts);
  }
}

export const getGitHubIpRanges = () => {
  return GitHubIpRanges.get('public');
};
