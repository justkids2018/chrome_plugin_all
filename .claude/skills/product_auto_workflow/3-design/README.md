# UI 设计师（Designer）

设计界面和交互方案。

## 功能说明

基于需求和架构，设计：
- ✅ UI 布局
- ✅ 交互流程
- ✅ 视觉样式
- ✅ 用户体验

## 使用方法

```
基于架构文档 [path]，使用 designer 设计 UI
```

## 自动工作流程

```
[步骤 1] 分析功能
  → 识别 UI 元素类型（表单/列表/卡片/弹窗等）
  → 分析用户操作流程

[步骤 2] 推荐 UI 模式
  → 参考 ui-patterns/ 中的模式
  → 参考现有 UI 风格（Apple Design）

[步骤 3] 设计方案
  → UI 组件设计
  → 布局设计
  → 交互设计（点击/悬停/拖拽等）
  → 颜色/图标选择

[步骤 4] 生成设计文档
  → 使用 templates/ui-spec.md
  → 保存到 examples/
```

## 目录说明

### templates/
- `ui-spec.md` - UI 规格文档模板

### ui-patterns/
常用 UI 设计模式。

- `form.md` - 表单设计模式
- `list.md` - 列表设计模式
- `card.md` - 卡片设计模式
- `modal.md` - 弹窗设计模式

### examples/
已完成的 UI 设计案例。

---

**下一步：4-development 模块（开发实现）**
