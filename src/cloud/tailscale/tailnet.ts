import * as pulumi from '@pulumi/pulumi';
import { ChildResourcesFn } from '../../util/types';

// a Tailnet is an instance/account on Tailscale (which hosts all configuration)
export class TailscaleTailnet extends pulumi.ComponentResource {
  constructor(name: string, childResourcesFn: ChildResourcesFn, opts: pulumi.ComponentResourceOptions = {}) {
    super('custom:tailscale:resource', name, {}, { ...opts, protect: true });

    this.registerOutputs(childResourcesFn(this));
  }
}
