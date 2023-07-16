import * as github from '@pulumi/github';
import { requireSecretString } from '../../util/secrets';
import { ChildResourcesFn } from '../../util/types';
import { GitHubRepository, type RepoData } from './repository';
import type { CloudflareApiTokens } from '../cloudflare';

const childResourcesFn = ({ cloudflareApiTokens }: { cloudflareApiTokens: CloudflareApiTokens; }): ChildResourcesFn<RepoData> => parent => {
  const repository = new github.Repository('repository-adblock', {
    allowAutoMerge: true,
    allowMergeCommit: true,
    allowRebaseMerge: false,
    allowSquashMerge: true,
    autoInit: true,
    archived: false,
    deleteBranchOnMerge: true,
    description: 'Shared AdGuard/AdBlock/uBlockOrigin Filter List',
    hasDownloads: true,
    hasIssues: true,
    hasProjects: false,
    hasWiki: false,
    isTemplate: false,
    name: 'homelab-adblock',
    visibility: 'private',
    vulnerabilityAlerts: true,
  }, {
    parent,
    protect: true,
  });
  const mainBranch = new github.Branch('default-branch-adblock', {
    repository: repository.name,
    branch: 'main',
  }, {
    parent,
    protect: true,
  });
  const defaultBranch = new github.BranchDefault('default-branch-adblock', {
    repository: repository.name,
    branch: mainBranch.branch,
  }, {
    parent,
    protect: true,
  });
  new github.ActionsSecret('gitguardian-api-key-adblock', {
    repository: repository.name,
    secretName: 'GITGUARDIAN_API_KEY',
    plaintextValue: requireSecretString('gitguardian_api_key'),
  }, {
    parent,
  });
  new github.ActionsSecret(
    'repository-assistant-app-id-adblock',
    {
      repository: repository.name,
      secretName: 'REPOSITORY_ASSISTANT_APP_ID',
      plaintextValue: requireSecretString('repository_assistant_app_id'),
    },
    {
      parent,
    },
  );
  new github.ActionsSecret(
    'repository-assistant-private-key-adblock',
    {
      repository: repository.name,
      secretName: 'REPOSITORY_ASSISTANT_PRIVATE_KEY',
      plaintextValue: requireSecretString('repository_assistant_private_key'),
    },
    {
      parent,
    },
  );
  new github.ActionsSecret(
    'cloudflare-api-token-adblock',
    {
      repository: repository.name,
      secretName: 'CLOUDFLARE_API_TOKEN',
      plaintextValue: cloudflareApiTokens.githubActionsHomelabAdblock,
    },
    {
      parent,
    },
  );

  return {
    repositoryName: repository.name,
    defaultBranch: defaultBranch.branch,
  };
};



export const getHomelabAdblockRepository = ({ cloudflareApiTokens }: { cloudflareApiTokens: CloudflareApiTokens; }) =>
  new GitHubRepository('homelab-adblock', childResourcesFn({ cloudflareApiTokens }));
