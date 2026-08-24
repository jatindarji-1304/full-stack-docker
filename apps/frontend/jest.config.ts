import nextJest from "next/jest.js";
import { type Config } from "jest";
const create_jest_config = nextJest({
  dir: "./",
});

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
moduleNameMapper: {
  "^@/(.*)$": "<rootDir>/src/$1",
},
   modulePathIgnorePatterns: ["<rootDir>/.next/"],
};

export default create_jest_config(config);
