import * as github from '@pulumi/github';
import { requireSecretString, type ChildResourcesFn, createName } from '../../util';
import { GitHubRepository, type RepoData } from './repository';

const childResourcesFn: ChildResourcesFn<RepoData> = (parent, postfix) => {
  const name = createName(postfix);

  const repository = new github.Repository(name('repository'), {
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
  new github.RepositoryCollaborator(name('automation-user'), {
    permission: 'admin',
    repository: repository.name,
    username: requireSecretString('github_automation_user', true),
  }, {
    parent,
  });
  new github.ActionsSecret(name('pulumi-passphrase'), {
    repository: repository.name,
    secretName: 'PULUMI_CONFIG_PASSPHRASE',
    plaintextValue: requireSecretString('ci_stack_github_token'),
  }, {
    parent,
  });
  new github.ActionsSecret(name('gitguardian-api-key'), {
    repository: repository.name,
    secretName: 'GITGUARDIAN_API_KEY',
    plaintextValue: requireSecretString('gitguardian_api_key'),
  }, {
    parent,
  });
  new github.ActionsSecret(name('gpg-private-key'), {
    repository: repository.name,
    secretName: 'GPG_PRIVATE_KEY',
    plaintextValue: requireSecretString('gpg_private_key'),
  }, {
    parent,
  });
  new github.ActionsSecret(name('gpg-passphrase'), {
    repository: repository.name,
    secretName: 'GPG_PASSPHRASE',
    plaintextValue: requireSecretString('gpg_passphrase'),
  }, {
    parent,
  });
  new github.ActionsSecret(name('pulumi-app-id'), {
    repository: repository.name,
    secretName: 'PULUMI_APP_ID',
    plaintextValue: requireSecretString('pulumi_app_id'),
  }, {
    parent,
  });
  new github.ActionsSecret(name('pulumi-app-private-key'), {
    repository: repository.name,
    secretName: 'PULUMI_APP_PRIVATE_KEY',
    plaintextValue: requireSecretString('pulumi_app_private_key'),
  }, {
    parent,
  });
  new github.ActionsSecret(name('codecov-token'), {
    repository: repository.name,
    secretName: 'CODECOV_TOKEN',
    plaintextValue: requireSecretString('codecov_token'),
  }, {
    parent,
  });
  new github.ActionsSecret(name('github-automation-token'), {
    repository: repository.name,
    secretName: 'GH_AUTOMATION_TOKEN',
    plaintextValue: requireSecretString('github_automation_token'),
  }, {
    parent,
  });
  new github.ActionsSecret(
    name('unit-test-results-reporter-app-id'),
    {
      repository: repository.name,
      secretName: 'UNIT_TEST_RESULTS_REPORTER_APP_ID',
      plaintextValue: requireSecretString('unit_test_results_reporter_app_id'),
    },
    {
      parent,
    },
  );
  new github.ActionsSecret(
    name('unit-test-results-reporter-private-key'),
    {
      repository: repository.name,
      secretName: 'UNIT_TEST_RESULTS_REPORTER_PRIVATE_KEY',
      plaintextValue: requireSecretString('unit_test_results_reporter_private_key'),
    },
    {
      parent,
    },
  );
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
    name('git-user-mail'),
    {
      repository: repository.name,
      secretName: 'GIT_USER_MAIL',
      plaintextValue: requireSecretString('git_user_mail'),
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

export const getHomelabIacRepository = () => new GitHubRepository('homelab-iac', childResourcesFn);
