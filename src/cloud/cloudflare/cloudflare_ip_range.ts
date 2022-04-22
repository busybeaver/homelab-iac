import * as cloudflare from '@pulumi/cloudflare';
import * as pulumi from '@pulumi/pulumi';

export type IpRanges = Pick<cloudflare.GetIpRangesResult, 'id' | 'ipv4CidrBlocks'>;
type CloudflareIpRangesInput = pulumi.Inputs & { ipRanges: IpRanges; };

class CloudflareIpRanges extends pulumi.CustomResource {
  public readonly ipRanges: pulumi.Output<IpRanges>; // needs to be of type Output

  constructor(name: string, props: CloudflareIpRangesInput, opts: pulumi.ComponentResourceOptions = {}) {
    super('custom:cloudflare:ipRanges', name, {}, {
      ...opts,
      protect: true,
    }, true);

    this.ipRanges = pulumi.output(props.ipRanges);
  }

  static async get(name: string, opts?: pulumi.CustomResourceOptions): Promise<CloudflareIpRanges> {
    const { ipv4CidrBlocks, id } = await cloudflare.getIpRanges();
    return new CloudflareIpRanges(name, { ipRanges: { ipv4CidrBlocks, id } }, opts);
  }
}

export const getCloudflareIpRanges = () => {
  return CloudflareIpRanges.get('public');
};
