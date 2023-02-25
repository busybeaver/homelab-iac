import * as pulumi from '@pulumi/pulumi';
import { ComponentData } from '../../util/types';
import { getDefaultTailnet } from './tailnet_default';
import { Devices, getTailnetDevices } from './tailnet_devices';

export interface TailscaleData extends ComponentData {
  devices: pulumi.Output<Devices>;
}

export const getTailscale = async (): Promise<TailscaleData> => {
  const tailnetDevices = await getTailnetDevices();

  return {
    devices: tailnetDevices.devices,
    resources: [
      getDefaultTailnet(),
      tailnetDevices,
    ],
  };
};
