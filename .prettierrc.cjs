module.exports = {
  // 箭头函数始终保留参数括号
  arrowParens: "always",
  // 右尖括号单独换行，保持长属性模板更清晰
  bracketSameLine: false,
  // 对象花括号内保留空格
  bracketSpacing: true,
  // 嵌入语言代码保持自动格式化
  embeddedLanguageFormatting: "auto",
  // 模板空白按忽略模式处理，降低中文界面的误换行
  htmlWhitespaceSensitivity: "ignore",
  // 允许多个属性在同一行，由打印宽度统一决定
  singleAttributePerLine: false,
  // 不要求文件头格式化标记
  insertPragma: false,
  requirePragma: false,
  // 参考项目使用双引号和分号
  jsxSingleQuote: false,
  singleQuote: false,
  semi: true,
  // 与参考项目保持 120 字符宽度
  printWidth: 120,
  proseWrap: "preserve",
  quoteProps: "as-needed",
  tabWidth: 2,
  trailingComma: "es5",
  useTabs: false,
  vueIndentScriptAndStyle: false,
  endOfLine: "auto",
  overrides: [
    {
      files: "*.html",
      options: {
        parser: "html",
      },
    },
  ],
};
