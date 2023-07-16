import * as oci from '@pulumi/oci';
import * as pulumi from '@pulumi/pulumi';
import { ChildResourcesFn } from '../../util/types';
import { IpRanges } from '../cloudflare';
import { compartmentId, OracleCloudInfrastructure, tags } from './oci';

const childResourcesFn =
  ({ cloudflareIpRanges }: { cloudflareIpRanges: pulumi.Output<IpRanges>; }): ChildResourcesFn<PublicVcnData> =>
  parent => {
    // const defaultInternetGateway = new oci.core.InternetGateway('default-internet-gateway', {
    //   compartmentId,
    //   vcnId: servicesVcn.id,
    //   displayName: 'default-internet-gateway',
    //   freeformTags: tags,
    //   routeTableId: ,
    // });

    // the free-tier doesn't allow NAT gateways
    // const defaultNatGateway = new oci.core.NatGateway('default-nat-gateway', {
    //   compartmentId,
    //   vcnId: servicesVcn.id,
    //   displayName: 'default-nat-gateway',
    //   freeformTags: tags,
    //   routeTableId: /* TODO */,
    // });

    const servicesVcn = new oci.core.Vcn('public-vcn', {
      compartmentId,
      cidrBlocks: ['10.0.0.0/16'],
      displayName: 'public-vcn',
      dnsLabel: 'publicvcn',
      freeformTags: tags,
      isIpv6enabled: false,
    }, { parent });

    new oci.core.Subnet('public-subnet', {
      cidrBlock: '10.0.0.0/24',
      compartmentId,
      vcnId: servicesVcn.id,
      displayName: 'public-subnet',
      dnsLabel: 'public',
      freeformTags: tags,
      prohibitPublicIpOnVnic: false, // public subnet
    }, { parent });

    const cloudFlareIngressSecurityRules = cloudflareIpRanges
      .ipv4CidrBlocks.apply<oci.types.input.Core.SecurityListIngressSecurityRule[]>((cidrBlocks) => {
        return cidrBlocks.map((cidrBlock, index) => ({
          protocol: '6', // TCP
          source: cidrBlock,
          sourceType: 'CIDR_BLOCK',
          tcpOptions: {
            max: 443,
            min: 443,
          },
          stateless: true,
          description: `Allow Cloudflare Ingress HTTPS Traffic #${index}`,
        }));
      });

    new oci.core.SecurityList('default-security-list', {
      compartmentId,
      vcnId: servicesVcn.id,
      displayName: 'Default Security List for public-vcn',
      egressSecurityRules: [
        {
          protocol: '6', // TCP
          destination: '0.0.0.0/0',
          destinationType: 'CIDR_BLOCK',
          description: 'Allow Egress TCP Traffic',
          stateless: true,
        },
        {
          protocol: '17', // UDP
          destination: '0.0.0.0/0',
          destinationType: 'CIDR_BLOCK',
          description: 'Allow Egress UDP Traffic',
          stateless: true,
        },
      ],
      freeformTags: tags,
      ingressSecurityRules: cloudFlareIngressSecurityRules.apply(cloudFlareIngressRules => {
        return [
          // ICMP #1
          {
            icmpOptions: {
              code: 4,
              type: 3,
            },
            protocol: '1', // ICMP
            source: '0.0.0.0/0',
            sourceType: 'CIDR_BLOCK',
            description: 'Allow ICMP #1',
            stateless: false,
          },
          // ICMP #2
          {
            icmpOptions: {
              type: 3,
            },
            protocol: '1', // ICMP
            source: servicesVcn.cidrBlocks[0],
            sourceType: 'CIDR_BLOCK',
            description: 'Allow ICMP #2',
            stateless: false,
          },
          // SSH: remove SSH after tailscale properly works
          {
            protocol: '6', // TCP
            source: '0.0.0.0/0',
            sourceType: 'CIDR_BLOCK',
            tcpOptions: {
              max: 22,
              min: 22,
            },
            description: 'Allow SSH',
            stateless: false,
          },
          // Tailscale: https://tailscale.com/kb/1149/cloud-oracle/
          {
            protocol: '17', // UDP
            source: '0.0.0.0/0',
            sourceType: 'CIDR_BLOCK',
            udpOptions: {
              max: 41641,
              min: 41641,
            },
            description: 'Allow Tailscale IPv4 Direct Ingress Traffic',
            stateless: true,
          },
          // Cloudflare
          ...cloudFlareIngressRules,
        ];
      }),
    }, { parent });

    return {
      // expose some information if needed
    };
  };

export type PublicVcnData = {};

export const getPublicVcn = ({ cloudflareIpRanges }: { cloudflareIpRanges: pulumi.Output<IpRanges>; }) =>
  new OracleCloudInfrastructure('public_vcn', childResourcesFn({ cloudflareIpRanges }));
