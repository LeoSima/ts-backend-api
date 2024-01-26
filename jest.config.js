/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    "@AncientOne/(.*)": "<rootDir>/src/$1"
  },
  testPathIgnorePatterns: [
    "<rootDir>/dist"
  ],
  collectCoverageFrom: [
    "<rootDir>/src/**/{!(express_dev_logger),}.ts"
  ],
};