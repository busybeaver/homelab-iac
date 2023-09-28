import * as github from '@pulumi/github';
import { type ChildResourcesFn, requireSecretString } from '../../util';
import type { CloudflareApiTokens } from '../cloudflare';
import { GitHubRepository, type RepoData } from './repository';

const childResourcesFn =
  ({ cloudflareApiTokens }: { cloudflareApiTokens: CloudflareApiTokens; }): ChildResourcesFn<RepoData> =>
  (parent, { createName }) => {
    const repository = new github.Repository(createName('repository'), {
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
    const mainBranch = new github.Branch(createName('default-branch'), {
      repository: repository.name,
      branch: 'main',
    }, {
      parent,
      protect: true,
    });
    const defaultBranch = new github.BranchDefault(createName('default-branch'), {
      repository: repository.name,
      branch: mainBranch.branch,
    }, {
      parent,
      protect: true,
    });
    new github.ActionsSecret(createName('gitguardian-api-key'), {
      repository: repository.name,
      secretName: 'GITGUARDIAN_API_KEY',
      plaintextValue: requireSecretString('gitguardian_api_key'),
    }, {
      parent,
    });
    new github.ActionsSecret(
      createName('repository-assistant-app-id'),
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
      createName('repository-assistant-private-key'),
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
      createName('cloudflare-api-token'),
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
