import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,

  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module", // Change to "commonjs" if you use require()
      globals: {
        ...globals.node,
      },
    },

    rules: {
      // ── Possible Errors ──────────────────────────────────────────────
      "no-console": "warn", // Warn on console.log (use a logger)
      "no-debugger": "error",
      "no-duplicate-imports": "error",
      "no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
        },
      ],

      // ── Best Practices ───────────────────────────────────────────────
      eqeqeq: ["error", "always"], // Always use === instead of ==
      "no-var": "error", // Use const/let
      "prefer-const": "error",
      curly: ["error", "all"], // Always use braces for if/else
      "dot-notation": "error",
      "no-throw-literal": "error", // Only throw Error objects
      "no-return-await": "error", // Avoid redundant return await
      "no-shadow": "error", // No variable shadowing
      "no-useless-catch": "error",
      "prefer-promise-reject-errors": "error",
      "require-await": "error", // No async functions without await

      // ── Style (auto-fixable) ─────────────────────────────────────────
      semi: ["error", "always"],
      quotes: ["error", "single", { avoidEscape: true }],
      indent: ["error", 2, { SwitchCase: 1 }],
      "comma-dangle": ["error", "always-multiline"],
      "comma-spacing": ["error", { before: false, after: true }],
      "key-spacing": ["error", { beforeColon: false, afterColon: true }],
      "space-before-function-paren": [
        "error",
        {
          anonymous: "never",
          named: "never",
          asyncArrow: "always",
        },
      ],
      "space-before-blocks": "error",
      "keyword-spacing": ["error", { before: true, after: true }],
      "object-curly-spacing": ["error", "always"],
      "array-bracket-spacing": ["error", "never"],
      "arrow-spacing": ["error", { before: true, after: true }],
      "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
      "eol-last": ["error", "always"],
      "no-trailing-spaces": "error",
      "max-len": ["warn", { code: 100, ignoreUrls: true, ignoreStrings: true }],
    },
  },

  // ── Test files (relax some rules) ──────────────────────────────────────
  {
    files: ["**/*.test.js", "**/*.spec.js", "tests/**/*.js"],
    rules: {
      "no-console": "off",
      "require-await": "off",
    },
  },

  // ── Ignore patterns ─────────────────────────────────────────────────────
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "*.min.js",
    ],
  },
];
