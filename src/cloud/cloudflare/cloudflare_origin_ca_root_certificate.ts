import * as cloudflare from '@pulumi/cloudflare';
import * as pulumi from '@pulumi/pulumi';

export type OriginCaRootCertificate = Pick<cloudflare.GetOriginCaRootCertificateResult, 'certPem' | 'id'>;
type CloudflareOriginCaRootCertificateInput = pulumi.Inputs & { originCaRootCertificate: OriginCaRootCertificate; };

class CloudflareOriginCaRootCertificate extends pulumi.CustomResource {
  public readonly originCaRootCertificate: pulumi.Output<OriginCaRootCertificate>; // needs to be of type Output

  constructor(name: string, props: CloudflareOriginCaRootCertificateInput, opts: pulumi.ComponentResourceOptions = {}) {
    super('custom:cloudflare:originCaRootCertificate', name, {}, {
      ...opts,
      protect: true,
    }, true);

    this.originCaRootCertificate = pulumi.secret(props.originCaRootCertificate);
  }

  static async get(name: string, opts?: pulumi.CustomResourceOptions): Promise<CloudflareOriginCaRootCertificate> {
    const { certPem, id } = await cloudflare.getOriginCaRootCertificate({ algorithm: 'rsa' });
    return new CloudflareOriginCaRootCertificate(name, { originCaRootCertificate: { certPem, id } }, opts);
  }
}

export const getCloudflareOriginCaRootCertificate = () => {
  return CloudflareOriginCaRootCertificate.get('default');
};
