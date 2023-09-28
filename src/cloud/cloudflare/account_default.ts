import * as cloudflare from '@pulumi/cloudflare';
import * as pulumi from '@pulumi/pulumi';
import type { ChildResourcesFn } from '../../util';
import { type AccountData, CloudflareAccount } from './account';
import { getDefaultDomainSite } from './site_default_domain';

export type CloudflareDefaultApiTokens = pulumi.Output<{ githubActionsHomelabAdblock: string; }>;

const childResourcesFn: ChildResourcesFn<DefaultAccountData> = (parent, { createName }) => {
  // -------------------------------------------
  // account configuration
  // -------------------------------------------

  const account = new cloudflare.Account(createName('account'), {
    enforceTwofactor: true,
    name: 'default-account',
    type: 'standard',
  }, {
    parent,
    protect: true,
  });

  // -------------------------------------------
  // API tokens
  // -------------------------------------------
  const all = cloudflare.getApiTokenPermissionGroups({});
  const githubActionsHomelabAdblockApiToken = new cloudflare.ApiToken(createName('github-actions_homelab-adblock'), {
    name: 'github-actions_homelab-adblock',
    policies: [
      {
        effect: 'allow',
        resources: pulumi.all([zone.id, account.id]).apply(([zoneId, accountId]) => {
          return {
            [`com.cloudflare.api.account.zone.${zoneId}`]: '*',
            [`com.cloudflare.api.account.${accountId}`]: '*',
          };
        }),
        permissionGroups: [
          all.then(a => a.permissions['Pages Write']),
        ],
      },
    ],
  }, { parent, protect: true });

  return {
    accountId: account.id,
    apiTokens: pulumi.output({
      githubActionsHomelabAdblock: githubActionsHomelabAdblockApiToken.value,
    }),
  };
};

export type DefaultAccountData = AccountData & {
  apiTokens: CloudflareDefaultApiTokens;
};

export const getDefaultAccount = () =>
  new CloudflareAccount('default', childResourcesFn, [getDefaultDomainSite] as const);

const x = getDefaultAccount();
x.siteData;
