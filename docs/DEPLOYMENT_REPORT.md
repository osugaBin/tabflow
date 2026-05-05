# TabFlow 项目部署报告

**项目**: TabFlow - Guitar Tab Manager  
**部署平台**: Cloudflare Pages  
**部署地址**: https://tabflow-2aw.pages.dev  
**完成日期**: 2026-05-05

---

## 一、项目概述

TabFlow 是一个吉他谱管理应用，支持：
- PDF 谱子浏览
- 收藏夹功能
- 筛选（语言/风格）
- 深色/浅色主题切换
- Firebase 云同步

## 二、技术栈

| 技术 | 版本 |
|------|------|
| React | 19.0.1 |
| Vite | 6.2.3 |
| Tailwind CSS | 4.1.14 |
| Firebase | 12.12.1 |
| Lucide React | 0.546.0 |

## 三、部署配置

### 3.1 wrangler.toml

```toml
name = "tabflow"
compatibility_date = "2024-01-01"
pages_build_output_dir = "dist"
```

### 3.2 Cloudflare Dashboard 设置

| 配置项 | 值 |
|--------|-----|
| Build command | `npm install && npm run build` |
| Build output directory | `dist` |
| Production branch | main |
| Framework | None (Vite) |

### 3.3 环境变量

Firebase 配置使用 Vite 环境变量：

```env
VITE_FIREBASE_PROJECT_ID=gen-lang-client-0223754291
VITE_FIREBASE_APP_ID=1:927511382436:web:1bfd9a33e37d97047fd931
VITE_FIREBASE_API_KEY=AIzaSyAuo8BhsyG6PXz-35335rtv2fGp3T_5xTw
VITE_FIREBASE_AUTH_DOMAIN=gen-lang-client-0223754291.firebaseapp.com
VITE_FIREBASE_DB_ID=ai-studio-ea11382d-9a18-409e-b24f-c8f73f3539ee
VITE_FIREBASE_STORAGE_BUCKET=gen-lang-client-0223754291.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=927511382436
```

## 四、部署步骤

### 4.1 准备工作

1. 确保 GitHub 仓库已连接 Cloudflare Pages
2. 配置生产分支为 `main`

### 4.2 推送代码

```bash
git add .
git commit -m "feat: deploy to Cloudflare Pages"
git push origin main
```

### 4.3 Cloudflare 自动构建

Cloudflare 会自动：
1. 克隆仓库
2. 安装依赖 (`npm install`)
3. 执行构建 (`npm run build`)
4. 部署到全球网络

### 4.4 手动触发部署

如需手动部署：
1. 进入 Cloudflare Dashboard
2. Pages > tabflow 项目
3. 点击「创建新部署」或「重试部署」

## 五、常见问题

### Q1: dist 目录不存在
**原因**: `.gitignore` 排除了 `dist`  
**解决**: Cloudflare 会自动构建，无需担心

### Q2: wrangler.toml 报错
**错误**: `Configuration file for Pages projects does not support "build"`  
**解决**: 移除 `[build]` 区块，只保留基础配置

### Q3: Firebase 配置找不到
**原因**: `firebase-applet-config.json` 被 .gitignore 忽略  
**解决**: 改用环境变量 (`.env` 文件)

## 六、部署验证

- 访问 https://tabflow-2aw.pages.dev
- 验证页面正常加载
- 测试主题切换功能
- 确认 Firebase 连接正常

## 七、后续维护

- 代码推送后自动部署
- 如需回滚，在 Cloudflare Pages 控制台选择历史版本
- 环境变量变更需要在 Cloudflare Dashboard 中手动更新

---

**报告生成时间**: 2026-05-05 20:35
