import * as pulumi from '@pulumi/pulumi';
import type { ChildResourcesFn, TDataType } from './types';

export abstract class BaseComponentResource<TData extends TDataType> extends pulumi.ComponentResource<TData> {
  public readonly childData: Readonly<TData>;

  constructor(
    type: string,
    name: string,
    childResourcesFn: ChildResourcesFn<TData>,
    opts: pulumi.ComponentResourceOptions = {},
  ) {
    super(`custom:${type}`, name, {}, { ...opts, protect: true });

    const data = childResourcesFn(this, name);
    this.registerOutputs(data);
    this.childData = data ? Object.freeze(data) : data;
  }
}
