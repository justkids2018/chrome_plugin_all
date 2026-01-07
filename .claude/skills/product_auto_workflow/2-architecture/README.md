# 架构设计师（Architect）

把需求转化为技术架构方案。

## 功能说明

基于明确的需求，设计：
- ✅ 数据模型
- ✅ 组件结构
- ✅ 系统架构
- ✅ 技术方案

## 使用方法

```
基于需求文档 [path]，使用 architect 设计架构
```

## 自动工作流程

```
[步骤 1] 分析需求
  → 提取核心功能点
  → 识别数据实体
  → 分析技术约束

[步骤 2] 推荐架构模式
  → 参考 patterns/ 中的设计模式
  → 选择最适合的模式

[步骤 3] 设计方案
  → 数据模型设计
  → 组件职责划分
  → API/接口设计
  → 数据流向设计

[步骤 4] 生成架构文档
  → 使用 templates/architecture-doc.md
  → 符合 tel 规范的"架构蓝图"部分
  → 保存到 examples/
```

## 目录说明

### templates/
- `architecture-doc.md` - 架构文档模板

### patterns/
常用设计模式参考。

- `mvc.md` - MVC 模式
- `observer.md` - 观察者模式
- `repository.md` - 仓储模式
- `factory.md` - 工厂模式

### examples/
已完成的架构案例。

---

**下一步：3-design 模块（UI设计）**
