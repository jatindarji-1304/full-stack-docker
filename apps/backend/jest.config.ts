import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",

  transform: {
    "^.+\\.tsx?$": [
      "@swc/jest",
      {},
    ],
  },

  extensionsToTreatAsEsm: [".ts"],

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};

export default config;