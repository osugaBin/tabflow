# 添加新谱子指南

本文档介绍如何向 TabFlow 添加新的吉他谱（PDF）。

## 方法一：添加预置谱子

适用于所有用户可见的默认谱子。

### 步骤 1：放置 PDF 文件

将 PDF 文件复制到对应文件夹：

```
public/pdfs/
├── CN/          ← 中文谱子
│   └── 歌曲名.pdf
└── EN/          ← 英文谱子
    └── Song Name.pdf
```

### 步骤 2：注册谱子信息

打开 `src/App.tsx`，找到 `INITIAL_TABS` 数组，添加新条目：

```typescript
{
  id: 'unique-id',
  title: '歌曲名称',
  artist: '歌手名',
  language: 'Chinese',   // Chinese 或 English
  style: 'Pop',         // Pop / Rock / Reggae / Classic
  type: 'Guitar',       // Guitar 或 Drum
  scoreType: 'PDF',     // PDF 或 Image
  pdfUrl: '/pdfs/CN/歌曲名.pdf',
  createdAt: new Date().toISOString(),
  userId: 'default'
}
```

### 步骤 3：推送部署

```bash
git add .
git commit -m "feat: add new tabs"
git push
```

Cloudflare 会自动构建并部署。

---

## 方法二：用户上传（本地临时）

适用于单次使用的临时谱子，不会保存到云端。

### 使用界面上传

1. 点击页面右上角 **Upload PDF** 按钮
2. 选择「OR」下方的上传区域
3. 选择 PDF 或图片文件
4. 填写歌曲信息
5. 点击 **Save Tab**

**注意**：这种方式的文件只存在于浏览器会话中，刷新页面后会丢失。

---

## 字段说明

| 字段 | 可选值 | 说明 |
|------|--------|------|
| `id` | 字符串 | 唯一标识，如 `cn-1`、`en-abc123` |
| `title` | 字符串 | 歌曲名称 |
| `artist` | 字符串 | 歌手/艺术家 |
| `language` | `Chinese` / `English` | 语言 |
| `style` | `Pop` / `Rock` / `Reggae` / `Classic` | 音乐风格 |
| `type` | `Guitar` / `Drum` | 谱子类型 |
| `scoreType` | `PDF` / `Image` | 文件类型 |
| `pdfUrl` | 路径 | PDF 文件路径 |
| `userId` | 字符串 | 用户 ID，`default` 表示默认谱子 |

---

## 示例

添加一首中文摇滚歌曲：

```typescript
{
  id: 'cn-5',
  title: '海阔天空',
  artist: 'Beyond',
  language: 'Chinese',
  style: 'Rock',
  type: 'Guitar',
  scoreType: 'PDF',
  pdfUrl: '/pdfs/CN/海阔天空.pdf',
  createdAt: new Date().toISOString(),
  userId: 'default'
}
```

添加一首英文流行歌曲：

```typescript
{
  id: 'en-9',
  title: 'Perfect',
  artist: 'Ed Sheeran',
  language: 'English',
  style: 'Pop',
  type: 'Guitar',
  scoreType: 'PDF',
  pdfUrl: '/pdfs/EN/Perfect.pdf',
  createdAt: new Date().toISOString(),
  userId: 'default'
}
```

---

## 文件命名规范

- 使用英文或拼音命名，避免特殊字符
- 文件名建议：`歌手 - 歌曲名.pdf`
- 路径示例：`/pdfs/CN/Beyond - 海阔天空.pdf`
