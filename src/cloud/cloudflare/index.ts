import * as pulumi from '@pulumi/pulumi';
import { ComponentData } from '../../util/types';
import { CloudflareDefaultApiTokens } from './account_default';
import { getCloudflareIpRanges, IpRanges } from './cloudflare_ip_range';
import { getCloudflareOriginCaRootCertificate, OriginCaRootCertificate } from './cloudflare_origin_ca_root_certificate';
import { getDefaultDomainSite } from './site_default_domain';
export { IpRanges } from './cloudflare_ip_range';

export interface CloudflareData extends ComponentData {
  ipRanges: pulumi.Output<IpRanges>;
  originCaRootCertificate: pulumi.Output<OriginCaRootCertificate>;
  apiTokens: CloudflareDefaultApiTokens;
}

export const getCloudflare = async (): Promise<CloudflareData> => {
  const cloudFlareIpRanges = await getCloudflareIpRanges();
  const cloudflareOriginCaRootCertificate = await getCloudflareOriginCaRootCertificate();
  const defaultDomainSite = getDefaultDomainSite();

  return {
    ipRanges: cloudFlareIpRanges.ipRanges,
    originCaRootCertificate: cloudflareOriginCaRootCertificate.originCaRootCertificate,
    apiTokens: defaultDomainSite.childData.apiTokens,
    resources: [
      defaultDomainSite,
      cloudFlareIpRanges,
      cloudflareOriginCaRootCertificate,
    ],
  };
};
