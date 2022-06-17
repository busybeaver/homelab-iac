import { getCloudflare } from './cloud/cloudflare';
import { getGithub } from './cloud/github';
import { getTailscale } from './cloud/tailscale';

export = async () => {
  const github = await getGithub();
  const cloudflare = await getCloudflare();
  const tailscale = await getTailscale();

  return {
    github: github.resources,
    cloudflare: cloudflare.resources,
    tailscale: tailscale.resources,
  };
};
