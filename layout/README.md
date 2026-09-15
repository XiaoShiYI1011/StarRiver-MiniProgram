# 通用页面组件

`components/pageContainer.vue` 参考 Web 页面容器的具名插槽，使用 UniApp 原生组件实现。配色、品牌栏和底部浮层外观来自 `PrototypeDesign`。

请显式以 `AppPage` 导入，**不要使用 `<page-container>` 标签**，避免与微信原生同名组件冲突。首页、商城和账号分包均已接入真实后端数据；分包结构见 [项目说明](../README.md)。

## 页面配置

使用自定义导航的页面在 `pages.json` 中设置 `navigationStyle: "custom"` 和 `disableScroll: true`。容器占满可用窗口，顶部区域和底部区域不滚动，只有中间内容滚动。

保留原生导航的页面传 `:show-navigation="false"`。使用原生 tabBar 时传 `:safe-area-bottom="false"` 并不提供 `tabBar` 插槽，避免重复预留安全区。

## 基本使用

```vue
<template>
  <AppPage title="绑定账号" subtitle="权益与网页端同步" show-back @back-fallback="goHome">
    <template #mainContent>
      <view>这里放置业务表单</view>
    </template>
    <template #pageFooter>
      <button @tap="submit">绑定并登录</button>
    </template>
    <template #dialogContainer>
      <!-- 放置业务弹窗组件，与滚动内容处于同级 -->
    </template>
  </AppPage>
</template>

<script setup lang="ts">
import AppPage from "@/layout/components/pageContainer.vue";

const submit = () => { /* 校验及提交由业务页面实现 */ };
const goHome = () => uni.reLaunch({ url: "/pages/index/index" });
</script>
```

## 属性

| 属性 | 默认值 | 用途 |
| --- | --- | --- |
| `title` / `subtitle` | 星河创作 / 让长篇故事持续生长 | 导航文字，副标题传空字符串可隐藏 |
| `logo` | `/static/brand/studio-logo.png` | 品牌图标，传空字符串隐藏；返回按钮出现时隐藏 |
| `showNavigation` | `true` | 是否渲染自定义导航及状态栏占位 |
| `showBack` | `false` | 显示返回按钮 |
| `autoBack` | `true` | 返回按钮自动调用 `uni.navigateBack`；自定义行为时关闭 |
| `showThemeToggle` | `true` | 显示深浅主题切换按钮 |
| `safeAreaBottom` | `true` | 在容器底部统一预留安全区，内容和底栏无需另加 |
| `contentPadding` | `28rpx` | 内容内边距；全宽自定义布局传 `0` |
| `scrollTop` | `0` | 滚动位置，单位 px |
| `scrollIntoView` | `""` | 内容中目标元素的 id；重复定位时先清空并等待 `nextTick` |
| `scrollWithAnimation` | `true` | 程序控制滚动时是否动画 |
| `lowerThreshold` | `80` | 距底部多少 px 触发 `reachBottom` |
| `refresherEnabled` | `false` | 开启 scroll-view 下拉刷新 |
| `refresherTriggered` | `false` | 父页面控制刷新状态，请求结束后设回 false |

## 插槽

| 插槽 | 位置 / 行为 |
| --- | --- |
| `navigationBar` | 替换整个导航行；仍保留状态栏与微信原生胶囊避让 |
| `navigationActions` | 默认导航右侧附加操作，位于主题按钮前；窄屏请控制操作数量 |
| `pageHeader` | 导航下方固定区域，如页面标题、提示信息 |
| `tabContainer` | 固定的业务分段标签区 |
| `searchContainer` / `tableActionBar` | 固定搜索区 / 操作区，名称与参考组件保持一致 |
| `mainContent` / 默认插槽 | 可滚动内容，提供 mainContent 时优先使用它 |
| `pagePagination` | 内容末尾的加载更多、分页或结束提示，随内容滚动 |
| `pageFooter` | 固定底部操作栏，适合保存或提交按钮 |
| `tabBar` | 固定底部浮层外壳，适合原型的首页 / 套餐 / 我的导航 |
| `dialogContainer` | 滚动区外弹窗挂载位置；弹窗应自行实现 fixed 定位和层级 |

未提供插槽的固定区域不占空间。组件没有桌面侧栏、权限 Tab、Element Plus 依赖或页面类型枚举：默认页、标签页、编辑页通过插槽组合实现。

底部导航示例（`items` 和 `openTab` 由业务页面提供）：

```vue
<template #tabBar>
  <view class="tabs">
    <button v-for="item in items" :key="item.path" @tap="openTab(item)">
      {{ item.label }}
    </button>
  </view>
</template>
```

容器只提供导航外壳，不内置尚未注册的业务路由。`items` 应引用 `pages.json` 中真实存在的页面；原生 tabBar 页面使用 `uni.switchTab`，普通页面按业务需要选择 `navigateTo` 或 `redirectTo`。

## 事件及刷新

- `back`：点击返回时通知父页面。默认随后自动返回；要完全接管，设置 `autoBack=false`。
- `backFallback`：无上一页或返回失败，由父页面决定前往首页等行为，容器不硬编码路由。
- `themeChange(theme)`：用户点击主题按钮后触发，参数为 `light` 或 `dark`。
- `scroll`、`reachBottom`、`refresh`、`refresherRestore`、`refresherAbort`：透传对应 scroll-view 原始事件。

```vue
<AppPage :refresher-enabled="true" :refresher-triggered="refreshing" @refresh="reload" @reach-bottom="loadMore">
  <!-- 列表内容 -->
</AppPage>
```

`reload` 中应设置 `refreshing=true` 并在 `finally` 中恢复为 false；加载更多应自行保护重复请求、处理失败及没有更多数据。滚动发生在组件内部，因此使用组件的 `refresh/reachBottom/scroll`，不要依赖页面级 `onPullDownRefresh/onReachBottom/onPageScroll` 或 `uni.pageScrollTo`。未内置 loading / error / empty 业务状态，可放入内容插槽。

## 主题与安全区

主题在页面间共享，手动选择保存到 `nwa-page-theme`；默认跟随系统，存储失败时保持当前会话可用。微信已在 `manifest.json` 开启 `darkmode`；H5 监听系统媒体查询。其他平台默认浅色，仍支持手动切换。

```ts
import { resolvedPageTheme, setPageTheme } from "@/composables/usePageTheme";

setPageTheme("auto"); // 恢复跟随系统，也可传 light / dark
```

插槽内容可使用容器继承的 CSS 变量：`--page`、`--paper-raised`、`--paper-inset`、`--surface-strong`、`--ink`、`--ink-soft`、`--ink-faint`、`--line`、`--accent`、`--accent-wash`、`--shadow-float`。内容组件应使用这些变量，避免硬编码白底黑字。主题变量只作用于容器后代，不会给挂在页面外的原生弹窗自动换肤。

导航根据 微信原生同步 `wx.getWindowInfo()` 和 `wx.getMenuButtonBoundingClientRect()` 计算状态栏高度及右侧避让；窗口尺寸变化时重新测量，无效胶囊数据有保守回退。原生胶囊无需再绘制。底部安全区通过 `env(safe-area-inset-bottom)` 统一占位。小程序软键盘、原生 tabBar 和 iOS 安全区仍建议在目标真机验收。

平台依据：[scroll-view](https://uniapp.dcloud.net.cn/component/scroll-view.html)、[DarkMode](https://uniapp.dcloud.net.cn/tutorial/darkmode)、[页面配置](https://uniapp.dcloud.net.cn/collocation/pages)。

## 验证

项目的 `vue` 和 `@vue/shared` 固定为 `3.4.21`，与当前 DCloud 编译器及 `uni-h5-vue` 对齐。显式声明 `@vue/shared` 避免类型工具将 Vue 3.5 的辅助方法提升到根依赖，造成插槽更新时的只读属性异常。升级时应同时升级 DCloud 工具链与配套 Vue 版本。

在 UniApp 项目目录执行 `npm run type-check`、`npm run lint`。使用 HBuilderX 运行微信小程序，检查主题切换、首页定位、内容滚动、胶囊避让；编辑页接入时再检查底部按钮、刷新完成和返回兜底。
