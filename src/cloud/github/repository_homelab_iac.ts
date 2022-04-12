import * as github from '@pulumi/github';
import * as pulumi from '@pulumi/pulumi';
import { requireSecretString } from '../../util/secrets';
import { ChildResourcesFn, GitHubRepository } from './repository';

const childResourcesFn: ChildResourcesFn = parent => {
  const repository = new github.Repository('repository', {
    allowAutoMerge: true,
    allowMergeCommit: true,
    allowRebaseMerge: false,
    allowSquashMerge: true,
    autoInit: true,
    archived: false,
    deleteBranchOnMerge: true,
    description: 'Infrastructure as Code for the personal HomeLab',
    hasDownloads: true,
    hasIssues: true,
    hasProjects: false,
    hasWiki: false,
    isTemplate: false,
    name: 'homelab-iac',
    visibility: 'public',
    vulnerabilityAlerts: true,
  }, {
    parent,
    protect: true,
    aliases: [`urn:pulumi:${pulumi.getStack()}::homelab-iac::github:index/repository:Repository::homelab-iac`],
  });
  const defaultBranch = new github.BranchDefault('default-branch', {
    repository: repository.name,
    branch: repository.branches[0]?.name ?? 'main',
  }, {
    parent,
    protect: true,
    aliases: [
      `urn:pulumi:${pulumi.getStack()}::homelab-iac::github:index/branchDefault:BranchDefault::homelab-iac`,
    ],
  });
  new github.RepositoryCollaborator('automation-user', {
    permission: 'admin',
    repository: repository.name,
    username: requireSecretString('github_automation_user', true),
  }, {
    parent,
    aliases: [
      `urn:pulumi:${pulumi.getStack()}::homelab-iac::github:index/repositoryCollaborator:RepositoryCollaborator::homelab-iac-automation-user`,
    ],
  });
  new github.ActionsSecret('pulumi-passphrase', {
    repository: repository.name,
    secretName: 'PULUMI_CONFIG_PASSPHRASE',
    plaintextValue: requireSecretString('ci_stack_github_token'),
  }, {
    parent,
    aliases: [
      `urn:pulumi:${pulumi.getStack()}::homelab-iac::github:index/actionsSecret:ActionsSecret::homelab-iac-pulumi-passphrase`,
    ],
  });
  new github.ActionsSecret('gitguardian-api-key', {
    repository: repository.name,
    secretName: 'GITGUARDIAN_API_KEY',
    plaintextValue: requireSecretString('gitguardian_api_key'),
  }, {
    parent,
    aliases: [
      `urn:pulumi:${pulumi.getStack()}::homelab-iac::github:index/actionsSecret:ActionsSecret::homelab-iac-gitguardian-api-key`,
    ],
  });
  new github.ActionsSecret('gpg-private-key', {
    repository: repository.name,
    secretName: 'GPG_PRIVATE_KEY',
    plaintextValue: requireSecretString('gpg_private_key'),
  }, {
    parent,
    aliases: [
      `urn:pulumi:${pulumi.getStack()}::homelab-iac::github:index/actionsSecret:ActionsSecret::homelab-iac-gpg-private-key`,
    ],
  });
  new github.ActionsSecret('gpg-passphrase', {
    repository: repository.name,
    secretName: 'GPG_PASSPHRASE',
    plaintextValue: requireSecretString('gpg_passphrase'),
  }, {
    parent,
    aliases: [
      `urn:pulumi:${pulumi.getStack()}::homelab-iac::github:index/actionsSecret:ActionsSecret::homelab-iac-gpg-passphrase`,
    ],
  });
  new github.ActionsSecret('pulumi-app-id', {
    repository: repository.name,
    secretName: 'PULUMI_APP_ID',
    plaintextValue: requireSecretString('pulumi_app_id'),
  }, {
    parent,
    aliases: [
      `urn:pulumi:${pulumi.getStack()}::homelab-iac::github:index/actionsSecret:ActionsSecret::homelab-iac-pulumi-app-id`,
    ],
  });
  new github.ActionsSecret('pulumi-app-private-key', {
    repository: repository.name,
    secretName: 'PULUMI_APP_PRIVATE_KEY',
    plaintextValue: requireSecretString('pulumi_app_private_key'),
  }, {
    parent,
    aliases: [
      `urn:pulumi:${pulumi.getStack()}::homelab-iac::github:index/actionsSecret:ActionsSecret::homelab-iac-pulumi-app-private-key`,
    ],
  });
  new github.ActionsSecret('codecov-token', {
    repository: repository.name,
    secretName: 'CODECOV_TOKEN',
    plaintextValue: requireSecretString('codecov_token'),
  }, {
    parent,
    aliases: [
      `urn:pulumi:${pulumi.getStack()}::homelab-iac::github:index/actionsSecret:ActionsSecret::homelab-iac-codecov-token`,
    ],
  });
  new github.ActionsSecret('github-automation-token', {
    repository: repository.name,
    secretName: 'GH_AUTOMATION_TOKEN',
    plaintextValue: requireSecretString('github_automation_token'),
  }, {
    parent,
    aliases: [
      `urn:pulumi:${pulumi.getStack()}::homelab-iac::github:index/actionsSecret:ActionsSecret::homelab-iac-github-automation-token`,
    ],
  });
  new github.ActionsSecret(
    'unit-test-results-reporter-app-id',
    {
      repository: repository.name,
      secretName: 'UNIT_TEST_RESULTS_REPORTER_APP_ID',
      plaintextValue: requireSecretString('unit_test_results_reporter_app_id'),
    },
    {
      parent,
      aliases: [
        `urn:pulumi:${pulumi.getStack()}::homelab-iac::github:index/actionsSecret:ActionsSecret::homelab-iac-unit-test-results-reporter-app-id`,
      ],
    },
  );
  new github.ActionsSecret(
    'unit-test-results-reporter-private-key',
    {
      repository: repository.name,
      secretName: 'UNIT_TEST_RESULTS_REPORTER_PRIVATE_KEY',
      plaintextValue: requireSecretString('unit_test_results_reporter_private_key'),
    },
    {
      parent,
      aliases: [
        `urn:pulumi:${pulumi.getStack()}::homelab-iac::github:index/actionsSecret:ActionsSecret::homelab-iac-unit-test-results-reporter-private-key`,
      ],
    },
  );
  new github.ActionsSecret(
    'repository-assistant-app-id',
    {
      repository: repository.name,
      secretName: 'REPOSITORY_ASSISTANT_APP_ID',
      plaintextValue: requireSecretString('repository_assistant_app_id'),
    },
    {
      parent,
      aliases: [
        `urn:pulumi:${pulumi.getStack()}::homelab-iac::github:index/actionsSecret:ActionsSecret::homelab-iac-repository-assistant-app-id`,
      ],
    },
  );
  new github.ActionsSecret(
    'repository-assistant-private-key',
    {
      repository: repository.name,
      secretName: 'REPOSITORY_ASSISTANT_PRIVATE_KEY',
      plaintextValue: requireSecretString('repository_assistant_private_key'),
    },
    {
      parent,
      aliases: [
        `urn:pulumi:${pulumi.getStack()}::homelab-iac::github:index/actionsSecret:ActionsSecret::homelab-iac-repository-assistant-private-key`,
      ],
    },
  );
  new github.ActionsSecret(
    'git-user-mail',
    {
      repository: repository.name,
      secretName: 'GIT_USER_MAIL',
      plaintextValue: requireSecretString('git_user_mail'),
    },
    {
      parent,
      aliases: [
        `urn:pulumi:${pulumi.getStack()}::homelab-iac::github:index/actionsSecret:ActionsSecret::homelab-iac-git-user-mail`,
      ],
    },
  );

  return {
    repositoryName: repository.name,
    defaultBranch: defaultBranch.branch,
  };
};

export const homelabIacRepository = new GitHubRepository('homelab-iac', childResourcesFn);
