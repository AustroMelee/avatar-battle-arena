import js from "@eslint/js";
import globals from "globals";
import eslintComments from "eslint-plugin-eslint-comments";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // 🔧 Base rules for all JavaScript files
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: {
      js,
      "eslint-comments": eslintComments
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      ...js.configs.recommended.rules,

      // 👁️ General style/safety
      "no-unused-vars": ["warn", { vars: "all", args: "after-used", argsIgnorePattern: "^_" }],
      "no-console": "off",
      "no-var": "error",
      "prefer-const": "warn",
      "eqeqeq": ["warn", "smart"],
      "quotes": ["warn", "double"],
      "semi": ["warn", "always"],
      "no-redeclare": "error",
      "no-shadow": "warn",
      "consistent-return": "warn",

      // 🔐 Prevent bad comment-based rule suppression
      "eslint-comments/no-unused-disable": "error",
      "eslint-comments/no-use": "error"
    }
  },

  // 🎯 Phase-specific override
  {
    files: ["src/js/engine/phases/*.js"],
    rules: {
      "no-case-declarations": "off"
    }
  }
]);
