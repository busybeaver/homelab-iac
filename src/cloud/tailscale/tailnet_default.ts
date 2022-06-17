import * as pulumi from '@pulumi/pulumi';
import * as tailscale from '@pulumi/tailscale';
import { ChildResourcesFn } from '../../util/types';
import { TailscaleTailnet } from './tailnet';

const childResourcesFn: ChildResourcesFn = parent => {
  const default_nameservers = new tailscale.DnsNameservers('default-nameservers', {
    // cloudflare public DNS
    nameservers: [
      '1.1.1.1',
      '1.0.0.1',
      '2606:4700:4700::1111',
      '2606:4700:4700::1001',
    ],
  }, { parent });
  new tailscale.DnsPreferences('dns-preferences', {
    magicDns: true,
  }, {
    parent,
    // before we can enable magicDNS, a nameserver must be configured first
    dependsOn: [default_nameservers],
  });

  return {
    //  dnsSecStatus: zone_dnssec.status,
    //  originCaCertificate: originCaCertificate.certificate,
  };
};

export const getDefaultTailnet = () => new TailscaleTailnet('default', childResourcesFn);
