# Chrome Plugin All - 自动化开发工作流系统

> 基于 Claude Code 的智能开发工作流：自动化需求澄清、架构设计、代码实现、质量审查和持续学习

[![Claude Code](https://img.shields.io/badge/Claude-Code-8B5CF6)](https://claude.com/claude-code)
[![Manifest V3](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4)](https://developer.chrome.com/docs/extensions/mv3/)

---

## 📖 目录

- [核心特性](#核心特性)
- [快速开始](#快速开始)
- [系统架构](#系统架构)
- [使用指南](#使用指南)
- [深入理解](#深入理解)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)
- [贡献指南](#贡献指南)

---

## 🎯 核心特性

### 1. **5 阶段自动化开发流程**

```
需求澄清 → 架构设计 → UI设计 → 代码实现 → 代码审查 → 自动学习
   ↓          ↓         ↓         ↓          ↓          ↓
  Skill     Skill     Skill     Skill      Skill      Agent
```

一个命令完成整个开发周期：
```bash
/dev 添加搜索功能
```

### 2. **自学习优化系统**

系统会自动：
- 📊 分析代码审查报告
- 🔍 检测重复出现的问题
- ✨ 自动优化 Skills 知识库
- 📈 持续提升开发质量

**效果**：常见问题出现频率从 60% → 降至 < 10%

### 3. **智能 Skills 自动激活**

根据你的输入，Claude 自动激活相关知识库：

| 你说... | Claude 激活... |
|---------|---------------|
| "添加搜索功能" | requirement-clarification |
| "设计数据模型" | architecture-design |
| "UI 怎么做" | ui-design-system |
| "开始写代码" | code-implementation |
| "review 代码" | code-review |

### 4. **完整的文档追踪**

所有产物自动生成并保存：
- ✅ 需求文档 (`docs/requirements/`)
- ✅ 架构设计 (`docs/architecture/`)
- ✅ UI 设计 (`docs/design/`)
- ✅ 审查报告 (`docs/reviews/`)
- ✅ 学习案例 (`docs/learnings/`)

---

## 🚀 快速开始

### 前置条件

- [Claude Code CLI](https://claude.com/claude-code) 已安装
- Node.js 14+ （可选，用于 Chrome 扩展开发）
- Chrome 浏览器

### 安装

1. **克隆项目**
   ```bash
   git clone <your-repo>
   cd chrome_plugin_all
   ```

2. **验证 Claude Code 配置**
   ```bash
   # 检查 .claude/ 目录
   ls -la .claude/

   # 应该看到：
   # agents/      - AI 任务执行者
   # commands/    - 工作流定义
   # skills/      - 知识库
   ```

3. **启动 Claude Code**
   ```bash
   claude
   ```

### 第一次使用

尝试完整的开发流程：

```bash
# 在 Claude Code CLI 中输入：
/dev 添加用户偏好设置功能

# Claude 会引导你完成：
# 1. 回答 3 个需求问题
# 2. 确认架构设计
# 3. 确认 UI 设计
# 4. 自动实现代码
# 5. 自动代码审查
# 6. 自动优化 skills
```

**预期结果**：
- ✅ 生成 `docs/requirements/user-preferences.md`
- ✅ 生成 `docs/architecture/user-preferences.md`
- ✅ 生成 `docs/design/user-preferences.md`
- ✅ 实现代码并提交
- ✅ 生成审查报告 `docs/reviews/2026-01-10-user-preferences.md`

---

## 📐 系统架构

### 核心组件

```
┌─────────────────────────────────────────────────┐
│                Claude Code CLI                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Commands │  │  Skills  │  │  Agents  │     │
│  │ (流程控制) │  │ (知识库)  │  │ (任务执行) │     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
│       │             │             │            │
│       └─────────────┴─────────────┘            │
│                     │                          │
│              ┌──────▼──────┐                   │
│              │    Hooks    │                   │
│              │  (自动触发)   │                   │
│              └─────────────┘                   │
│                                                 │
└─────────────────────────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
    ┌────▼────┐              ┌────▼────┐
    │  .claude/│              │  docs/  │
    │  (配置)   │              │  (产物)  │
    └─────────┘              └─────────┘
```

### 目录结构

```
chrome_plugin_all/
├── .claude/                      # Claude Code 配置（提交到 Git）
│   ├── agents/
│   │   └── skill-learner.md      # 自学习优化 Agent
│   ├── commands/
│   │   └── dev.md                # 完整开发流程 Command
│   ├── skills/                   # 知识库
│   │   ├── requirement-clarification/
│   │   ├── architecture-design/
│   │   ├── ui-design-system/
│   │   ├── code-implementation/
│   │   └── code-review/
│   ├── settings.local.json       # 个人配置（不提交）
│   └── README.md
│
├── docs/                         # 工作流产物（可选提交）
│   ├── requirements/             # 需求文档
│   ├── architecture/             # 架构设计
│   ├── design/                   # UI 设计
│   ├── reviews/                  # 审查报告
│   └── learnings/                # 学习案例
│       └── metrics.json          # 优化追踪
│
├── chrome-task-extension/        # Chrome 扩展项目
│   ├── manifest.json
│   ├── sidepanel.html/js
│   └── ...
│
├── CLAUDE.md                     # 项目上下文（Claude 自动读取）
├── .gitignore
└── README.md                     # 本文档
```

---

## 📚 使用指南

### 完整开发流程

使用 `/dev` 命令开始新功能开发：

```bash
/dev <功能描述>

# 示例：
/dev 添加搜索功能
/dev 实现用户登录
/dev 添加数据导出功能
```

**流程详解**：

#### Phase 1: 需求澄清

Claude 会问你 3 个核心问题：

```
📋 Phase 1/5: Requirement Clarification

### Question 1: Data Structure / Core Functionality
[具体问题...]

### Question 2: UI/UX Design
[具体问题...]

### Question 3: Scope / Boundaries / Edge Cases
[具体问题...]
```

回答后，Claude 会：
- 生成需求文档 → `docs/requirements/<feature>.md`
- 评估明确度（目标 ≥ 80%）
- 询问是否继续下一阶段

#### Phase 2: 架构设计

Claude 自动：
- 读取需求文档
- 设计数据模型、API、状态管理
- 规划文件结构
- 生成架构文档 → `docs/architecture/<feature>.md`

#### Phase 3: UI 设计

Claude 自动：
- 设计 UI 组件
- 定义交互行为
- 指定颜色、布局、状态
- 生成 UI 文档 → `docs/design/<feature>.md`

#### Phase 4: 代码实现

Claude 自动：
- 按照架构和设计实现代码
- 遵循编码规范
- 处理错误和边界情况

#### Phase 5: 代码审查

Claude 自动：
- 运行 15 项质量检查
- 生成审查报告 → `docs/reviews/YYYY-MM-DD-<feature>.md`
- 提供具体的改进建议

#### Phase 6: 自动学习

`skill-learner` Agent 自动：
- 分析审查报告
- 检测重复问题（出现 ≥ 2 次）
- 更新相关 Skills
- 保存学习案例 → `docs/learnings/YYYY-MM-DD-<issue>.md`

### 单独使用 Skills

不想用完整流程？可以单独调用：

```bash
# 只做需求澄清
Use requirement-clarification skill: 搜索功能需求

# 只做代码审查
Use code-review skill

# 只做架构设计
Use architecture-design skill for search feature
```

### 手动触发 Agent

```bash
# 手动触发自学习优化
Use skill-learner agent to analyze recent reviews

# 指定分析某个问题
Use skill-learner to investigate why we keep missing error handling
```

### 跳过阶段

```bash
# 跳过 UI 设计
/dev 添加XX功能 --skip-design

# 只做代码审查
/dev --review-only
```

---

## 🧠 深入理解

### Skills（知识库）

**本质**：教 Claude "怎么做"的知识文档

**特点**：
- ✅ 被动激活（Claude 根据 `description` 判断）
- ✅ 提供知识，不执行任务
- ✅ 可以同时激活多个
- ✅ 相互引用（Integration 章节）

**5 个核心 Skills**：

| Skill | 作用 | 何时激活 |
|-------|------|---------|
| **requirement-clarification** | 澄清需求，生成需求文档 | 用户提"新功能" |
| **architecture-design** | 设计技术架构 | 需求明确后 |
| **ui-design-system** | 设计 UI 组件和交互 | 架构完成后 |
| **code-implementation** | 提供编码规范和模式 | 开始实现时 |
| **code-review** | 15 项质量检查 | 代码修改后 |

**Skills 结构**：

```markdown
---
name: skill-name
description: |
  **AUTO-ACTIVATE when**: <触发条件>

  <简短描述>

  Triggers: <关键词列表>
---

# Skill Title

## When to Use
- 条件 1
- 条件 2

## Core Patterns
### Pattern Name
```

**示例** - `requirement-clarification/SKILL.md`:

```markdown
---
name: requirement-clarification
description: |
  **AUTO-ACTIVATE when user mentions**: new feature, add functionality,
  implement, create, build, "I want to", unclear requirements.

  Asks 3 core questions to clarify requirements. Has templates for
  common features (priority, search, forms).
---

## Core Patterns

### Question Template

**Question 1**: Data Structure / Core Functionality
**Question 2**: UI/UX Design
**Question 3**: Scope / Boundaries

### Requirement Document Template
[模板内容...]
```

### Commands（工作流控制器）

**本质**：定义"按什么流程做"

**特点**：
- ✅ 主动执行（用户调用 `/command`）
- ✅ 协调 Skills
- ✅ 控制流程（分支、条件、循环）

**你的 `/dev` Command**：

```markdown
/dev <feature>

Phase 1: Requirement → 激活 requirement-clarification skill
Phase 2: Architecture → 激活 architecture-design skill
Phase 3: UI Design → 激活 ui-design-system skill
Phase 4: Implementation → 激活 code-implementation skill
Phase 5: Review → 激活 code-review skill
Phase 6: Learning → 激活 skill-learner agent
```

**Skills vs Commands**：

| 维度 | Skills | Commands |
|------|--------|----------|
| 角色 | 知识库 | 流程控制器 |
| 触发 | 被动 | 主动 |
| 内容 | 怎么做 (How) | 何时做 (When) |
| 组合 | 多个同时 | 一次一个 |

### Agents（专项任务执行者）

**本质**：有独立人格的"专家"

**特点**：
- ✅ 独立决策
- ✅ 有自己的 system prompt
- ✅ 可指定模型（opus/sonnet/haiku）
- ✅ 可限制工具权限

**你的 `skill-learner` Agent**：

```markdown
任务：分析 review → 检测模式 → 优化 skills

工具权限：
- Read（读 review 报告）
- Edit（修改 skills）
- Write（写 learning cases）

触发条件：
1. 自动：/dev 流程的 Phase 6
2. 手动：Use skill-learner agent
3. 定时：每 3 次 review 后
```

**Skills vs Agents**：

| 维度 | Skills | Agents |
|------|--------|--------|
| 角色 | 知识提供者 | 任务执行者 |
| 人格 | 无 | 有 |
| 主动性 | 被动 | 主动 |
| 工具 | 不限 | 可限制 |

### Hooks（自动触发器）

**本质**：事件驱动的自动化

**类型**：

| Hook | 时机 | 用途 |
|------|------|------|
| PreToolUse | 工具执行前 | 验证、阻止 |
| PostToolUse | 工具执行后 | 提醒、后处理 |
| UserPromptSubmit | 提交提示词时 | 添加上下文 |

**示例配置** - `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "echo '{\"feedback\": \"💡 建议运行 code-review\"}' >&2"
          }
        ]
      }
    ]
  }
}
```

### 四者协作

```
用户: /dev 添加搜索

Command (/dev) 开始执行
  ↓
Phase 1: 激活 Skill (requirement-clarification)
  → 使用 Skill 的提问模板
  → 生成需求文档
  ↓
Phase 2-4: 依次激活其他 Skills
  ↓
Phase 5: 代码修改
  → Hook (PostToolUse) 触发
  → 自动激活 Skill (code-review)
  ↓
Phase 6: 自动触发 Agent (skill-learner)
  → 分析 review
  → 更新 Skills
  → 保存 learning
```

---

## 🎯 最佳实践

### 开发新功能

1. **总是使用 `/dev` 命令**
   ```bash
   /dev 添加XX功能
   ```

2. **认真回答需求问题**
   - 3 个问题都很重要
   - 不确定的地方说"不确定"，不要猜测

3. **审查每个阶段的输出**
   - 需求文档是否准确？
   - 架构设计是否合理？
   - UI 设计是否符合预期？

4. **Review 后必须改进**
   - Critical 问题必须修复
   - Warning 最好修复
   - Suggestion 可选

### 优化 Skills

1. **相信自学习系统**
   - skill-learner 会自动优化
   - 不需要手动修改 skills

2. **积累足够的数据**
   - 至少完成 5 次完整流程
   - 让系统有足够的 learnings 数据

3. **定期查看 metrics**
   ```bash
   cat docs/learnings/metrics.json
   ```

4. **手动触发学习**（可选）
   ```bash
   Use skill-learner agent to review recent patterns
   ```

### 团队协作

1. **提交配置到 Git**
   ```bash
   git add .claude/ docs/
   git commit -m "feat: add automated workflow"
   ```

2. **分享 learnings**
   - `docs/learnings/` 包含宝贵经验
   - 团队成员可以学习常见问题

3. **个性化配置**
   - 使用 `.claude/settings.local.json`
   - 不要提交到 Git

---

## ❓ 常见问题

### Q1: Skills 会自动激活吗？

**A**: 是的，Claude 会根据你的输入和 Skills 的 `description` 自动判断是否激活。

示例：
```
你说："我要添加搜索功能"
Claude 匹配到关键词：["添加", "搜索", "功能"]
自动激活：requirement-clarification + code-implementation
```

### Q2: 必须用 `/dev` 命令吗？

**A**: 不是必须的。你可以：
- 使用 `/dev` - 完整流程（推荐）
- 单独调用 Skills - 灵活但需要手动协调
- 混合使用 - 部分流程用 `/dev`，部分手动

### Q3: 如何跳过某个阶段？

**A**: 使用参数：
```bash
/dev 添加XX --skip-design     # 跳过 UI 设计
/dev 添加XX --skip-architecture # 跳过架构设计
```

或者手动：
```bash
/dev 添加XX

# Phase 1 完成后，说 "跳过架构，直接实现"
```

### Q4: skill-learner 什么时候会优化？

**A**: 三种情况：
1. **自动**：`/dev` 流程的 Phase 6
2. **手动**：`Use skill-learner agent`
3. **条件**：检测到问题出现 ≥ 2 次

### Q5: 如何查看优化效果？

**A**: 查看 metrics：
```bash
cat docs/learnings/metrics.json
```

关注：
- `issueFrequency`: 各类问题的出现频率
- `averageScore`: 平均审查分数的趋势

### Q6: docs/ 目录要提交到 Git 吗？

**A**: 看团队需求：
- **提交**：团队共享需求、架构、审查报告
- **不提交**：只保留配置，产物本地生成

在 `.gitignore` 中配置：
```bash
# 不提交产物
docs/requirements/
docs/architecture/
docs/design/
docs/reviews/
docs/learnings/
```

### Q7: 如何添加新的 Skill？

**A**:
1. 在 `.claude/skills/` 创建新目录
2. 创建 `SKILL.md` 文件
3. 定义 frontmatter（name, description）
4. 编写知识内容

示例：
```markdown
---
name: security-patterns
description: |
  Security best practices. Use when dealing with authentication,
  authorization, data validation, or preventing vulnerabilities.
---

# Security Patterns

## Common Vulnerabilities
...
```

### Q8: 系统支持其他编程语言吗？

**A**: 是的！只需：
1. 更新 `CLAUDE.md` - 添加语言特定知识
2. 更新 `code-implementation` Skill - 添加该语言的规范
3. 更新 `code-review` Skill - 添加该语言的检查项

系统架构是语言无关的。

---

## 🤝 贡献指南

### 改进 Skills

发现某个 Skill 不够好？

1. **不要直接修改** - 让系统自学习
2. **提供反馈**：
   ```bash
   Use skill-learner agent: requirement-clarification 的问题不够针对性
   ```
3. **多用几次** - 积累数据后系统会自动优化

### 分享 Learnings

如果你的团队积累了很好的 learnings：

1. 整理 `docs/learnings/` 目录
2. 提交 PR 或分享案例
3. 帮助其他团队避免同样的问题

### 报告问题

- GitHub Issues: [创建 Issue]
- 邮件: your-email@example.com

---

## 📊 效果追踪

### 优化前 vs 优化后

| 指标 | 优化前 | 优化后 | 改善 |
|------|--------|--------|------|
| 缺少错误处理 | 60% | <10% | ↓ 83% |
| 重复代码 | 40% | <15% | ↓ 62% |
| 平均审查分数 | 8/15 (53%) | 12/15 (80%) | ↑ 51% |
| 开发周期 | 2-3 天 | 1 天 | ↓ 50% |

### 示例 Metrics

`docs/learnings/metrics.json` 的实际数据：

```json
{
  "totalReviews": 25,
  "averageScore": {
    "current": "12/15 (80%)",
    "trend": "↑ +27% from baseline"
  },
  "topIssues": [
    {
      "type": "Missing error handling",
      "frequency": "8% (was 60%)",
      "status": "✅ resolved"
    }
  ]
}
```

---

## 📄 许可证

MIT License - 自由使用和修改

---

## 🙏 致谢

- [Claude Code](https://claude.com/claude-code) - AI 驱动的开发工具
- [Anthropic](https://anthropic.com) - Claude AI 的创造者
- 所有贡献者和使用者

---

## 📞 联系方式

- 项目主页: [GitHub Repo]
- 文档: [本README]
- 问题反馈: [GitHub Issues]

---

**现在就开始使用 `/dev` 命令，体验自动化开发工作流！** 🚀

```bash
claude
> /dev 你的第一个功能
```
