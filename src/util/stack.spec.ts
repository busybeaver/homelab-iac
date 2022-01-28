describe('stack config', () => {
  let stack: typeof import('./stack');

  beforeAll(async () => {
    // It's important to import the program _after_ the mocks are defined.
    stack = await import('./stack');
  });

  test('isCi', () => {
    expect(stack.isCi()).toBe(process.env.PULUMI_NODEJS_STACK === 'ci');
  });

  test('isProduction', () => {
    expect(stack.isProduction()).toBe(process.env.PULUMI_NODEJS_STACK === 'production');
  });
});
