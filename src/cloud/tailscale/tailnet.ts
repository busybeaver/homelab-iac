import * as pulumi from '@pulumi/pulumi';
import { BaseComponentResource, type ChildResourcesFn, type TDataType } from '../../util/';

// a Tailnet is an instance/account on Tailscale (which hosts all configuration)
export class TailscaleTailnet<TData extends TDataType> extends BaseComponentResource<TData> {
  constructor(name: string, childResourcesFn: ChildResourcesFn<TData>, opts: pulumi.ComponentResourceOptions = {}) {
    super('tailscale:tailnet', name, childResourcesFn, opts);
  }
}
