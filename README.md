# HealthReminder 健康提醒助手

Mac 桌面端健康提醒应用，定时提醒久坐办公族进行 4 种小活动：**站起来、喝水、提肛、颈椎运动**。

---

## 核心功能（已实现）

| 功能 | 说明 |
|------|------|
| **4 种提醒** | 站立（45 分钟）、喝水（60 分钟）、提肛（90 分钟）、颈椎（60 分钟），每种可单独开关 |
| **菜单栏图标** | 托盘 Tray 常驻菜单栏，左键打开主窗口，右键菜单操作 |
| **开始 / 暂停** | 右键托盘 →「开始提醒」或「暂停提醒」，状态持久化，重启后保持 |
| **系统通知** | 到点弹出 macOS 系统通知，点击通知可唤起主窗口 |
| **主窗口** | 欢迎页 + 使用说明，关闭窗口不退出，从托盘可再次打开 |
| **本地持久化** | 提醒配置与运行状态由 electron-store 保存，重启不丢失 |

---

## 开发进度

### 已完成（阶段 1）

- [x] 项目脚手架：Electron + React + TypeScript + Vite + Tailwind
- [x] 主窗口（800×600）与欢迎页
- [x] 数据模型：`ReminderType`、`ReminderConfig`、`CompletionRecord`（`src/shared/types.ts`）
- [x] 提醒管理器：4 种提醒独立定时、Mac 系统通知、开始/停止（`src/main/reminderManager.ts`）
- [x] 菜单栏 Tray：图标、右键菜单（开始/暂停、设置、退出）、运行/暂停状态区分
- [x] 默认配置与 electron-store 持久化
- [x] IPC：`start-reminders`、`stop-reminders`、`get-reminder-status`
- [x] 开发体验：窗口快速显示、加载失败仅主框架重试、成功后移除监听避免误重载

### 待规划

- [ ] 设置页：在渲染进程中配置各提醒间隔、开关、勿扰时段等
- [ ] 完成记录与统计（可选）
- [ ] 打包为 .app（如 electron-builder）

---

## 技术栈

- **Electron** + **React** + **TypeScript**
- **Vite** 构建（渲染进程）
- **Tailwind CSS** 样式
- **Zustand** 状态管理（渲染进程，待接入设置页）
- **electron-store** 本地持久化
- **lucide-react** 图标（可选）
- **date-fns** 时间处理（可选）

---

## 项目结构

```
health-reminder/
├── src/
│   ├── main/                  # Electron 主进程
│   │   ├── index.ts           # 入口、窗口、Tray、IPC
│   │   ├── reminderManager.ts # 提醒定时与通知
│   │   └── trayIcons.ts       # 托盘图标
│   ├── renderer/              # React 渲染进程
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.html
│   │   └── index.css
│   └── shared/
│       └── types.ts           # 共享类型
├── dist-electron/             # 主进程编译输出（tsc）
├── dist/renderer/             # 渲染进程构建输出（Vite）
├── package.json
├── tsconfig.json              # 渲染进程 TS
├── tsconfig.main.json         # 主进程 TS
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

---

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式（编译主进程 + 同时启动 Vite 与 Electron）
npm run dev

# 构建生产版本
npm run build
```

- **开发**：主进程入口为 `dist-electron/main/index.js`，渲染进程由 Vite 在 `http://localhost:5173` 提供。
- **生产**：构建后主进程在 `dist-electron/`，渲染静态资源在 `dist/renderer/`；可通过 `electron .` 运行或再使用 electron-builder 打包为 .app。

---

## 脚本说明

| 命令 | 说明 |
|------|------|
| `npm run dev` | 编译主进程后，并发启动 Vite 与 Electron，窗口加载开发服务器 |
| `npm run build` | 编译主进程 + Vite 构建渲染进程到 `dist/renderer` |
| `npm run build:main` | 仅编译主进程到 `dist-electron` |
| `npm run preview` | 仅预览 Vite 构建后的渲染端（不启动 Electron） |

---

## 使用说明

1. **启动应用**：运行 `npm run dev` 或运行打包后的应用，菜单栏会出现托盘图标。
2. **开始提醒**：右键托盘图标 →「开始提醒」，到点会收到系统通知。
3. **暂停提醒**：右键托盘图标 →「暂停提醒」。
4. **打开主窗口**：左键点击托盘图标，或右键 →「设置」。
5. **退出**：右键托盘图标 →「退出」（关闭主窗口只会隐藏，不会退出）。
