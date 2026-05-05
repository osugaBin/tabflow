# Cloudflare Pages 部署技能文档

## 技能名称

`cloudflare-pages-deploy`

## 技能描述

帮助用户将 React/Vite 项目部署到 Cloudflare Pages，包含配置检查、问题诊断和部署指导。

## 触发条件

当用户请求以下操作时触发：
- "部署到 Cloudflare Pages"
- "deploy to CF"
- "发布到 cloudflare"
- "部署网站"
- 涉及 Cloudflare Pages 相关问题

## 工作流程

### 1. 检查项目配置

```bash
# 检查关键文件
ls -la wrangler.toml .gitignore .env
```

### 2. 必要配置文件

#### wrangler.toml
```toml
name = "your-project-name"
compatibility_date = "2024-01-01"
pages_build_output_dir = "dist"
```

**注意**: 不要包含 `[build]` 区块，Cloudflare Pages 不支持。

#### .gitignore
确保包含：
```
dist/
node_modules/
.env
```

#### package.json
确保包含 build 脚本：
```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

### 3. Cloudflare Dashboard 配置

| 配置项 | 推荐值 |
|--------|--------|
| Build command | `npm install && npm run build` |
| Build output directory | `dist` |
| Production branch | main |

### 4. 敏感配置处理

使用环境变量而非本地 JSON 文件：

```typescript
// ❌ 不推荐
import config from './config.json'

// ✅ 推荐
const apiKey = import.meta.env.VITE_API_KEY
```

### 5. GitHub 集成

1. 连接 GitHub 仓库
2. 设置生产分支
3. 启用自动部署

## 常见问题诊断

### 问题 1: dist 目录不存在
```
Error: Output directory "dist" not found.
```
**原因**: `.gitignore` 排除了 `dist`  
**解决**: 无需处理，Cloudflare 会自动构建

### 问题 2: wrangler.toml 格式错误
```
✘ [ERROR] Running configuration file validation for Pages
Configuration file for Pages projects does not support "build"
```
**原因**: wrangler.toml 包含不支持的配置  
**解决**: 移除 `[build]` 区块

### 问题 3: 构建失败 - 找不到文件
```
Could not resolve "xxx.json"
```
**原因**: 配置文件被 .gitignore 忽略  
**解决**: 改用环境变量

### 问题 4: 页面空白
**可能原因**:
1. SPA 路由未配置
2. 静态资源路径错误
3. JavaScript 加载失败

**解决**:
- 检查浏览器控制台错误
- 确认 `base: '/'` 在 vite.config.ts 中
- 验证 assets 路径正确

## 部署检查清单

- [ ] wrangler.toml 已创建
- [ ] .gitignore 正确配置
- [ ] 环境变量已设置
- [ ] package.json build 脚本正常
- [ ] GitHub 仓库已连接
- [ ] Cloudflare Dashboard 配置完成

## 参考命令

```bash
# 本地构建测试
npm run build

# 本地预览
npm run preview

# 推送到 GitHub
git add .
git commit -m "feat: deploy"
git push

# 手动触发 Cloudflare 部署
# (在 Cloudflare Dashboard 中操作)
```

## 示例项目结构

```
project/
├── wrangler.toml          # Cloudflare 配置
├── package.json           # 项目配置
├── vite.config.ts         # Vite 配置
├── .env                   # 环境变量 (不提交)
├── .gitignore             # Git 忽略规则
├── src/                   # 源代码
├── public/                # 静态资源
└── dist/                  # 构建输出 (不提交)
```

## 相关文档

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Wrangler 配置参考](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)
