import pulumi from '@pulumi/pulumi';
import { isCi } from '../util/stack';
import { getCloudflare } from './cloudflare';
import { getGithub } from './github';
import { getTailscale } from './tailscale';

export = async () => {
  const github = await getGithub();
  // to run and test cloudflare as part of CI/CD, we would need an additional (paid) CF account
  const cloudflare = !isCi() ? await getCloudflare() : { resources: [] as pulumi.Resource[] };
  const tailscale = await getTailscale();

  return {
    github: github.resources,
    cloudflare: cloudflare.resources,
    tailscale: tailscale.resources,
  };
};
