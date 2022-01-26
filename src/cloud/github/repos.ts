import * as github from "@pulumi/github";
import { requireSecretString } from "../../util/secrets"

const iac_repo = new github.Repository("homelab-iac", {
  allowAutoMerge: false,
  allowMergeCommit: true,
  allowRebaseMerge: false,
  allowSquashMerge: true,
  archived: false,
  deleteBranchOnMerge: true,
  description: "Infrastructure as Code for the personal HomeLab",
  hasDownloads: true,
  hasIssues: true,
  hasProjects: false,
  hasWiki: false,
  isTemplate: false,
  name: "homelab-iac",
  visibility: "public",
  vulnerabilityAlerts: true,
});
const iac_main_branch = new github.Branch("homelab-iac-main", {
  repository: iac_repo.name,
  branch: "main",
  sourceBranch: "main",
}, {
  protect: true,
});
const iac_default_branch = new github.BranchDefault("homelab-iac", {
  repository: iac_repo.name,
  branch: iac_main_branch.branch,
}, {
  protect: true,
});
const iac_pulumi_secret = new github.ActionsSecret("homelab-iac-pulumi-passphrase", {
  repository: iac_repo.name,
  secretName: "PULUMI_CONFIG_PASSPHRASE",
  plaintextValue: requireSecretString("ci_stack_github_token"),
});
const iac_gitguardian_secret = new github.ActionsSecret("homelab-iac-gitguardian-api-key", {
  repository: iac_repo.name,
  secretName: "GITGUARDIAN_API_KEY",
  plaintextValue: requireSecretString("gitguardian_api_key"),
});

export const repos = [ iac_repo, iac_main_branch, iac_default_branch, iac_pulumi_secret, iac_gitguardian_secret ];
