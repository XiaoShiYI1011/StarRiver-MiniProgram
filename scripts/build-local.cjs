const fs = require("node:fs");
const path = require("node:path");

const project = path.resolve(__dirname, "..");
const platform = process.argv[2] || "mp-weixin";
const hbuilder = process.env.HBUILDERX_HOME;
if (!hbuilder || !["h5", "mp-weixin"].includes(platform)) {
  console.error("请设置 HBUILDERX_HOME 为 HBuilderX 安装目录，平台可选 h5 / mp-weixin。");
  process.exit(1);
}
const plugins = path.join(hbuilder, "plugins");
const compilerModules = path.join(plugins, "uniapp-cli-vite/node_modules");
const cli = path.join(compilerModules, "@dcloudio/vite-plugin-uni/bin/uni.js");
if (!fs.existsSync(cli)) {
  console.error("该 HBuilderX 未安装 uniapp-cli-vite 编译器。");
  process.exit(1);
}
process.env.HX_APP_ROOT = hbuilder;
process.env.UNI_INPUT_DIR = project;
process.env.UNI_OUTPUT_DIR = path.join(project, "unpackage/prototype-check", platform);
process.env.UNI_PLATFORM = platform;
process.env.NODE_ENV = "production";

// 使用项目已有的 TypeScript，解析 SFC 导入类型；不修改 HBuilderX 安装目录。
require(path.join(compilerModules, "@dcloudio/uni-cli-shared/dist/alias"));
require(path.join(compilerModules, "module-alias")).addAlias(
  "typescript",
  path.join(project, "node_modules/typescript")
);
const startedAt = Date.now();
process.on("exit", () => {
  const output = path.join(process.env.UNI_OUTPUT_DIR, platform === "h5" ? "index.html" : "app.json");
  if (!fs.existsSync(output) || fs.statSync(output).mtimeMs < startedAt - 1000) {
    console.error("没有生成本次构建产物，请检查上方编译错误。");
    process.exitCode = 1;
  }
});
process.argv = [process.execPath, cli, "build", "-p", platform];
require(cli);
