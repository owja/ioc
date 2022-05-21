module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/src"],
    collectCoverageFrom: ["<rootDir>/src/**/*.ts", "!<rootDir>/src/example/**"],
    coverageDirectory: "./coverage/",
    collectCoverage: true,
};
