# Chrome Plugin All - 项目上下文

> Chrome 扩展插件集合 + Claude Code 自动化开发工作流

## 快速概览

**项目类型**: Chrome 扩展开发 + AI 辅助开发工具
**技术栈**: JavaScript, Chrome Extension API, Claude Code
**开发工作流**: 自动化 5 阶段开发流程（需求 → 架构 → UI → 实现 → 审查 → 学习）

## 项目结构

```
chrome_plugin_all/
├── chrome-task-extension/       # 主要 Chrome 扩展
│   ├── manifest.json
│   ├── sidepanel.html/js        # 侧边栏功能
│   ├── popup.html               # 弹窗
│   └── background.js            # 后台脚本
│
├── .claude/                     # Claude Code 配置
│   ├── skills/                  # 5 个开发阶段的知识库
│   ├── commands/dev.md          # 自动化开发流程
│   └── agents/skill-learner.md  # 自学习优化
│
└── docs/                        # 工作流产物
    ├── requirements/            # 需求文档
    ├── architecture/            # 架构设计
    ├── design/                  # UI 设计
    └── reviews/                 # 代码审查报告
```

## 核心命令

### 开发工作流
```bash
# 完整开发流程（需求 → 实现 → 审查）
/dev 添加搜索功能

# 跳过某些阶段
/dev 添加XX功能 --skip-design

# 只做代码审查
/dev --review-only
```

### 手动触发 Skills
```bash
# 需求澄清
Use requirement-clarification skill to clarify search feature

# 代码审查
Use code-review skill to review recent changes

# 自学习优化
Use skill-learner agent to optimize skills
```

## 开发规范

### Chrome 扩展开发
- **Manifest V3** 标准
- 使用 `chrome.storage` 存储数据
- 侧边栏优先于弹窗（更好的用户体验）
- 权限最小化原则

### JavaScript 规范
- 使用现代 ES6+ 语法
- 避免全局变量污染
- 优先使用 `const`，需要修改时用 `let`
- 函数命名：camelCase，描述性命名

### 文件命名
- HTML: kebab-case (sidepanel.html)
- JS: camelCase (sidepanel.js)
- 配置文件: 小写 (manifest.json)

## 自动化工作流说明

### 5 阶段开发流程

```
Phase 1: Requirement Clarification (需求澄清)
  → 3 个核心问题
  → 生成需求文档 → docs/requirements/

Phase 2: Architecture Design (架构设计)
  → 数据模型、API、状态管理
  → 生成架构文档 → docs/architecture/

Phase 3: UI Design (UI 设计)
  → 组件设计、交互、视觉
  → 生成 UI 文档 → docs/design/

Phase 4: Code Implementation (代码实现)
  → 遵循编码规范
  → 实现功能

Phase 5: Code Review (代码审查)
  → 15 项质量检查
  → 生成审查报告 → docs/reviews/

Phase 6: Auto Learning (自动学习)
  → 分析常见问题
  → 优化 skills
  → 保存学习案例 → docs/learnings/
```

### Skills 自动激活

Claude 会根据你的输入自动激活相关 skills：

| 输入关键词 | 自动激活的 Skill |
|-----------|-----------------|
| "添加功能", "实现", "新增" | requirement-clarification |
| "设计架构", "数据模型" | architecture-design |
| "UI 设计", "界面" | ui-design-system |
| "写代码", "实现" | code-implementation |
| "review", "检查代码" | code-review |

## Chrome 扩展特定知识

### 常用 API

**Storage API**:
```javascript
// 保存数据
chrome.storage.local.set({ key: value });

// 读取数据
chrome.storage.local.get(['key'], (result) => {
  console.log(result.key);
});
```

**Message Passing**:
```javascript
// 发送消息
chrome.runtime.sendMessage({ action: 'doSomething' });

// 接收消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'doSomething') {
    // 处理
    sendResponse({ success: true });
  }
});
```

**Side Panel API**:
```javascript
// 打开侧边栏
chrome.sidePanel.open({ windowId: currentWindowId });

// 侧边栏配置（manifest.json）
"side_panel": {
  "default_path": "sidepanel.html"
}
```

### 调试技巧

1. **检查扩展**:
   - chrome://extensions/
   - 开启"开发者模式"
   - 点击"刷新"重新加载

2. **查看日志**:
   - Service Worker: 点击"Service Worker"链接
   - Popup: 右键 → 检查
   - Side Panel: F12 开发者工具

3. **权限问题**:
   - 检查 manifest.json 的 permissions
   - 确保 host_permissions 包含目标域名

## 关键约束

### 必须遵守
- ❗ **不要**在 main 分支直接修改（如果配置了 hook）
- ❗ **不要**使用 `var`，使用 `const`/`let`
- ❗ **不要**忽略错误，所有异步操作需要 try-catch
- ❗ **不要**跳过代码审查，实现后必须 review

### 推荐做法
- ✅ 使用 `/dev` 命令开始新功能开发
- ✅ 每个功能生成需求文档和设计文档
- ✅ 代码审查后根据建议修改
- ✅ 让 skill-learner 自动优化工作流

## 项目目标

1. **短期目标**:
   - 完善现有 Chrome 扩展功能
   - 验证自动化开发工作流的有效性
   - 积累足够的 learnings 数据

2. **长期目标**:
   - 建立可复用的开发模式库
   - 将工作流推广到其他项目
   - 持续优化 skills，提升开发效率

## 常见任务

### 添加新功能
```bash
/dev 添加用户设置页面
```

### 修复 Bug
```bash
# 1. 描述问题
Use requirement-clarification skill: 侧边栏无法加载数据

# 2. 修复代码
[手动修复或让 Claude 修复]

# 3. 审查
Use code-review skill
```

### 重构代码
```bash
# 1. 说明重构目标
Use architecture-design skill: 重构存储层

# 2. 实现重构
[实现]

# 3. 审查
Use code-review skill
```

## 学习资源

- Chrome Extension 官方文档: https://developer.chrome.com/docs/extensions/
- Manifest V3 迁移指南: https://developer.chrome.com/docs/extensions/mv3/intro/
- Claude Code 文档: https://docs.anthropic.com/claude/docs/claude-code

## 注意事项

1. **性能**: Chrome 扩展运行在用户浏览器中，注意性能开销
2. **权限**: 只申请必要的权限，否则用户会拒绝安装
3. **安全**: 不要在客户端存储敏感信息
4. **兼容性**: 测试不同 Chrome 版本的兼容性

---

**提示**: 开发新功能时，使用 `/dev` 命令让 Claude 引导你完成整个流程。
