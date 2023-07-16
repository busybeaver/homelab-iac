import * as pulumi from '@pulumi/pulumi';
import { BaseComponentResource, type ChildResourcesFn, type TDataType } from '../../util/';

export const tags = {
  'managed_via': 'pulumi',
};

export const compartmentId = (() => {
  return (new pulumi.Config('oci')).requireSecret('tenancyOcid');
})();

export class OracleCloudInfrastructure<TData extends TDataType> extends BaseComponentResource<TData> {
  constructor(name: string, childResourcesFn: ChildResourcesFn<TData>, opts: pulumi.ComponentResourceOptions = {}) {
    super('oracle:cloud_infrastructure', name, childResourcesFn, opts);
  }
}
