module.exports = {
  // 继承参考项目使用的通用样式规则
  extends: [
    "stylelint-config-standard",
    "stylelint-config-recommended-scss",
    "stylelint-config-recommended-vue/scss",
    "stylelint-config-html/vue",
    "stylelint-config-recess-order",
  ],
  // 为不同文件类型指定解析方式
  overrides: [
    {
      files: ["**/*.{vue,html}"],
      customSyntax: "postcss-html",
    },
    {
      files: ["**/*.{css,scss}"],
      customSyntax: "postcss-scss",
    },
  ],
  rules: {
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: ["apply", "use", "forward"],
      },
    ],
    "custom-property-pattern": null,
    "import-notation": "string",
    "keyframes-name-pattern": null,
    "no-descending-specificity": null,
    "no-empty-source": null,
    "property-no-unknown": [
      true,
      {
        ignoreProperties: [],
      },
    ],
    "selector-class-pattern": null,
    "selector-pseudo-class-no-unknown": [
      true,
      {
        ignorePseudoClasses: ["global", "export", "deep"],
      },
    ],
    // uni-app 特有的响应式单位
    "unit-no-unknown": [
      true,
      {
        ignoreUnits: ["rpx", "upx"],
      },
    ],
  },
};
