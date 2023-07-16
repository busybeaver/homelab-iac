import pulumi from '@pulumi/pulumi';
import { isProduction } from '../util/stack';
import { getCloudInit } from './cloud-init';
import { type CloudflareApiTokens, getCloudflare, IpRanges } from './cloudflare';
import { getGithub } from './github';
import { getOracleCloud } from './oracle';
import { getTailscale } from './tailscale';

export = async () => {
  // to run and test cloudflare as part of CI/CD, we would need an additional (paid) CF account
  const cloudflare = isProduction()
    ? await getCloudflare()
    : {
      resources: [] as pulumi.Resource[],
      ipRanges: pulumi.output({ id: 'dummy', ipv4CidrBlocks: [] }) as pulumi.Output<IpRanges>,
      apiTokens: pulumi.output({ githubActionsHomelabAdblock: '' }) as CloudflareApiTokens,
    };
  const tailscale = await getTailscale();
  const cloudInit = await getCloudInit();
  const github = await getGithub({ cloudflareApiTokens: cloudflare.apiTokens });

  return {
    cloudInit: cloudInit.resources,
    github: github.resources,
    cloudflare: cloudflare.resources,
    tailscale: tailscale.resources,
  };
};
