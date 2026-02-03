# HealthReminder 健康提醒助手

Mac 桌面端健康提醒应用，定时提醒久坐办公族进行 4 种小活动：站起来、喝水、提肛、颈椎运动。

## 技术栈

- **Electron** + **React** + **TypeScript**
- **Vite** 构建
- **Tailwind CSS** 样式
- **Zustand** 状态管理
- **electron-store** 本地持久化
- **lucide-react** 图标
- **date-fns** 时间处理

## 项目结构

```
health-reminder/
├── src/
│   ├── main/              # Electron 主进程
│   │   └── index.ts
│   ├── renderer/          # React 渲染进程
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.html
│   │   └── index.css
│   └── shared/            # 共享类型与工具
│       └── types.ts
├── package.json
├── tsconfig.json
├── tsconfig.main.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式（先编译主进程，再启动 Vite + Electron）
npm run dev

# 构建生产版本
npm run build
```

构建完成后，可执行文件在 `dist/` 下；运行应用需先执行 `npm run build`，再通过 Electron 加载 `dist/main/index.js`（或使用 electron-builder 等打包成 .app）。

## 脚本说明

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发模式：编译主进程 → 启动 Vite 开发服务器 → 启动 Electron 并加载本地页面 |
| `npm run build` | 构建：编译主进程到 `dist/main`，Vite 构建渲染进程到 `dist/renderer` |
| `npm run build:main` | 仅编译 Electron 主进程 |
| `npm run preview` | 仅预览 Vite 构建后的渲染端（不启动 Electron） |

## 当前状态

- 已完成项目脚手架与 Hello World 窗口（800×600，标题「健康提醒助手」）
- 欢迎页展示项目名称与 4 种活动说明
- 后续可在此基础上添加提醒逻辑、设置页与托盘等
