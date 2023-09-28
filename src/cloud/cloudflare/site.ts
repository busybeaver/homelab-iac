import * as pulumi from '@pulumi/pulumi';
import { BaseComponentResource, type ChildResourcesFn, type TDataType } from '../../util/';
import type { AccountData } from './account';

// usually a zone with all it's configuration
export class CloudflareSite<TData extends SiteData> extends BaseComponentResource<TData> {
  constructor(
    name: string,
    childResourcesFn: ChildResourcesFn<TData>,
    opts: pulumi.ComponentResourceOptions & Required<Pick<pulumi.ComponentResourceOptions, 'parent'>>,
  ) {
    super('cloudflare:site', name, childResourcesFn, { ...opts });
  }
}

export type SiteData = TDataType & {
  zoneId: pulumi.Output<string>;
  zoneName: pulumi.Output<string>;
};

export type SitesFn<SitesTData extends SiteData> = (this: unknown, { accountData, parentAccount }: {
  accountData: AccountData;
  parentAccount: pulumi.Resource;
}) => CloudflareSite<SitesTData>;
