import js from "@eslint/js";
import globals from "globals";
import pluginTypeScript from "@typescript-eslint/eslint-plugin";
import parserTypeScript from "@typescript-eslint/parser";
import configPrettier from "eslint-config-prettier";
import pluginPrettier from "eslint-plugin-prettier";
import pluginVue from "eslint-plugin-vue";
import parserVue from "vue-eslint-parser";

// uni-app 运行时注入的全局对象，各端（H5/小程序/App）通用
const uniAppGlobals = {
  uni: "readonly",
  wx: "readonly",
  plus: "readonly",
  getCurrentPages: "readonly",
  getApp: "readonly",
  requireNativePlugin: "readonly",
  uniCore: "readonly",
};

const commonRules = {
  ...configPrettier.rules,
  ...pluginPrettier.configs.recommended.rules,
  "func-style": [
    "error",
    "expression",
    {
      allowArrowFunctions: true,
    },
  ],
  "no-debugger": "off",
  "no-unused-vars": [
    "error",
    {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
    },
  ],
  "prettier/prettier": [
    "error",
    {
      endOfLine: "auto",
    },
  ],
  quotes: ["warn", "double"],
};

const typeScriptRules = {
  ...pluginTypeScript.configs.recommended.rules,
  "@typescript-eslint/ban-ts-comment": "off",
  "@typescript-eslint/no-empty-function": "off",
  "@typescript-eslint/no-explicit-any": "off",
  "@typescript-eslint/no-non-null-assertion": "off",
  "@typescript-eslint/no-unused-vars": [
    "error",
    {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
    },
  ],
  "@typescript-eslint/prefer-as-const": "warn",
};

export default [
  {
    ignores: ["**/.*", "dist/**", "node_modules/**", "unpackage/**", "uni_modules/**", "static/**", "*.d.ts"],
  },
  {
    ...js.configs.recommended,
    files: ["**/*.{js,cjs,mjs,ts}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...uniAppGlobals,
      },
    },
    plugins: {
      prettier: pluginPrettier,
    },
    rules: commonRules,
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: parserTypeScript,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        globals: {
          ...uniAppGlobals,
        },
      },
    },
    plugins: {
      "@typescript-eslint": pluginTypeScript,
    },
    rules: {
      "no-unused-vars": "off",
      ...typeScriptRules,
    },
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: parserVue,
      parserOptions: {
        ecmaVersion: "latest",
        extraFileExtensions: [".vue"],
        parser: parserTypeScript,
        sourceType: "module",
        globals: {
          ...uniAppGlobals,
        },
      },
    },
    plugins: {
      "@typescript-eslint": pluginTypeScript,
      prettier: pluginPrettier,
      vue: pluginVue,
    },
    processor: pluginVue.processors[".vue"],
    rules: {
      ...commonRules,
      ...pluginVue.configs.base.rules,
      ...pluginVue.configs["vue3-essential"].rules,
      ...pluginVue.configs["vue3-recommended"].rules,
      "no-undef": "off",
      "no-unused-vars": "off",
      ...typeScriptRules,
      "vue/html-self-closing": [
        "error",
        {
          html: {
            void: "always",
            normal: "always",
            component: "always",
          },
          svg: "always",
          math: "always",
        },
      ],
      "vue/multi-word-component-names": "off",
      "vue/no-setup-props-reactivity-loss": "off",
      "vue/no-v-html": "off",
      "vue/require-default-prop": "off",
      "vue/require-explicit-emits": "off",
    },
  },
];
