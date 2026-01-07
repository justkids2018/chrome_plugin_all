# 开发助手（Developer）

生成代码实现。

## 功能说明

基于架构和设计，实现：
- ✅ 编写代码
- ✅ 遵循规范（doc/tel）
- ✅ 添加必要注释
- ✅ 生成实现文档

## 使用方法

```
基于架构和设计文档，使用 developer 开始开发
```

## 自动工作流程

```
[步骤 1] 准备工作
  → 读取架构和设计文档
  → 识别需要修改的文件
  → 确认技术栈

[步骤 2] 参考代码模式
  → 查看 code-patterns/ 中的模式
  → 选择合适的实现方式

[步骤 3] 生成代码
  → 数据模型代码
  → UI 组件代码
  → 业务逻辑代码
  → 遵循 doc/tel 的代码规范

[步骤 4] 生成实现文档
  → 使用 templates/implementation-doc.md
  → 符合 tel 规范的"代码变更"和"实现计划"部分
  → 保存到 examples/
```

## 目录说明

### templates/
- `implementation-doc.md` - 实现文档模板

### code-patterns/
常用代码模式。

- `state-management.md` - 状态管理模式
- `error-handling.md` - 错误处理模式
- `data-persistence.md` - 数据持久化模式
- `event-handling.md` - 事件处理模式

### examples/
已完成的实现案例。

---

**下一步：5-review 模块（审查和优化）**
