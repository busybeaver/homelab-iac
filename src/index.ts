import { getCloudflare } from './cloud/cloudflare';
import { getGithub } from './cloud/github';

export = async () => {
  const github = await getGithub();
  const cloudflare = await getCloudflare();

  return {
    github: github.resources,
    cloudflare: cloudflare.resources,
  };
};
