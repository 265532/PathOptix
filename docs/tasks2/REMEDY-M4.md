# REMEDY-M4: 布局组件适配 — 纯回归验证

> **原验收得分**: 100% ✅ | **Issue 数**: 0 | **修复任务**: 0 | **回归任务**: 3

> ⚠️ **注意**: 本模块已通过验收，无需修复。以下为回归验证清单，确保后续修复未引入回归。

---

## 回归验证任务

### M4-REG-001: Header.tsx 颜色替换完整性（28/28）

**文件**: `src/components/layout/Header.tsx`

```bash
# 1. 确认无 dark: 前缀残留
grep -n 'dark:' src/components/layout/Header.tsx
# 预期: 无结果（或仅注释中）

# 2. 确认无 #[hex] 硬编码残余
grep -n '\[#' src/components/layout/Header.tsx
# 预期: 无结果

# 3. 确认语义类使用正确
grep -c 'bg-bg-\|text-text-\|border-border-' src/components/layout/Header.tsx
# 预期: >= 15 处

# 4. 确认根容器样式
grep -n 'className.*bg-bg-secondary.*border-border-default' src/components/layout/Header.tsx
# 预期: 1 处匹配（Header 根元素）
```

**手动检查项**:
- [ ] 根容器: `bg-bg-secondary/60 border-border-default shadow-sm`
- [ ] Logo/标题文字: `text-text-primary`
- [ ] 次要文字: `text-text-muted` / `text-text-secondary`
- [ ] ThemeToggle 在 L106（divider L104 与 notification bell L108 之间）
- [ ] ShieldCheck 图标 `text-black`（可接受：品牌色背景上的功能对比色）
- [ ] hover 状态: `hover:bg-bg-tertiary/30` 等语义类

### M4-REG-002: Sidebar.tsx 颜色替换完整性（20/20）

**文件**: `src/components/layout/Sidebar.tsx`

```bash
# 1. 确认无 dark: 残留
grep -c 'dark:' src/components/layout/Sidebar.tsx
# 预期: 0

# 2. 确认无 #[hex] 残留
grep -c '\[#' src/components/layout/Sidebar.tsx
# 预期: 0

# 3. 确认根容器
grep 'w-80 bg-bg-primary border-r border-border-default shadow-sm' src/components/layout/Sidebar.tsx
# 预期: 1 处匹配
```

**手动检查项**:
- [ ] 根容器: `w-80 bg-bg-primary border-r border-border-default shadow-sm`
- [ ] 菜单激活状态: `bg-bg-secondary border-brand-primary/10 text-brand-primary`
- [ ] 菜单非激活: `text-text-muted hover:text-text-secondary hover:bg-bg-tertiary/30`
- [ ] 品牌发光效果保留（rgba cyan 值在 L24/L37/L46/L64/L78）

### M4-REG-003: App.tsx 根容器适配

**文件**: `src/App.tsx`

```bash
# 确认根 div 不再使用硬编码背景色
grep -n 'bg-\[#05080F\]' src/App.tsx
# 预期: 无结果

# 确认使用语义类
grep -n 'bg-bg-primary.*text-text-secondary.*transition-colors.*duration-300' src/App.tsx
# 预期: 1 处匹配
```

---

## 完成标准

- [x] M4-REG-001: Header 0 dark: 残余 + 0 #[hex] 残余 + 15+ 语义类 + 根容器正确
- [x] M4-REG-002: Sidebar 0 dark: 残留 + 0 #[hex] 残余 + 根容器/菜单状态/品牌光效完整
- [x] M4-REG-003: App.tsx 无 #05080F + 使用 bg-bg-primary + transition 类存在
