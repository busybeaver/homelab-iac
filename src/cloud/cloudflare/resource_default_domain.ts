import * as cloudflare from '@pulumi/cloudflare';
import * as command from '@pulumi/command';
import * as pulumi from '@pulumi/pulumi';
import * as tls from '@pulumi/tls';
import { join } from 'node:path';
import { requireSecretString } from '../../util/secrets';
import { isProduction } from '../../util/stack';
import { ChildResourcesFn } from '../../util/types';
import { CloudflareResource } from './resource';

const tlsKeyOptions: tls.PrivateKeyArgs = { algorithm: 'RSA', rsaBits: 8096 };

const childResourcesFn: ChildResourcesFn = parent => {
  // -------------------------------------------
  // account configuration
  // -------------------------------------------

  const zone = new cloudflare.Zone('zone', {
    plan: 'free',
    zone: requireSecretString('default_domain', true),
  }, {
    parent,
    protect: true,
  });

  new cloudflare.ZoneSettingsOverride('zone-settings-override', {
    zoneId: zone.id,
    settings: {
      // gRPC: "off"
      // Bot Fight Mode: "on"
      // Certificate Transparency Monitoring: "on"
      // Onion Routing: true
      // SSL/TLS Recommender: "on"
      alwaysOnline: 'on',
      alwaysUseHttps: 'on',
      automaticHttpsRewrites: 'on',
      brotli: 'on',
      browserCacheTtl: 14400, // min
      browserCheck: 'on',
      cacheLevel: 'aggressive', // delivers a different resource each time the query string changes
      challengeTtl: 1800, // min
      cnameFlattening: 'flatten_at_root',
      developmentMode: 'off',
      earlyHints: 'on',
      emailObfuscation: 'on',
      h2Prioritization: 'off', // requires subscription
      hotlinkProtection: 'on',
      http2: 'on', // read-only set to "on"
      http3: 'on',
      imageResizing: 'off', // requires subscription
      ipGeolocation: 'on',
      ipv6: 'on',
      maxUpload: 100, // MB
      minTlsVersion: '1.3',
      minify: {
        css: 'on',
        html: 'on',
        js: 'on',
      },
      mirage: 'off', // requires subscription
      // mobileRedirect: {}, // not used/required
      originErrorPagePassThru: 'off', // read-only set to "off"
      opportunisticEncryption: 'on',
      opportunisticOnion: 'on',
      polish: 'off', // requires subscription
      prefetchPreload: 'off', // requires subscription
      privacyPass: 'on',
      pseudoIpv4: 'off',
      responseBuffering: 'off', // read-only set to "off"
      rocketLoader: 'off', // TODO: enable?
      securityHeader: {
        enabled: true,
        includeSubdomains: true,
        maxAge: 60 * 60 * 24 * 30 * 6, // seconds
        nosniff: true,
        preload: true,
      },
      // https://support.cloudflare.com/hc/en-us/articles/200170056-What-does-Cloudflare-s-Security-Level-mean-
      securityLevel: 'medium',
      serverSideExclude: 'on',
      sortQueryStringForCache: 'off', // requires subscription
      // https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes
      ssl: 'strict', // "origin_pull" requires subscription
      // tls13: 'on',
      tlsClientAuth: 'on',
      trueClientIpHeader: 'off', // requires subscription
      universalSsl: 'on',
      waf: 'off', // requires subscription
      // webp: "on", // requires subscription; read-only
      websockets: 'off',
      zeroRtt: 'off', // https://news.ycombinator.com/item?id=16667036
    },
  }, { parent, protect: true });

  // -------------------------------------------
  // dnssec
  // -------------------------------------------

  const zone_dnssec = new cloudflare.ZoneDnssec('zone-dnssec', { zoneId: zone.id }, { parent, protect: true });

  // -------------------------------------------
  // Origin Certificates: SSL certificate for the origin/backend server (to encrypt the traffic between cloudflare and the backend);
  // These are only valid for traffic between Cloudflare and the origin/backend server (aka not trusted by browsers)
  // https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/
  // -------------------------------------------

  const backendPrivateKey = new tls.PrivateKey('origin-private-key', tlsKeyOptions, { parent });
  const originCertRequest = new tls.CertRequest('origin-cert-request', {
    privateKeyPem: backendPrivateKey.privateKeyPem,
    subjects: [{ commonName: 'Backend', organization: 'Backend' }],
  }, { parent, protect: false /* defaults to true which prevents recreation */ });
  const originCaCertificate = new cloudflare.OriginCaCertificate('origin-ca-certificate', {
    csr: originCertRequest.certRequestPem,
    hostnames: [
      zone.zone,
      pulumi.interpolate`*.${zone.zone}`,
    ],
    requestType: 'origin-rsa',
    requestedValidity: 365 * 2, // days
  }, { parent, protect: false /* defaults to true which prevents recreation */ });

  if (isProduction()) {
    // TODO: as soon as we automated the server creation/provisioning, we don't need to expose the data to files and provide directly to the configuration
    const folder = join('data', 'cloudflare');
    const key = join(folder, 'origin.key');
    const cert = join(folder, 'origin.cert');
    new command.local.Command("export-origin-key", {
      create: pulumi.interpolate`echo "${backendPrivateKey.privateKeyPem}" > ${key}`,
      delete: `rm ${key}`,
    }, { deleteBeforeReplace: true });
    new command.local.Command("export-origin-cert", {
      create: pulumi.interpolate`echo "${originCaCertificate.certificate}" > ${cert}`,
      delete: `rm ${cert}`,
    }, { deleteBeforeReplace: true });
  }

  // -------------------------------------------
  // authenticated origin pulls (aka mTLS between Cloudflare and the backend/upstream servers: client certs hosted on cloudflare, CA certs on local servers)
  // https://developers.cloudflare.com/ssl/origin-configuration/authenticated-origin-pull
  // -------------------------------------------

  const backendCaKey = new tls.PrivateKey('backend-authenticated-pulls-key', tlsKeyOptions, { parent });
  const backendCaCert = new tls.SelfSignedCert('backend-authenticated-pulls-ca-cert', {
    privateKeyPem: backendCaKey.privateKeyPem,
    isCaCertificate: true,
    subjects: [{ commonName: 'Backend CA', organization: 'Backend' }],
    validityPeriodHours: 24 * 360 * 4,
    earlyRenewalHours: 24 * 180,
    allowedUses: [
      'digital_signature',
      'cert_signing',
      'crl_signing',
    ],
  }, { parent, protect: false /* defaults to true which prevents recreation */ });
  const cloudflareKey = new tls.PrivateKey('cloudflare-authenticated-pulls-key', tlsKeyOptions, { parent });
  const cloudflareCertRequest = new tls.CertRequest('cloudflare-authenticated-pulls-cert-request', {
    privateKeyPem: cloudflareKey.privateKeyPem,
    subjects: [{
      commonName: pulumi.interpolate`Cloudflare ${zone.zone}`,
      organization: 'Cloudflare',
    }],
  }, { parent, protect: false /* defaults to true which prevents recreation */ });
  const cloudflareLocallySignedCert = new tls.LocallySignedCert('cloudflare-authenticated-pulls-cert', {
    certRequestPem: cloudflareCertRequest.certRequestPem,
    caCertPem: backendCaCert.certPem,
    caPrivateKeyPem: backendCaKey.privateKeyPem,
    validityPeriodHours: 24 * 360 * 2,
    earlyRenewalHours: 24 * 180,
    allowedUses: [
      'digital_signature',
      'key_encipherment',
      'key_agreement',
      'client_auth',
    ],
  }, { parent, protect: false /* defaults to true which prevents recreation */ });
  // TODO: fix me:
  // const authenticatedOriginPullsCertificate = new cloudflare.AuthenticatedOriginPullsCertificate(
  //   'authenticated-origin-pulls-cert',
  //   {
  //     zoneId: zone.id,
  //     certificate: cloudflareLocallySignedCert.certPem,
  //     //certificate: cloudflareCertRequest.certRequestPem,
  //     privateKey: cloudflareKey.privateKeyPem,
  //     type: 'per-zone',
  //   },
  //   { parent, protect: false /* defaults to true which prevents recreation */ },
  // );
  // new cloudflare.AuthenticatedOriginPulls('authenticated-origin-pulls', {
  //   zoneId: zone.id,
  //   authenticatedOriginPullsCertificate: authenticatedOriginPullsCertificate.id,
  //   enabled: true,
  // }, { parent, protect: false });

  // -------------------------------------------
  // client (mtls) certificates
  // -------------------------------------------

  // TODO: add me
  // afterwards add rules to enforce client-certs

  // -------------------------------------------
  // firewall rules (up to 5 allowed)
  // -------------------------------------------

  const blockIncomingRequestsFilter = new cloudflare.Filter('block-incoming-requests', {
    zoneId: zone.id,
    description: 'Block known bots (such as crawlers); blocks requests from specific countries and Tor',
    expression:
      '(cf.client.bot) or (ip.geoip.country eq "RU") or (ip.geoip.country eq "T1") or (ip.geoip.country eq "CN")',
  });
  new cloudflare.FirewallRule('block-incoming-requests', {
    zoneId: zone.id,
    description: blockIncomingRequestsFilter.description as pulumi.Output<string>,
    filterId: blockIncomingRequestsFilter.id,
    action: 'block',
  });

  // TODO: add some more
  // https://www.pulumi.com/registry/packages/cloudflare/api-docs/firewallrule/

  // -------------------------------------------
  // access/IP rules
  // -------------------------------------------

  // TODO: https://www.pulumi.com/registry/packages/cloudflare/api-docs/accessrule/

  // -------------------------------------------
  // Page rules (up to 3 allowed)
  // -------------------------------------------

  // TODO: https://www.pulumi.com/registry/packages/cloudflare/api-docs/pagerule/

  // -------------------------------------------
  // (managed) rulesets and transform rules (up to 10 allowed):
  // -------------------------------------------

  // TODO (as soon as available for free)
  // https://www.pulumi.com/registry/packages/cloudflare/api-docs/ruleset/
  // https://www.pulumi.com/registry/packages/cloudflare/api-docs/wafpackage/

  // -------------------------------------------
  // Email routing
  // -------------------------------------------

  // TODO (as soon as it's available): https://github.com/cloudflare/terraform-provider-cloudflare/issues/1460

  // -------------------------------------------
  // dns entries (domains)
  // -------------------------------------------

  if (isProduction()) {
    // auto-created and updated by the DDNS updater service
    const homeRecord = cloudflare.Record.get('home', pulumi.interpolate`${zone.id}/60ffd80cc91d047c640117461e934b00`);

    new cloudflare.Record('mdm', {
      name: 'mdm',
      zoneId: zone.id,
      type: 'CNAME',
      value: pulumi.interpolate`${homeRecord.name}.${zone.zone}`,
      proxied: true,
    });
  }

  const internalEntry: Omit<cloudflare.RecordArgs, 'name'> = {
    zoneId: zone.id,
    type: 'A',
    // RFC 5737: IPs in the 192.0.2.0/24 range are considered testing/documentation IPs that aren't used (meaning this IP cannot be used)
    // https://www.rfc-editor.org/rfc/rfc5737#section-3
    value: '192.0.2.1',
    ttl: 1,
    proxied: false,
  };
  new cloudflare.Record('services', { name: '*.services', ...internalEntry });
  new cloudflare.Record('devices', { name: '*.devices', ...internalEntry });

  return {
    dnsSecStatus: zone_dnssec.status,
    originCaCertificate: originCaCertificate.certificate,
  };
};

class DefaultDomainResource extends CloudflareResource {
  public readonly dnsSecStatus!: pulumi.Output<string>;
  public readonly originCaCertificate!: pulumi.Output<string>;
}

export const getDefaultDomainResource = () => new DefaultDomainResource('default-domain', childResourcesFn);
