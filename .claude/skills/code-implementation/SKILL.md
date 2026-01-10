---
name: code-implementation
description: Code implementation standards, patterns, and best practices. Use when writing code, implementing features, following coding conventions, or need guidance on code structure, naming, error handling, and testing.
---

# Code Implementation Skill

## When to Use

自动激活条件：
- 准备编写代码时
- 架构设计和UI设计已完成
- 用户询问"如何实现"、"怎么写代码"
- 需要遵循代码规范

## Core Patterns

### 1. 代码组织原则

**文件组织**：
```
src/
├── components/          # UI组件
│   ├── TaskList/
│   │   ├── index.tsx   # 导出
│   │   ├── TaskList.tsx # 主组件
│   │   ├── TaskItem.tsx # 子组件
│   │   ├── PriorityIndicator.tsx
│   │   ├── styles.css
│   │   └── TaskList.test.tsx
├── hooks/               # 自定义Hooks
├── services/            # API服务
├── stores/              # 状态管理
├── utils/               # 工具函数
├── constants/           # 常量
└── types/               # TypeScript类型定义
```

**命名规范**：
```javascript
// 组件：PascalCase
export const TaskList = () => {}
export const PriorityIndicator = () => {}

// 函数/变量：camelCase
const handlePriorityChange = () => {}
const taskList = []

// 常量：UPPER_SNAKE_CASE
const MAX_TASKS = 100
const PRIORITY_CONFIG = {}

// 私有变量：_开头
const _internalState = {}

// 布尔值：is/has/should开头
const isLoading = false
const hasError = false
const shouldUpdate = true

// 事件处理：handle开头
const handleClick = () => {}
const handleSubmit = () => {}
```

### 2. 组件实现模式

#### 函数组件标准结构

```typescript
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, Priority } from '@/types';
import { PRIORITY_CONFIG } from '@/constants';

interface TaskItemProps {
  task: Task;
  onPriorityChange: (taskId: string, priority: Priority) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onPriorityChange }) => {
  // 1. Hooks（固定顺序）
  const [isEditing, setIsEditing] = useState(false);

  // 2. 派生状态（useMemo）
  const priorityColor = useMemo(
    () => PRIORITY_CONFIG[task.priority].color,
    [task.priority]
  );

  // 3. 事件处理（useCallback）
  const handlePriorityClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handlePrioritySelect = useCallback((priority: Priority) => {
    onPriorityChange(task.id, priority);
    setIsEditing(false);
  }, [task.id, onPriorityChange]);

  // 4. 副作用（useEffect）
  useEffect(() => {
    // 组件挂载后的操作
    return () => {
      // 清理函数
    };
  }, []);

  // 5. 渲染
  return (
    <div className="task-item">
      <PriorityIndicator
        color={priorityColor}
        onClick={handlePriorityClick}
      />
      <span>{task.title}</span>
      {isEditing && (
        <PrioritySelector
          value={task.priority}
          onChange={handlePrioritySelect}
        />
      )}
    </div>
  );
};
```

### 3. 状态管理实现

#### 使用 Zustand 示例

```typescript
// stores/taskStore.ts
import { create } from 'zustand';
import { Task, Priority } from '@/types';
import { api } from '@/services/api';

interface TaskStore {
  // State
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTasks: () => Promise<void>;
  setPriority: (taskId: string, priority: Priority) => Promise<void>;
  batchSetPriority: (taskIds: string[], priority: Priority) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  // Initial state
  tasks: [],
  isLoading: false,
  error: null,

  // Actions
  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await api.getTasks();
      set({ tasks, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  setPriority: async (taskId, priority) => {
    // 乐观更新
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === taskId ? { ...task, priority } : task
      )
    }));

    try {
      await api.updateTaskPriority(taskId, priority);
    } catch (error) {
      // 回滚
      set(state => ({
        tasks: state.tasks.map(task =>
          task.id === taskId ? { ...task, priority: task.priority } : task
        ),
        error: '优先级更新失败'
      }));
    }
  },

  batchSetPriority: async (taskIds, priority) => {
    // 批量乐观更新
    set(state => ({
      tasks: state.tasks.map(task =>
        taskIds.includes(task.id) ? { ...task, priority } : task
      )
    }));

    try {
      await api.batchUpdatePriority(taskIds, priority);
    } catch (error) {
      // 回滚并提示
      await get().fetchTasks(); // 重新获取数据
      set({ error: '批量更新失败' });
    }
  }
}));
```

### 4. API服务实现

```typescript
// services/api.ts
import axios from 'axios';
import { Task, Priority } from '@/types';

const client = axios.create({
  baseURL: '/api',
  timeout: 10000
});

export const api = {
  getTasks: async (): Promise<Task[]> => {
    const { data } = await client.get('/tasks');
    return data;
  },

  updateTaskPriority: async (taskId: string, priority: Priority): Promise<void> => {
    await client.put(`/tasks/${taskId}/priority`, { priority });
  },

  batchUpdatePriority: async (taskIds: string[], priority: Priority): Promise<void> => {
    await client.patch('/tasks/priority', { taskIds, priority });
  }
};

// 错误处理拦截器
client.interceptors.response.use(
  response => response,
  error => {
    // 统一错误处理
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || '网络请求失败');
  }
);
```

### 5. 错误处理模式

**原则**：
- 永远不要忽略错误
- 用户友好的错误提示
- 记录错误日志便于调试
- 优雅降级

```typescript
// 组件中的错误处理
const TaskList = () => {
  const { tasks, isLoading, error, fetchTasks } = useTaskStore();

  // 错误状态优先显示
  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={fetchTasks}
      />
    );
  }

  // 加载状态（仅在无数据时显示）
  if (isLoading && tasks.length === 0) {
    return <LoadingSkeleton />;
  }

  // 空状态
  if (tasks.length === 0) {
    return <EmptyState />;
  }

  // 正常状态
  return <div>{tasks.map(task => ...)}</div>;
};
```

### 6. 测试模式

```typescript
// TaskItem.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskItem } from './TaskItem';

// 测试数据工厂
const getMockTask = (overrides?: Partial<Task>): Task => ({
  id: '1',
  title: 'Test Task',
  priority: 'medium',
  completed: false,
  ...overrides
});

describe('TaskItem', () => {
  it('should render task with priority indicator', () => {
    const task = getMockTask({ priority: 'high' });
    const onPriorityChange = jest.fn();

    render(<TaskItem task={task} onPriorityChange={onPriorityChange} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByTestId('priority-indicator')).toHaveStyle({
      backgroundColor: '#FF3B30' // high priority color
    });
  });

  it('should call onPriorityChange when priority is changed', () => {
    const task = getMockTask();
    const onPriorityChange = jest.fn();

    render(<TaskItem task={task} onPriorityChange={onPriorityChange} />);

    // 点击优先级指示器
    fireEvent.click(screen.getByTestId('priority-indicator'));

    // 选择高优先级
    fireEvent.click(screen.getByText('高'));

    expect(onPriorityChange).toHaveBeenCalledWith('1', 'high');
  });
});
```

## Anti-Patterns

### ❌ 错误做法

1. **魔法数字/字符串**
   ```typescript
   ❌ if (priority === 'high') { color = '#FF0000'; }
   ✅ if (priority === Priority.High) { color = PRIORITY_CONFIG.high.color; }
   ```

2. **深层嵌套**
   ```typescript
   ❌ if (user) { if (user.isActive) { if (user.hasPerm) { ... } } }
   ✅ if (!user || !user.isActive || !user.hasPerm) return; ...
   ```

3. **不处理错误**
   ```typescript
   ❌ await api.updateTask().catch(() => {})
   ✅ await api.updateTask().catch(err => { console.error(err); showError(); })
   ```

4. **直接修改状态**
   ```typescript
   ❌ task.priority = 'high'; setTask(task);
   ✅ setTask({ ...task, priority: 'high' });
   ```

5. **缺少Loading状态**
   ```typescript
   ❌ if (isLoading) return <Spinner />;
   ✅ if (isLoading && !data) return <Spinner />;
   ```

## Code Quality Checklist

- [ ] 代码通过 ESLint/Prettier 检查
- [ ] 无 TypeScript 类型错误
- [ ] 所有函数有类型定义
- [ ] 使用了常量而非魔法数字
- [ ] 错误处理完整（try-catch + 用户提示）
- [ ] 加载/空/错误状态都有处理
- [ ] 关键逻辑有单元测试
- [ ] 变量命名清晰（不使用a, b, x, y）
- [ ] 没有注释掉的代码
- [ ] 没有console.log（调试用）

## Integration with Other Skills

1. **← architecture-design**
   - 按照架构设计实现数据模型、API、状态管理

2. **← ui-design-system**
   - 按照UI规格实现组件样式和交互

3. **→ code-review**
   - 实现后使用code-review Skill检查质量

## Best Practices

1. **小步快跑**
   - 先实现核心功能，再完善细节
   - 每完成一个功能就提交一次

2. **测试驱动**
   - 先写失败的测试
   - 实现功能使测试通过
   - 重构优化

3. **代码复用**
   - 相同逻辑提取成函数/Hook
   - 相同UI提取成组件

4. **可读性优先**
   - 清晰的命名比简短更重要
   - 简单的逻辑比巧妙更重要

5. **性能优化**
   - 使用 useMemo 缓存计算
   - 使用 useCallback 缓存函数
   - 避免不必要的重新渲染
