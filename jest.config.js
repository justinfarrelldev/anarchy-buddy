module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ["build"],
  reporters: [
    "default",
    "jest-junit" 
  ]
};