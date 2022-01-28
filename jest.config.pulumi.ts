const projectName = process.env.TEST_PROJECT_OVERRIDE || 'project';
const stackName = process.env.TEST_STACK_OVERRIDE || 'ci';

process.env.PULUMI_TEST_MODE = 'true';
process.env.PULUMI_NODEJS_PROJECT = projectName;
process.env.PULUMI_NODEJS_STACK = stackName;

process.env.PULUMI_CONFIG = JSON.stringify({
  [`${projectName}:github_automation_user`]: 'testUser',
});
