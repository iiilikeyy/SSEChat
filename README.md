# 流式聊天应用 (React + AntD + SSE)

一个基于 React + Ant Design 实现的简易 Chat 小应用，通过 SSE（Server-Sent Events）接收模型的流式回复。

## 功能特性

- ✅ 基础 Chat 界面
  - 聊天记录列表（区分用户与 AI）
  - 文本输入框 + 发送按钮
  - 支持多轮对话
  - 新消息出现时自动滚动到底部
- ✅ 真实流式回复
  - 前端逐段展示 AI 回复（打字机效果）
  - 使用 SSE 实现真正的流式传输
- ✅ 状态与交互
  - 正在生成时，发送按钮变为 "停止生成"
  - 用户可点击停止按钮主动中断 SSE
  - UI 中显示 "正在生成中" 提示
- ✅ 异常与边界情况处理
  - 网络中断（SSE 流中途中断）
  - 请求超时
  - 服务端异常（4xx / 5xx）
  - SSE 数据格式错误（JSON 解析失败）
  - 用户主动停止生成（生成内容保留已有部分）
  - 消息失败后支持重试

## 技术栈

- **前端**: React 19 + TypeScript + Ant Design 6
- **构建工具**: Vite
- **后端**: Node.js + Express + SSE
- **开发工具**: ESLint

## 项目结构

```
├── src/
│   ├── components/          # React 组件
│   │   └── Chat.tsx         # 聊天组件
│   ├── hooks/               # 自定义 Hooks
│   │   └── useChatStream.ts # 流式聊天逻辑
│   ├── App.tsx              # 应用入口组件
│   ├── App.css              # 应用样式
│   ├── index.tsx            # 应用入口文件
│   └── index.css            # 全局样式
├── server/                  # 后端服务
│   └── server.ts            # SSE 服务器
├── package.json             # 项目依赖
├── tsconfig.json            # TypeScript 配置
├── vite.config.ts           # Vite 配置
└── README.md                # 项目说明
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动应用

#### 方式一：同时启动前端和后端（推荐）

```bash
npm run start
```

- 前端服务将运行在 http://localhost:5174
- 后端 SSE 服务将运行在 http://localhost:3001

#### 方式二：分别启动前端和后端

**启动前端**：
```bash
npm run dev
```

**启动后端**：
```bash
npm run server
```

### 3. 访问应用

在浏览器中打开 http://localhost:5174 即可使用应用。

## 核心实现

### 1. 自定义 Hook: useChatStream

将流式聊天逻辑封装为自定义 Hook，提供以下功能：

- 发送消息并启动 SSE 流
- 处理 SSE 消息事件
- 处理 SSE 错误和关闭事件
- 支持停止生成和重试功能
- 管理聊天消息状态

### 2. SSE 后端实现

使用 Express 搭建 SSE 服务，模拟流式返回 AI 回复：

- 设置正确的 SSE 响应头
- 分块发送响应数据
- 支持随机延迟模拟真实 AI 生成
- 支持错误场景模拟

### 3. 前端组件设计

- **Chat 组件**: 负责聊天界面的渲染和交互
  - 聊天记录列表
  - 消息输入框
  - 发送/停止按钮
  - 错误提示和重试功能

## 开发说明

### 代码规范

- 使用 TypeScript 编写类型安全的代码
- 使用 ESLint 进行代码检查
- 组件适度拆分，保持代码结构清晰
- 遵循 React 最佳实践

### 测试异常场景

- **网络中断**: 可以通过浏览器开发者工具模拟网络中断
- **请求超时**: 可以修改后端代码增加延迟
- **服务端异常**: 可以访问 /api/chat/error 端点测试
- **数据格式错误**: 可以修改后端代码返回错误的 JSON 格式

## 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

## 预览生产版本

```bash
npm run preview
```

## 许可证

MIT
