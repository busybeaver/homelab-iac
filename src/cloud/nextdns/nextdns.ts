import * as pulumi from '@pulumi/pulumi';
import { BaseComponentResource, type ChildResourcesFn, type TDataType } from '../../util';

export class NextDnsConfiguration<TData extends TDataType> extends BaseComponentResource<TData> {
  constructor(name: string, childResourcesFn: ChildResourcesFn<TData>, opts: pulumi.ComponentResourceOptions = {}) {
    super('nextdns:configuration', name, childResourcesFn, opts);
  }
}
