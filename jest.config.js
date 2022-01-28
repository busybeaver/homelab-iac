module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  setupFiles: ['<rootDir>/jest.config.pulumi.ts'],
};
