---
name: ui-design-system
description: UI design patterns, component design, interaction design, visual design system. Use when designing user interfaces, color systems, layout patterns, interaction behaviors, or translating features into visual components.
---

# UI Design System Skill

## When to Use

自动激活条件：
- 需要设计UI组件时
- 用户提到"界面"、"UI"、"交互"、"设计"
- 架构设计中涉及前端组件
- 需要定义颜色、间距、字体等视觉规范

## Core Patterns

### 1. 设计系统基础

**颜色系统**：
```javascript
// 品牌色
primary: '#007AFF'
secondary: '#5856D6'

// 功能色
success: '#34C759'
warning: '#FFCC00'
error: '#FF3B30'
info: '#5AC8FA'

// 中性色
gray-100: '#F2F2F7'
gray-200: '#E5E5EA'
gray-300: '#D1D1D6'
gray-400: '#C7C7CC'
gray-500: '#AEAEB2'
gray-600: '#8E8E93'

// 语义化颜色
priority-high: error
priority-medium: warning
priority-low: gray-500
```

**间距系统**：
```javascript
spacing = {
  xs: 4px,
  sm: 8px,
  md: 16px,
  lg: 24px,
  xl: 32px
}
```

**字体系统**：
```javascript
fontSize = {
  xs: 12px,
  sm: 14px,
  base: 16px,
  lg: 18px,
  xl: 20px,
  '2xl': 24px
}

fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700
}
```

### 2. 组件设计模式

#### 列表组件（List）

**设计要素**：
```
TaskList
├── Header（标题、操作按钮）
├── Filters（筛选器）
├── SortOptions（排序选项）
├── List Items
│   ├── 左侧指示器（如优先级颜色条）
│   ├── 主内容区
│   ├── 右侧操作区
│   └── 分隔线
└── EmptyState（空状态）
```

**优先级指示器设计**：
```
方案1：左侧颜色条
┌─┬──────────────────────┐
│█│ 任务标题              │ ← 4px宽色条
│ │ 描述信息              │
└─┴──────────────────────┘

方案2：彩色标签
┌──────────────────────────┐
│ [高] 任务标题             │ ← 圆角标签
│ 描述信息                 │
└──────────────────────────┘

方案3：背景色
┌──────────────────────────┐
│ 任务标题                  │ ← 淡色背景
│ 描述信息                  │
└──────────────────────────┘
```

#### 表单组件（Form）

**设计原则**：
- 标签在输入框上方（移动端）或左侧（桌面端）
- 必填字段标记 *
- 实时验证 + 提交验证
- 错误信息在输入框下方
- 禁用状态明显

```
优先级选择器设计：
┌──────────────────────────┐
│ 优先级 *                  │
│ ┌────┬────┬────┐          │
│ │ 高 │ 中 │ 低 │          │ ← Radio Group
│ └────┴────┴────┘          │
│ [红]  [黄]  [灰] ← 颜色预览│
└──────────────────────────┘
```

#### 交互状态

**标准状态**：
- Default（默认）
- Hover（悬停）
- Active（激活/按下）
- Focus（聚焦）
- Disabled（禁用）
- Loading（加载中）

**示例：优先级切换按钮**
```javascript
// Default
<button className="priority-btn">
  高优先级
</button>

// Hover
<button className="priority-btn hover:bg-red-50">
  高优先级
</button>

// Active
<button className="priority-btn bg-red-500 text-white">
  高优先级 ✓
</button>

// Disabled
<button className="priority-btn opacity-50 cursor-not-allowed" disabled>
  高优先级
</button>

// Loading
<button className="priority-btn">
  <Spinner /> 保存中...
</button>
```

### 3. 交互设计模式

#### 优先级选择交互

**方案1：单击切换**
```
点击任务 → 显示优先级选择器（Popover）→ 选择优先级 → 关闭
```

**方案2：右键菜单**
```
右键任务 → 弹出菜单 → 设置优先级 → 子菜单（高/中/低）
```

**方案3：拖拽排序**
```
拖动任务到不同优先级区域 → 自动设置优先级
```

**建议**：移动端用方案1，桌面端方案1+2

#### 批量操作

```
选择多个任务（复选框）→ 顶部显示操作栏 → 批量设置优先级
```

### 4. 响应式设计

**断点**：
```javascript
breakpoints = {
  mobile: '< 640px',
  tablet: '640px - 1024px',
  desktop: '> 1024px'
}
```

**优先级指示器响应式**：
```
移动端：左侧4px色条
平板端：左侧色条 + 文字标签
桌面端：左侧色条 + 文字标签 + Hover显示详情
```

## Anti-Patterns

### ❌ 错误做法

1. **颜色随意使用**
   ```
   ❌ 用 #FF0000、#FFA500、#808080（随便定的颜色）
   ✅ 使用设计系统定义的颜色常量
   ```

2. **间距不一致**
   ```
   ❌ 有的地方15px，有的17px，有的20px
   ✅ 使用统一的间距系统（8的倍数）
   ```

3. **交互状态缺失**
   ```
   ❌ 只有默认状态，没有hover、active、disabled
   ✅ 至少有3个状态：default、hover、disabled
   ```

4. **忽略无障碍设计**
   ```
   ❌ 只用颜色区分（色盲用户看不出）
   ✅ 颜色 + 图标/文字（多重视觉线索）
   ```

5. **移动端体验差**
   ```
   ❌ 按钮太小（< 44px），难以点击
   ✅ 移动端最小点击区域 44x44px
   ```

## UI Design Checklist

- [ ] 使用了设计系统中的颜色/间距/字体
- [ ] 所有交互元素有hover/active/disabled状态
- [ ] 移动端适配（响应式或单独设计）
- [ ] 无障碍设计（颜色对比度、语义化标签）
- [ ] 空状态设计（EmptyState）
- [ ] 加载状态设计（Loading）
- [ ] 错误状态设计（Error）
- [ ] 图标/图片资源已准备
- [ ] 动画/过渡效果适度（不过度炫酷）

## Integration with Other Skills

1. **← architecture-design**
   - 输入：组件架构设计
   - 为每个组件设计UI规格

2. **→ code-implementation**
   - 输出：UI规格文档
   - 指导前端代码实现

3. **→ code-review**
   - 检查UI实现是否符合设计
   - 验证颜色、间距、交互状态

## Templates

### UI Specification Template

```markdown
# [组件名称] UI规格

## 视觉设计
- 颜色：使用哪些设计系统颜色
- 间距：各元素之间的间距
- 字体：字号、字重
- 图标：使用哪些图标

## 交互状态
- Default
- Hover
- Active
- Focus
- Disabled
- Loading
- Error

## 响应式
- 移动端（< 640px）：设计方案
- 平板端（640-1024px）：设计方案
- 桌面端（> 1024px）：设计方案

## 无障碍
- ARIA标签
- 键盘导航
- 屏幕阅读器支持
```

## Best Practices

1. **一致性优于创新**
   - 优先使用已有的组件和模式
   - 只在必要时创建新组件

2. **以用户为中心**
   - 最常用的操作最易访问
   - 减少用户的认知负担

3. **提供即时反馈**
   - 操作后立即显示结果
   - 加载时显示进度

4. **优雅降级**
   - 图片加载失败显示占位符
   - 网络错误显示友好提示

5. **保持简洁**
   - 去掉不必要的装饰
   - 每个元素都有明确目的
