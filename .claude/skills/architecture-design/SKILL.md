---
name: architecture-design
description: Software architecture design patterns and technical solution design. Use when designing data models, API structures, state management, component architecture, or translating requirements into technical solutions. Includes MVC, data flow, module design.
---

# Architecture Design Skill

## When to Use

自动激活条件：
- 需求文档已明确（明确度 ≥ 80%）
- 用户询问"如何设计架构"
- 用户提到"数据模型"、"API设计"、"状态管理"
- 准备进入代码实现前

## Core Patterns

### 1. 架构设计流程

```
需求分析 → 数据模型设计 → API设计 → 状态管理设计 → 组件架构设计 → 验证设计
```

### 2. 数据模型设计

**原则**：
- 单一数据源（Single Source of Truth）
- 最小化冗余
- 明确数据关系
- 考虑扩展性

**示例：优先级功能数据模型**

```javascript
// 扩展现有 Task 模型
interface Task {
  id: string;
  title: string;
  completed: boolean;

  // 新增优先级字段
  priority: 'high' | 'medium' | 'low';
  priorityColor: string; // 派生属性，可从 priority 计算
  priorityOrder: number; // 用于排序：high=1, medium=2, low=3

  createdAt: Date;
  updatedAt: Date;
}

// 优先级配置（全局常量）
const PRIORITY_CONFIG = {
  high: { label: '高', color: '#FF3B30', order: 1 },
  medium: { label: '中', color: '#FFCC00', order: 2 },
  low: { label: '低', color: '#8E8E93', order: 3 }
};
```

### 3. API设计

**RESTful 风格**：
```javascript
// 新增/修改优先级
PUT /api/tasks/:id/priority
Body: { priority: 'high' | 'medium' | 'low' }

// 批量修改优先级
PATCH /api/tasks/priority
Body: { taskIds: string[], priority: 'high' | 'medium' | 'low' }

// 按优先级筛选
GET /api/tasks?priority=high

// 按优先级排序
GET /api/tasks?sortBy=priority&order=asc
```

**考虑因素**：
- 幂等性：PUT 重复调用结果一致
- 批量操作：提高效率
- 查询参数：支持筛选和排序
- 错误处理：返回明确的错误码

### 4. 状态管理设计

**原则**：
- 组件状态 vs 全局状态
- 状态最小化
- 派生状态用计算属性

**示例：优先级功能状态**

```javascript
// 组件状态（UI临时状态）
const [isEditingPriority, setIsEditingPriority] = useState(false);

// 全局状态（持久化数据）
const tasks = useTaskStore(state => state.tasks);

// 派生状态（计算属性）
const highPriorityTasks = useMemo(
  () => tasks.filter(t => t.priority === 'high'),
  [tasks]
);

// 操作（Action）
const setPriority = (taskId, priority) => {
  // 1. 乐观更新本地状态
  updateTaskLocal(taskId, { priority });

  // 2. 发送API请求
  api.updateTaskPriority(taskId, priority)
    .catch(() => {
      // 3. 失败时回滚
      revertTaskUpdate(taskId);
      showError('优先级更新失败');
    });
};
```

### 5. 组件架构设计

**分层原则**：
```
展示组件（Presentational）
    ↓
容器组件（Container）
    ↓
服务层（Service/API）
    ↓
数据层（Store/State）
```

**示例：优先级功能组件树**

```
TaskList (容器组件)
  ├── TaskItem (展示组件)
  │   ├── PriorityIndicator (UI组件)
  │   ├── TaskTitle
  │   └── TaskActions
  │       └── PrioritySelector (交互组件)
  └── EmptyState
```

### 6. 数据迁移策略

**必须考虑的问题**：
- 现有数据如何处理？
- 迁移时机？
- 回滚方案？

**示例：优先级字段迁移**

```javascript
// 方案1：一次性迁移（小数据量）
async function migratePriority() {
  const tasks = await getAllTasks();
  const updates = tasks.map(task => ({
    ...task,
    priority: task.priority || 'medium', // 默认中等优先级
    priorityOrder: 2
  }));
  await batchUpdateTasks(updates);
}

// 方案2：渐进式迁移（大数据量）
function getTaskPriority(task) {
  // 如果没有 priority 字段，使用默认值
  return task.priority || 'medium';
}
```

## Anti-Patterns

### ❌ 错误做法

1. **过度设计**
   ```
   ❌ 设计复杂的权限系统（需求里没提）
   ✅ 只设计需求明确要求的功能
   ```

2. **忽略边界情况**
   ```
   ❌ 只考虑正常流程
   ✅ 必须考虑：空数据、网络失败、并发修改
   ```

3. **数据冗余**
   ```
   ❌ task 里存 priorityColor、priorityLabel、priorityOrder
   ✅ 只存 priority，其他从配置派生
   ```

4. **状态混乱**
   ```
   ❌ 同一数据在多处维护
   ✅ 单一数据源，派生状态用计算
   ```

5. **API设计不RESTful**
   ```
   ❌ POST /api/changePriority?id=123&priority=high
   ✅ PUT /api/tasks/123/priority { priority: 'high' }
   ```

## Architecture Checklist

完成架构设计后，检查以下项：

- [ ] 数据模型清晰，字段定义明确
- [ ] API设计符合RESTful规范
- [ ] 状态管理方案明确（组件状态 vs 全局状态）
- [ ] 组件层次结构清晰
- [ ] 考虑了数据迁移方案
- [ ] 考虑了错误处理和边界情况
- [ ] 考虑了性能优化（如批量操作）
- [ ] 设计方案可实现，没有技术盲点

**建议**：
- ≥ 7项通过：可以进入实现阶段
- 5-6项通过：补充设计后再继续
- < 5项：重新设计

## Integration with Other Skills

1. **← requirement-clarification**
   - 输入：需求文档
   - 基于需求设计技术方案

2. **→ ui-design-system**
   - 如果涉及UI组件，调用UI设计Skill
   - 设计组件接口和props

3. **→ code-implementation**
   - 输出：架构设计文档
   - 指导具体代码实现

4. **→ code-review**
   - 实现后检查是否符合架构设计
   - 验证数据模型、API、状态管理

## Templates

### Architecture Document Template

```markdown
# [功能名称] 架构设计

## 1. 数据模型
- 数据结构定义
- 字段说明和类型
- 关系和约束

## 2. API设计
- 端点列表
- 请求/响应格式
- 错误处理

## 3. 状态管理
- 状态结构
- 操作（Actions）
- 派生状态（Computed）

## 4. 组件架构
- 组件层次
- 数据流向
- 职责划分

## 5. 数据迁移
- 迁移策略
- 回滚方案
- 风险评估

## 6. 边界情况
- 空数据处理
- 错误处理
- 并发处理
```

## Best Practices

1. **先画图，再写代码**
   - 用简单的ASCII图或伪代码表达设计
   - 团队/自己review后再实现

2. **优先考虑可测试性**
   - 纯函数优于有副作用的函数
   - 依赖注入优于硬编码依赖

3. **遵循单一职责原则**
   - 一个模块/组件只做一件事
   - 便于测试和维护

4. **考虑渐进式增强**
   - MVP（最小可行产品）先实现核心功能
   - 高级功能后续迭代

5. **记录设计决策**
   - 为什么选择这个方案？
   - 权衡了哪些因素？
   - 未来如何扩展？
