import * as pulumi from '@pulumi/pulumi';
import { ComponentData } from '../../util/types';
import { getGitHubIpRanges, IpRanges } from './github_ip_range';
import { getHomelabIacRepository } from './repository_homelab_iac';

export interface GitHubData extends ComponentData {
  ipRanges: pulumi.Output<IpRanges>;
}

export const getGithub = async (): Promise<GitHubData> => {
  const gitHubIpRanges = await getGitHubIpRanges();

  return {
    ipRanges: gitHubIpRanges.ipRanges,
    resources: [
      await getHomelabIacRepository(),
      gitHubIpRanges,
    ],
  };
};
