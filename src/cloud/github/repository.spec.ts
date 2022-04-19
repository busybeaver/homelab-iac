import * as pulumi from '@pulumi/pulumi';

pulumi.runtime.setMocks({
  newResource: function(args: pulumi.runtime.MockResourceArgs): { id: string; state: any; } {
    return {
      id: args.inputs.name + '_id',
      state: args.inputs,
    };
  },
  call: function(args: pulumi.runtime.MockCallArgs) {
    return args.inputs;
  },
});

describe('repository', () => {
  let repository: typeof import('./repository');

  beforeAll(async () => {
    // It's important to import the program _after_ the mocks are defined.
    repository = await import('./repository');
  });

  test('GitHubRepository', () => {
    const gitHubRepository = new repository.GitHubRepository('testRepo', () => undefined);
    expect(gitHubRepository).toBeInstanceOf(pulumi.ComponentResource);
  });

  test('#server', () => {
    // TODO(check 1): Instances have a Name tag.
    // TODO(check 2): Instances must not use an inline userData script.
  });

  test('#group', () => {
    // TODO(check 3): Instances must not have SSH open to the Internet.
  });
});
