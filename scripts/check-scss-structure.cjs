const fs = require("node:fs");
const path = require("node:path");

const project = path.resolve(__dirname, "..");
const ignored = new Set(["node_modules", "unpackage", ".git"]);
const errors = [];

const visit = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      visit(filename);
      continue;
    }
    const relative = path.relative(project, filename).replaceAll("\\", "/");
    if (entry.name.endsWith(".css")) errors.push(`${relative}: 请使用 .scss 文件`);
    if (!entry.name.endsWith(".vue")) continue;

    const source = fs.readFileSync(filename, "utf8");
    for (const match of source.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/g)) {
      if (!/\blang=["']scss["']/.test(match[1])) errors.push(`${relative}: style 块缺少 lang="scss"`);
      const topLevelRules = match[2].match(/^\S[^\r\n{}]*\{/gm) ?? [];
      if (topLevelRules.length > 1) errors.push(`${relative}: 组件样式必须收拢到一个根选择器中`);
    }
  }
};

visit(project);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("SCSS 结构检查通过");
