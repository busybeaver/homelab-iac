import * as pulumi from '@pulumi/pulumi';
import { ChildResourcesFn } from '../../util/types';

// a resource is usually a zone with all it's configuration
export class CloudflareSite extends pulumi.ComponentResource {
  constructor(name: string, childResourcesFn: ChildResourcesFn, opts: pulumi.ComponentResourceOptions = {}) {
    super('custom:cloudflare:site', name, {}, { ...opts, protect: true });

    this.registerOutputs(childResourcesFn(this));
  }
}
