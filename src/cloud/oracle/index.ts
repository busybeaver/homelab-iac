import * as pulumi from '@pulumi/pulumi';
import { ComponentData } from '../../util/types';
import { IpRanges } from '../cloudflare';
import { getPublicVcn } from './public_vcn';

export interface OracleCloudData extends ComponentData {
  // foobar: pulumi.Output<...>;
}

export const getOracleCloud = async (
  { cloudflareIpRanges }: { cloudflareIpRanges: pulumi.Output<IpRanges>; },
): Promise<OracleCloudData> => {
  return {
    resources: [
      getPublicVcn({ cloudflareIpRanges }),
    ],
  };
};
