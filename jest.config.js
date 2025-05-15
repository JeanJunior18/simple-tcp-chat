/** @type {import("jest").Config} **/
module.exports = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  preset: 'ts-jest',
  testEnvironment: "node",
  testMatch: ['**/*.spec.ts']
};