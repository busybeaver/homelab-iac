import * as github from '@pulumi/github';
import * as pulumi from '@pulumi/pulumi';
import * as tailscale from '@pulumi/tailscale';
import { ChildResourcesFn } from '../../util/types';
import { TailscaleTailnet } from './tailnet';

const childResourcesFn: ChildResourcesFn = parent => {
  // global configuration
  const default_nameservers = new tailscale.DnsNameservers('default-nameservers', {
    // cloudflare public DNS
    // TODO: replace with NextDNS
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

  // https://tailscale.com/kb/1018/acls/
  new tailscale.Acl('access-controls', {
    acl: JSON.stringify(
      {
        // Define the tags which can be applied to devices and by which users.
        tagOwners: {
          'tag:mobile': ['autogroup:owner'],
          'tag:computer': ['autogroup:owner'],
          'tag:service': ['autogroup:owner'],
          'tag:device': ['autogroup:owner'],
        },

        groups: {
          'group:admin-and-owner': [],
        },

        // Define access control lists for users, groups, etc.
        acls: [
          // TODO: add proper ACL
          // Allow all connections.
          // Comment this section out if you want to define specific restrictions.
          { action: 'accept', src: ['*'], dst: ['*:*'] },
        ],

        // Define users and devices that can use Tailscale SSH.
        ssh: [
          // Allow all users to SSH into their own devices in check mode.
          {
            action: 'check',
            src: ['autogroup:members'],
            dst: ['autogroup:self'],
            users: ['autogroup:nonroot'],
          },
          {
            action: 'check',
            src: ['autogroup:owner', 'autogroup:admin'],
            dst: ['tag:device'],
            users: ['autogroup:nonroot' /*, 'root'*/],
          },
        ],

        nodeAttrs: [
          {
            // Funnel policy, which lets tailnet members control Funnel
            // for their own devices.
            // Learn more at https://tailscale.com/kb/1223/tailscale-funnel/
            target: ['autogroup:owner', 'autogroup:admin'],
            attr: ['funnel'],
          },
          // {
          //   // TODO: NextDNS setup
          //   // https://tailscale.com/kb/1018/acls/#node-attributes
          //   target: ["my-kid@my-home.com", "tag:server"],
          //   attr: [
          //       "nextdns:abc123",
          //       "nextdns:no-device-info",
          //   ],
          // }
        ],

        // Test access rules every time they're saved.
        tests: [
          // {
          //   // TODO: https://github.com/tailscale/tailscale/issues/4416
          //   'src': 'autogroup:members',
          //   'accept': ['autogroup:self:22'],
          //   'deny': ['tag:service', 'tag:device'],
          // },
        ],
      },
    ),
  }, { parent });

  // users in Talescale are managed via GitHub organization
  const githubAdminUser = (new pulumi.Config('github')).requireSecret('owner');
  const githubOrganizationName = (new pulumi.Config()).requireSecret('tailscale_github_organization');
  const githubOrganizationProvider = new github.Provider('organization-provider', {
    owner: githubOrganizationName,
    token: (new pulumi.Config('github')).requireSecret('token'),
  }, { parent });
  new github.OrganizationSettings('tailscale-organization', {
    name: githubOrganizationName,
    billingEmail: 'private@foo.bar',
    defaultRepositoryPermission: 'none',
    dependabotAlertsEnabledForNewRepositories: true,
    dependabotSecurityUpdatesEnabledForNewRepositories: true,
    dependencyGraphEnabledForNewRepositories: true,
    membersCanCreatePages: false,
    membersCanCreatePrivatePages: false,
    membersCanCreatePublicPages: false,
    membersCanCreatePublicRepositories: false,
    membersCanCreateInternalRepositories: false,
    membersCanCreatePrivateRepositories: false,
    membersCanForkPrivateRepositories: false,
    membersCanCreateRepositories: false,
    hasOrganizationProjects: false,
    hasRepositoryProjects: false,
    advancedSecurityEnabledForNewRepositories: true,
    secretScanningEnabledForNewRepositories: true,
    secretScanningPushProtectionEnabledForNewRepositories: true,
  }, {
    parent,
    provider: githubOrganizationProvider,
  });
  new github.ActionsOrganizationPermissions('tailscale-organization', {
    allowedActions: 'selected',
    enabledRepositories: 'all',
    allowedActionsConfig: {
      githubOwnedAllowed: true,
      verifiedAllowed: true,
    },
  }, {
    parent,
    provider: githubOrganizationProvider,
  });
  new github.Membership('organization-admin', {
    username: githubAdminUser,
    role: 'admin',
  }, {
    parent,
    provider: githubOrganizationProvider,
  });
  // add additional (member) users here

  // approve devices and ensure keys are expiring
  pulumi.all([githubAdminUser]).apply(githubUsers => {
    return githubUsers.map(githubUser => {
      return tailscale.getDevices({
        namePrefix: `${githubUser}-`,
      });
    });
  }).apply(devices => Promise.all(devices))
    .apply(devices => devices.flatMap(device => device.devices))
    // TODO: add filter by 'device.user' here to ensure that we only approve the relevant devices
    .apply(devices => {
      devices.map(device => {
        const deviceName = device.name.split('.')[0];
        new tailscale.DeviceAuthorization(`${deviceName}-authorization`, {
          deviceId: device.id,
          authorized: true,
        }, { parent });
        new tailscale.DeviceKey(`${deviceName}-device-key`, {
          deviceId: device.id,
          keyExpiryDisabled: false,
        }, { parent });
      });
    });

  // TODO: https://www.pulumi.com/registry/packages/tailscale/api-docs/devicetags/

  return {
    // expose some information if needed
  };
};

export const getDefaultTailnet = () => new TailscaleTailnet('default', childResourcesFn);
