module.exports = {
  testEnvironment: "jsdom",
  testMatch: ["**/__tests__/**/*.test.js"],
  transform: {
    "^.+\\.svelte$": "svelte-jester",
    "^.+\\.js$": "babel-jest",
  },
  moduleFileExtensions: ["js", "svelte"],
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  verbose: true,
  transformIgnorePatterns: ["node_modules/(?!(@testing-library/svelte)/)"],
  moduleNameMapper: {
    "^@sudoku/(.*)$": "<rootDir>/src/libs/@sudoku/$1",
  },
  collectCoverage: true, // 启用覆盖率报告
  collectCoverageFrom: [
    "src/libs/**/*.js", // 递归收集所有 js 文件
    "!src/**/__tests__/**",
  ],
  coverageDirectory: "coverage", // 覆盖率报告输出目录
  coverageReporters: ["html", "text-summary"], // 生成 HTML 和文本格式的报告
};
