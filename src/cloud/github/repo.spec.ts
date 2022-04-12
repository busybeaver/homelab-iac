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

describe('Infrastructure', () => {
  let infra: typeof import('./repos');

  beforeAll(async () => {
    // It's important to import the program _after_ the mocks are defined.
    infra = await import('./repos');
  });

  test('#server', () => {
    // TODO(check 1): Instances have a Name tag.
    // TODO(check 2): Instances must not use an inline userData script.
  });

  test('#group', () => {
    // TODO(check 3): Instances must not have SSH open to the Internet.
  });
});
