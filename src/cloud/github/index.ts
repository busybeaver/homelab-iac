import * as pulumi from '@pulumi/pulumi';
import { ComponentData } from '../../util/types';
import type { CloudflareApiTokens } from '../cloudflare';
import { getGitHubIpRanges, IpRanges } from './github_ip_range';
import { getHomelabAdblockRepository } from './repository_homelab_adblock';
import { getHomelabIacRepository } from './repository_homelab_iac';

export interface GitHubData extends ComponentData {
  ipRanges: pulumi.Output<IpRanges>;
}

export const getGithub = async (
  { cloudflareApiTokens }: { cloudflareApiTokens: CloudflareApiTokens; },
): Promise<GitHubData> => {
  const gitHubIpRanges = await getGitHubIpRanges();

  return {
    ipRanges: gitHubIpRanges.ipRanges,
    resources: [
      getHomelabIacRepository(),
      getHomelabAdblockRepository({ cloudflareApiTokens }),
      gitHubIpRanges,
    ],
  };
};
