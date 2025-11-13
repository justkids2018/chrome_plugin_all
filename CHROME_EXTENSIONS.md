# Chrome 扩展项目集合

本目录包含两个功能完整的 Chrome 扩展插件，每个都有独立的功能和用途。

## 📁 项目列表

### 1. chrome-markdown-extension
将网页内容转换为 Markdown 格式的工具。

**主要功能：**
- 一键将网页转换为 Markdown
- 智能识别主内容区域
- 支持自定义 CSS 选择器
- 广告和导航过滤
- 多种导出方式（复制/下载）
- 元数据提取（标题、URL、描述等）

**技术栈：**
- Manifest V3
- 原生 JavaScript
- 内置轻量级 HTML 转 Markdown 引擎
- Chrome Storage API

**使用场景：**
- 保存网页文章到笔记
- 收集研究资料
- 整理技术文档
- 备份博客内容

**状态：** ✅ 已完成并测试

---

### 2. todo-today-extension
今日任务管理器，带进度追踪和定时提醒。

**主要功能：**
- 添加和管理今日任务
- 设置任务截止时间
- 实时进度条和百分比
- 每小时自动提醒
- 任务到期前15分钟提醒
- 任务统计和完成百分比
- 图标徽章显示剩余任务数

**技术栈：**
- Manifest V3
- Chrome Storage API
- Chrome Alarms API
- Chrome Notifications API
- CSS 动画和渐变效果

**使用场景：**
- 每日工作计划
- 学习任务管理
- 生活事务提醒
- 时间管理追踪

**状态：** ✅ 已完成并测试

---

## 🚀 快速安装指南

### 通用安装步骤

1. **打开扩展管理页面**
   ```
   Chrome/Edge: chrome://extensions/
   ```

2. **启用开发者模式**
   - 点击页面右上角"开发者模式"开关

3. **加载扩展**
   - 点击"加载已解压的扩展程序"
   - 选择对应的扩展文件夹
   - 等待加载完成

4. **固定到工具栏**
   - 点击拼图图标 (扩展程序)
   - 找到已加载的扩展
   - 点击 📌 固定图标

### 扩展特定安装

#### Markdown 转换器
- 加载 `chrome-markdown-extension` 文件夹
- 工具栏显示 📝 蓝色 Markdown 图标
- 点击图标即可使用

#### 任务管理器
- 加载 `todo-today-extension` 文件夹
- 工具栏显示 📋 绿色 Todo 图标
- 点击图标打开任务管理界面

---

## 📖 详细文档

每个扩展都有完整的中文文档：

### chrome-markdown-extension
- `README.md` - 英文完整文档
- `功能说明.md` - 中文功能详解
- `使用说明.md` - 中文快速上手指南

### todo-today-extension
- `README.md` - 英文完整文档
- `使用说明.md` - 中文快速上手指南

---

## ⚙️ 扩展权限说明

### Markdown 转换器所需权限
- `activeTab` - 访问当前标签页内容
- `scripting` - 注入转换脚本
- `storage` - 保存用户设置

### 任务管理器所需权限
- `storage` - 保存任务数据
- `alarms` - 定时提醒功能
- `notifications` - 发送桌面通知

---

## 🎯 使用建议

### 开发环境测试
1. 使用 `chrome://extensions/` 的"加载已解压的扩展程序"
2. 修改代码后使用 "刷新" 按钮重新加载
3. 打开 Service Worker 日志查看错误信息
4. 使用浏览器开发者工具调试 popup

### 生产环境部署
如需打包为 .crx 文件：
1. 在扩展卡片上点击"打包扩展程序"
2. 选择扩展文件夹
3. 生成 .crx 安装包

---

## 🔧 故障排除

### 常见问题

**问题：扩展图标不显示**
- 检查是否已固定到工具栏
- 确认扩展已启用（开关为开启状态）
- 尝试重新加载扩展

**问题：功能无法使用**
- 检查是否已授予必要权限
- 查看 Service Worker 日志排查错误
- 尝试重新安装扩展

**问题：数据丢失**
- 检查浏览器存储是否被清理
- 确认是否开启了 Chrome 同步
- 重要数据建议定期导出备份

---

## 📝 文件结构

```
/Users/qisd/Documents/ai/test/
├── chrome-markdown-extension/     # Markdown 转换器
│   ├── manifest.json
│   ├── src/
│   │   ├── popup.html
│   │   ├── popup.js
│   │   ├── content.js
│   │   └── background.js
│   ├── lib/
│   │   └── turndown.js (可选)
│   ├── icons/
│   │   ├── icon16.png
│   │   ├── icon32.png
│   │   ├── icon48.png
│   │   └── icon128.png
│   ├── README.md
│   ├── 功能说明.md
│   └── 使用说明.md
│
├── todo-today-extension/          # 任务管理器
│   ├── manifest.json
│   ├── src/
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── background.js
│   ├── icons/
│   │   ├── icon16.png
│   │   ├── icon32.png
│   │   ├── icon48.png
│   │   └── icon128.png
│   ├── README.md
│   └── 使用说明.md
│
├── Cargo.toml                     # Rust 项目文件
├── src/                           # Rust 源代码
└── CHROME_EXTENSIONS.md           # 本文档
```

---

## 🔄 更新日志

### 2024-01-01
- ✅ 创建 chrome-markdown-extension
- ✅ 创建 todo-today-extension
- ✅ 编写完整文档
- ✅ 生成图标文件
- ✅ 测试功能正常

---

## 📞 支持与反馈

### 问题报告
- 在相应扩展目录查看详细文档
- 检查 README.md 中的故障排除部分
- 查看控制台日志获取错误信息

### 功能建议
欢迎提出改进建议，包括但不限于：
- 新功能需求
- UI/UX 改进
- 性能优化
- Bug 修复

---

## 🎉 总结

这两个 Chrome 扩展提供了实用的日常工具：

1. **Markdown 转换器** - 内容收集和整理利器
2. **任务管理器** - 时间管理和效率提升助手

两者都采用现代 Web 技术，无外部依赖，轻量高效，适合日常使用。

**立即开始使用，提升你的工作效率！** 🚀