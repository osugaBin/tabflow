# 🎸 STRUM.ARCHIVE

> 吉他琴谱管理应用 | Guitar Tab Archive

一个优雅的吉他琴谱管理工具，支持 PDF 预览、收藏夹管理、中英文歌曲分类筛选。

![Preview](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

## ✨ 功能特点

- 📄 **PDF 预览** - 内置 PDF 阅读器，支持琴谱在线查看
- 🌎 **双语支持** - 中文/英文歌曲分类管理
- ❤️ **收藏夹** - 收藏你喜欢的琴谱
- 🔍 **快速搜索** - 按歌曲名或艺术家搜索
- 📱 **响应式设计** - 适配桌面端和移动端
- ☁️ **云端同步** - Firebase 实时同步（需配置）
- 🎸 **节奏控制器** - 内置 BPM 节奏练习工具

## 🚀 快速开始

### 本地运行

```bash
# 克隆项目
git clone <your-repo-url>
cd tabflow

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
npm run preview
```

## 📁 项目结构

```
├── src/                  # React 源代码
│   ├── components/       # UI 组件
│   ├── lib/              # 工具函数和配置
│   ├── App.tsx           # 主应用组件
│   └── types.ts          # TypeScript 类型定义
├── public/
│   └── pdfs/             # 琴谱文件
│       ├── EN/           # 英文歌曲
│       └── CN/           # 中文歌曲
├── EN/                   # 英文琴谱源文件
├── CN/                   # 中文琴谱源文件
└── components.json       # shadcn/ui 组件配置
```

## 🎵 添加新琴谱

### 1. 放置 PDF 文件

| 语言 | 目录 |
|------|------|
| 🇺🇸 英文歌曲 | `public/pdfs/EN/` |
| 🇨🇳 中文歌曲 | `public/pdfs/CN/` |

### 2. 更新代码

在 `src/App.tsx` 的 `INITIAL_TABS` 数组中添加：

```tsx
{
  id: 'unique-id',
  title: '歌曲名称',
  artist: '艺术家',
  language: 'English',  // 或 'Chinese'
  style: 'Pop',          // Pop / Rock / Reggae / Classic
  type: 'Guitar',
  scoreType: 'PDF',
  pdfUrl: '/pdfs/EN/your-song.pdf',  // 路径与文件名一致
  createdAt: new Date().toISOString(),
  userId: 'default'
}
```

## 🛠️ 技术栈

- **框架** - React 19 + TypeScript
- **构建** - Vite 6
- **样式** - Tailwind CSS 4 + shadcn/ui
- **动画** - Motion
- **图标** - Lucide React
- **数据库** - Firebase Firestore（可选）
- **PDF** - react-pdf

## ⚙️ 配置

### Firebase（可选）

如需启用云端同步，创建 `.env.local` 文件：

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### Gemini API（可选）

```env
VITE_GEMINI_API_KEY=your-gemini-api-key
```

## 📄 许可证

MIT License

---

Made with 🎸 by TabFlow
