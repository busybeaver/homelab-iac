import * as cloudinit from '@pulumi/cloudinit';
import * as pulumi from '@pulumi/pulumi';
import { ComponentData } from '../../util/types';
import { ubuntuConfig } from './ubuntu';

export interface CloudInitData extends ComponentData {
  ubuntuConfig: pulumi.Output<cloudinit.GetConfigResult>;
}

// deno-lint-ignore require-await
export const getCloudInit = async (): Promise<CloudInitData> => {
  return {
    ubuntuConfig,
    resources: [],
  };
};
