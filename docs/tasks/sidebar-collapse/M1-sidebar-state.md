# M1: 状态管理 — Sidebar Collapse State

> **模块**: M1 | **任务数**: 3 | **依赖**: 无（基础模块）
> **需求依据**: [sidebar-collapse-requirement.md](../../sidebar-collapse-requirement.md) §3.5 (F-40~F-44) + D-04/D-05/D-07

---

## Task 1.1: App.tsx 新增 isCollapsed state + toggleSidebar

**文件**: `src/App.tsx`

**当前状态** (L16-L18):
```typescript
const [activeView, setActiveView] = useState('dashboard');
```

**目标状态**: 新增 sidebar 折叠状态
```typescript
const [activeView, setActiveView] = useState('dashboard');
const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
  const saved = localStorage.getItem('pathoptix-sidebar-collapsed');
  return saved === 'true';
});

const toggleSidebar = useCallback(() => {
  setIsSidebarCollapsed(prev => {
    const next = !prev;
    localStorage.setItem('pathoptix-sidebar-collapsed', String(next));
    return next;
  });
}, []);
```

**操作步骤**:
1. 在 `useState('dashboard')` 下方新增 `isSidebarCollapsed` state
2. 初始值从 `localStorage` 读取，key 为 `pathoptix-sidebar-collapsed`
3. 默认回退值: `false`（展开）
4. 新增 `toggleSidebar` 回调函数（useCallback 包裹）
5. toggle 内执行：取反 → 写入 localStorage → 返回新值

**验证**:
- [ ] `isSidebarCollapsed` 类型为 `boolean`
- [ ] 默认值为 `false`（localStorage 无记录时）
- [ ] `toggleSidebar` 使用 `useCallback` 优化

---

## Task 1.2: Props 透传 — Sidebar + Header 接收新 props

**文件**: `src/App.tsx`

**当前状态** (L35, L38):
```tsx
<Sidebar activeView={activeView} onViewChange={setActiveView} />
<Header onLogout={() => setActiveView('dashboard')} onViewChange={setActiveView} />
```

**目标状态**:
```tsx
<Sidebar
  activeView={activeView}
  onViewChange={setActiveView}
  isCollapsed={isSidebarCollapsed}
/>
<Header
  onLogout={() => setActiveView('dashboard')}
  onViewChange={setActiveView}
  isSidebarCollapsed={isSidebarCollapsed}
  onToggleSidebar={toggleSidebar}
/>
```

**操作步骤**:
1. `<Sidebar>` 新增 prop: `isCollapsed={isSidebarCollapsed}`
2. `<Header>` 新增两个 props: `isSidebarCollapsed={isSidebarCollapsed}` 和 `onToggleSidebar={toggleSidebar}`

**验证**:
- [ ] Sidebar 收到 `isCollapsed` boolean prop
- [ Header 收到 `isSidebarCollapsed` + `onToggleSidebar` 两个 props

---

## Task 1.3: SidebarProps + HeaderProps 接口扩展

**文件**:
- `src/components/layout/Sidebar.tsx` — 扩展 SidebarProps
- `src/components/layout/Header.tsx` — 扩展 HeaderProps（如存在独立接口）

**操作步骤**:

### SidebarProps 扩展:
```typescript
interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isCollapsed?: boolean;  // 新增，可选以兼容旧调用
}
```

### HeaderProps 扩展:
```typescript
// 如 Header 有独立 Props 接口，新增：
interface HeaderProps {
  onLogout: () => void;
  onViewChange: (view: string) => void;
  isSidebarCollapsed?: boolean;   // 新增
  onToggleSidebar?: () => void;   // 新增
}
```

**验证**:
- [ ] TypeScript 编译无报错
- [ ] `isCollapsed` 标记为可选 (`?`) 以保持向后兼容
- [ ] `onToggleSidebar` 标记为可选 (`?`)

---

## 完成标准

- [ ] Task 1.1: App.tsx 含 isCollapsed state + toggleSidebar + localStorage 读写
- [ ] Task 1.2: Props 正确透传给 Sidebar 和 Header
- [ ] Task 1.3: Props 接口定义完整，TypeScript 零错误
- [ ] `npm run build` 构建成功
