# Product Auto Workflow - 产品自动化开发工作流

这个知识库用于存储 AI 辅助开发过程中积累的经验、模式和最佳实践。它是**语言无关**和**项目无关**的，适用于任何开发场景。

## 目录结构

```
.claude/product_auto_workflow/
├── prompts/              # 提示词库
│   ├── requirement/      # 需求澄清相关提示词
│   ├── architecture/     # 架构设计相关提示词
│   ├── implementation/   # 代码实现相关提示词
│   └── testing/          # 测试相关提示词
│
├── patterns/             # 代码模式和设计模式
│   ├── frontend/         # 前端相关模式
│   ├── backend/          # 后端相关模式
│   └── general/          # 通用设计模式
│
└── best-practices/       # 最佳实践
    ├── conversation/     # 与AI对话的最佳实践
    ├── documentation/    # 文档编写最佳实践
    └── workflow/         # 开发工作流程最佳实践
```

## 使用方法

### 1. prompts/ - 提示词库

存储可复用的提示词模板，用于引导 AI 完成特定任务。

**示例文件名**：
- `requirement/priority-feature.md` - 添加优先级功能的需求澄清提示词
- `architecture/microservice-design.md` - 微服务架构设计提示词
- `implementation/error-handling.md` - 错误处理实现提示词

**文件格式**：
```markdown
# 提示词名称

## 适用场景
描述这个提示词适用的场景

## 提示词模板
```
实际的提示词内容
```

## 使用示例
展示如何使用这个提示词

## 预期输出
描述预期的 AI 回复格式
```

### 2. patterns/ - 代码模式

存储常见的代码模式和设计模式，无关语言。

**示例文件名**：
- `frontend/state-management.md` - 前端状态管理模式
- `backend/repository-pattern.md` - 后端仓储模式
- `general/observer-pattern.md` - 观察者模式

**文件格式**：
```markdown
# 模式名称

## 问题
这个模式解决什么问题

## 解决方案
模式的核心思想

## 示例（伪代码）
```
通用的伪代码示例
```

## 适用场景
什么时候使用这个模式

## 优缺点
- 优点
- 缺点
```

### 3. best-practices/ - 最佳实践

存储开发过程中总结的最佳实践。

**示例文件名**：
- `conversation/effective-questioning.md` - 有效提问技巧
- `documentation/requirement-doc-template.md` - 需求文档模板
- `workflow/incremental-development.md` - 增量开发流程

## 维护指南

### 添加新知识

1. **确定分类**：选择合适的目录（prompts/patterns/best-practices）
2. **创建文件**：使用描述性的文件名（kebab-case）
3. **填写内容**：遵循对应的文件格式
4. **添加标签**：在文件头部添加标签方便检索

### 更新现有知识

- 在文件底部添加"更新记录"章节
- 记录更新时间、原因和内容

### 删除过时知识

- 不直接删除，而是移动到 `archive/` 目录
- 在文件中注明废弃原因和替代方案

## 知识检索

### 按标签检索

每个知识文件应该包含标签：

```markdown
---
tags: [需求澄清, 优先级, UI设计]
language: 通用
difficulty: 初级
last_updated: 2026-01-07
---
```

### 按场景检索

创建 `_index.md` 文件，按场景分类列出知识：

```markdown
# 添加新功能场景

## 需求澄清阶段
- [优先级功能需求澄清](prompts/requirement/priority-feature.md)

## 架构设计阶段
- [数据结构设计](patterns/general/data-structure-design.md)

## 实现阶段
- [UI组件实现](patterns/frontend/component-pattern.md)
```

## 与 dialogue-facilitator 集成

dialogue-facilitator 可以从这个知识库中：

1. **加载提示词模板** - 生成更准确的问题
2. **引用代码模式** - 提供实现建议
3. **应用最佳实践** - 优化对话流程

## 示例：添加优先级功能的知识

假设通过对话明确了"添加优先级功能"的需求，可以将经验总结为：

**prompts/requirement/priority-feature.md**：
```markdown
# 优先级功能需求澄清

## 关键问题
1. 优先级等级数量？（建议3-5级）
2. UI展示方式？（颜色、图标、标签）
3. 是否需要排序和筛选？
4. 默认优先级是什么？
```

**patterns/frontend/priority-display.md**：
```markdown
# 优先级展示模式

## 推荐方案
- 使用颜色区分（红/黄/灰）
- 配合图标增强识别
- 支持快速切换
```

---

**版本**: 1.0.0  
**创建时间**: 2026-01-07  
**维护者**: Auto-Dev Team
