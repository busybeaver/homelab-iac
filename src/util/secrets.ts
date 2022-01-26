import * as pulumi from "@pulumi/pulumi";
import * as random from "@pulumi/random";
import { isCi } from './stack';

const config = new pulumi.Config();

export const requireSecretString = (key: string): pulumi.Output<string> => {
  if (isCi()) return new random.RandomPassword(key, {length: 32, special:false}).id;
  return config.requireSecret<string>(key);
}
