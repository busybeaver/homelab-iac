import * as pulumi from '@pulumi/pulumi';
import { BaseComponentResource, type ChildResourcesFn, type TDataType } from '../../util/';

// a resource is usually a zone with all it's configuration
export class CloudflareSite<TData extends TDataType> extends BaseComponentResource<TData> {
  constructor(name: string, childResourcesFn: ChildResourcesFn<TData>, opts: pulumi.ComponentResourceOptions = {}) {
    super('cloudflare:site', name, childResourcesFn, opts);
  }
}
