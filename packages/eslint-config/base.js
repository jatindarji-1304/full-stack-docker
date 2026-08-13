import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";

export const config = tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      ".next/**",
      "coverage/**",
    ],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },

    plugins: {
      "unused-imports": unusedImports,
    },

    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",

      "unused-imports/no-unused-imports": "error",

      "unused-imports/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",

      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],

      "prefer-const": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
      "eqeqeq": ["error", "always", { null: "ignore" }],
      "no-duplicate-imports": "error",
      "curly": ["error", "all"],
      "no-unneeded-ternary": "error",
      "prefer-template": "error",
      "object-shorthand": ["error", "always"],
      "no-param-reassign": ["error", { props: true }],
    },
  },
);

export default config;