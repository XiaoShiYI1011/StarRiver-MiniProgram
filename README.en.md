<!-- public-miniprogram-readme -->
# StarRiver WeChat Mini Program

[简体中文](README.md) · English

The WeChat Mini Program frontend for StarRiver (星河创作), built with **UniApp, Vue 3, and TypeScript**. It introduces the product and lets users link an account, view their works, check plans and benefits, and manage purchases and orders.

**StarRiver** is an AI-assisted writing product for long-form fiction and scripts. It organizes writing around works, chapters, character and world settings, story memory, and writing plans. This project provides its WeChat interface for account, work, and service information.

> This repository publishes the Mini Program frontend. Use StarRiver on a computer to write fiction and scripts. A separate backend handles generation, model access, storage, billing, and payment verification.

**Official links**

- [Official website](https://write.ydmkj.cc/)
- [GitHub](https://github.com/XiaoShiYI1011/StarRiver-MiniProgram)
- [Gitee](https://gitee.com/XiaoShiYi-1011/StarRiver-MiniProgram)
- [Feedback and contributions](https://github.com/XiaoShiYI1011/StarRiver-MiniProgram/issues)

GitHub and Gitee are official mirrors of the same project.

[Changelog](CHANGELOG.md)

## StarRiver and this repository

The full StarRiver product supports drafting and editing fiction and scripts, organizing settings and story memory, managing writing plans, and exporting saved work. These features are provided through the desktop experience and backend services. The WeChat frontend focuses on the following functions.

| Function | Frontend implementation | Requirements |
| --- | --- | --- |
| Product introduction | Capabilities, workflow, and FAQ | Static page content |
| WeChat identity and session | Sign-in, session restore, and sign-out | WeChat runtime and authentication backend |
| Account linking | Email verification code or account password | Configured account and email services |
| My works | List and overview of works for a linked account | Works API |
| Account and benefits | Account details, plan and credit information | Account and billing APIs |
| Plans and credits | Product selection, quotes, and order creation | Backend availability |
| Plan upgrades | Quotes, upgrade orders, and status display | Backend plan rules and order status |
| WeChat virtual payment | Payment invocation, cancellation handling, and order polling | WeChat capability, app configuration, and payment backend |
| Scan to purchase | Purchase entry, account linking, and checkout | Backend-issued purchase ticket |
| Order history | Orders and their current states | Orders API |
| Terms and privacy | Pages for terms, privacy, and related notices | Text applicable to your deployment |

Writing, chapter editing, and generation use the desktop workspace. The Mini Program displays work overviews. Purchase availability, payment confirmation, and benefit delivery depend on the backend. This scope was checked against source code on 2026-11-06.

## Developer quick start

### 1. Set up the tools

Install Node.js and npm, HBuilderX with the UniApp compiler and its `compile-typescript` and `compile-dart-sass` plugins, and WeChat DevTools. Use your own Mini Program AppID and a compatible backend for integration.

The first release was compiled with Node.js 22.20.0, npm 10.9.3, and HBuilderX's UniApp Vue 3 compiler 5.24.

The build scripts use the HBuilderX compiler. Install the compiler and plugins before running the build.

### 2. Install dependencies

Download or clone the repository, then run this command from its root.

```powershell
npm ci
```

### 3. Configure your backend

Create a local `.env` file or start with `.env.example`.

```dotenv
VITE_API_BASE_URL=https://your-api.example.com
VITE_DEBUG_PANEL=false
```

Replace the example with your HTTPS backend and register its domain in your WeChat request settings. Set your AppID in `manifest.json` and `project.config.json`. `VITE_` variables are available to the frontend build. Keep AppSecrets, model API keys, and payment keys on the server.

### 4. Check and build the project

```powershell
npm run type-check
npm run lint

# Replace with your HBuilderX installation path.
$env:HBUILDERX_HOME = 'D:\Apps\HBuilderX'
npm run build:mp-weixin
```

Import `unpackage/prototype-check/mp-weixin` into WeChat DevTools. You can also open the repository in HBuilderX and run it in WeChat DevTools directly.

To check page layout and styles in a browser, run `npm run build:h5` and serve `unpackage/prototype-check/h5` over HTTP. Use the WeChat environment to test login and payments.

## Project structure

| Path | Responsibility |
| --- | --- |
| `pages/` | Home and scan-to-purchase entry pages |
| `packages/account/` | Account linking, works, orders, and policy pages |
| `packages/shop/` | Plans, checkout, and payment handling |
| `api/`, `types/` | Backend endpoints and TypeScript data contracts |
| `services/auth/` | WeChat login and authentication sessions |
| `components/`, `layout/`, `composables/` | Shared UI, page layouts, and state |
| `content/`, `static/`, `styles/` | Product copy, static assets, and styles |
| `config/`, `utils/`, `scripts/` | Configuration, request handling, and build checks |

API modules define backend calls. `utils/request.ts` handles common requests, and `config/api.ts` reads the backend address. You can adapt `api/`, `types/`, and related business logic to your own backend. Account, work, order, and payment functions require a live compatible service.

## Find the implementation

| Feature | Source entry point |
| --- | --- |
| Pages and subpackages | `pages.json` |
| Product introduction | `content/home.ts` |
| WeChat sign-in and account linking | `api/miniAuth.ts`, `services/auth/` |
| Work overview and writing guidance | `packages/account/pages/novels/index.vue` |
| Checkout and payment status | `packages/shop/composables/useCheckout.ts` |
| Scan-to-purchase API | `api/miniPurchase.ts` |
| Request handling | `utils/request.ts` |
| Local build | `scripts/build-local.cjs` |

The source shows what the frontend implements. Refer to the official product website and backend responses for current availability, pricing, and plan benefits.

## FAQ

**What is StarRiver?** It is an AI-assisted writing product for long-form fiction and scripts. This repository contains its WeChat Mini Program frontend.

**Can I write fiction or scripts in the Mini Program?** Use StarRiver on a computer for writing and editing. The Mini Program provides account information, work overviews, plans, and orders.

**Can I run the complete service from this repository?** You can build the frontend. A compatible backend provides login, work data, orders, and payments. Generation and model access are handled by the StarRiver backend.

**Can I use a different backend?** Yes. Implement the expected request, data, and authentication contracts, or adapt the relevant frontend modules.

**How are source use and hosted service access governed?** The repository license governs source use. The product service terms govern hosted access, pricing, and benefits.

**How do the GitHub and Gitee repositories differ?** Both mirror the same project history. Compare the latest commit if one platform is still synchronizing.

## Contributing and feedback

Include your environment, reproduction steps, and expected and actual results when reporting an issue. Remove account, token, order, and work details from screenshots and logs.

The project is maintained in a single source repository. Maintainers review contributions and publish the resulting history to both mirrors.

- [Issues and contributions](https://github.com/XiaoShiYI1011/StarRiver-MiniProgram/issues)
- Send security reports by [email](mailto:xiaoshiyi1011@163.com).

## License and assets

The published source is licensed under the [Apache License 2.0](LICENSE).

Third-party dependencies retain their own licenses. See [NOTICE](NOTICE) for branding and assets. Configure your own brand, WeChat app, backend, and applicable terms and privacy notice when deploying a derivative app.
