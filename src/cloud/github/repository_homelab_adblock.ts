import * as github from '@pulumi/github';
import { requireSecretString, type ChildResourcesFn, createName } from '../../util';
import { GitHubRepository, type RepoData } from './repository';
import type { CloudflareApiTokens } from '../cloudflare';

const childResourcesFn = ({ cloudflareApiTokens }: { cloudflareApiTokens: CloudflareApiTokens; }): ChildResourcesFn<RepoData> => (parent, postfix) => {
  const name = createName(postfix);

  const repository = new github.Repository(name('repository'), {
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
  const mainBranch = new github.Branch(name('default-branch'), {
    repository: repository.name,
    branch: 'main',
  }, {
    parent,
    protect: true,
  });
  const defaultBranch = new github.BranchDefault(name('default-branch'), {
    repository: repository.name,
    branch: mainBranch.branch,
  }, {
    parent,
    protect: true,
  });
  new github.ActionsSecret(name('gitguardian-api-key'), {
    repository: repository.name,
    secretName: 'GITGUARDIAN_API_KEY',
    plaintextValue: requireSecretString('gitguardian_api_key'),
  }, {
    parent,
  });
  new github.ActionsSecret(
    name('repository-assistant-app-id'),
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
    name('repository-assistant-private-key'),
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
    name('cloudflare-api-token'),
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
