import * as pulumi from '@pulumi/pulumi';
import { BaseComponentResource, type ChildResourcesFn, type TDataType } from '../../util';
import type { CloudflareSite, SiteData, SitesFn } from './site';

export class CloudflareAccount<
  TData extends AccountData,
  Sites extends SitesFn<SitesTData>[],
  SitesTData extends SiteData,
> extends BaseComponentResource<TData> {
  public readonly siteData: CloudflareSite<SitesTData>[];

  constructor(
    name: string,
    childResourcesFn: ChildResourcesFn<TData>,
    sites: readonly [...Sites],
    opts: pulumi.ComponentResourceOptions = {},
  ) {
    super('cloudflare:account', name, childResourcesFn, opts);

    this.siteData = sites.map(siteFn => siteFn({ accountData: this.childData, parentAccount: this }));
  }
}

export type AccountData = TDataType & {
  accountId: pulumi.Output<string>;
};
