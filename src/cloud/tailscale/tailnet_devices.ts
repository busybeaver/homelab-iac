import * as pulumi from '@pulumi/pulumi';
import * as tailscale from '@pulumi/tailscale';

type InputDevices = Pick<tailscale.GetDevicesResult, 'id' | 'devices'>;
export type Devices = {
  id: InputDevices['id'];
  machines: InputDevices['devices'];
};
type TailnetDevicesInput = pulumi.Inputs & InputDevices;

class TailnetDevices extends pulumi.CustomResource {
  public readonly devices: pulumi.Output<Devices>; // needs to be of type Output

  constructor(name: string, { devices, id }: TailnetDevicesInput, opts: pulumi.ComponentResourceOptions = {}) {
    super('custom:tailscale:devices', name, {}, {
      ...opts,
      protect: true,
    }, true);

    // don't expose sensitive properties
    this.devices = pulumi.output({
      id,
      machines: devices.map(device => {
        return {
          addresses: pulumi.secret(device.addresses),
          id: pulumi.secret(device.id),
          name: device.name,
          user: pulumi.secret(device.user),
          tags: device.tags,
        };
      }),
    });
  }

  static async get(name: string, opts?: pulumi.CustomResourceOptions): Promise<TailnetDevices> {
    const { devices, id } = await tailscale.getDevices();
    return new TailnetDevices(name, { devices, id }, opts);
  }
}

export const getTailnetDevices = () => {
  return TailnetDevices.get('public');
};
