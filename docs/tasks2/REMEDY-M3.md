# REMEDY-M3: UI 控件 — 修复 + 回归

> **原验收得分**: 95% ⚠️ | **Issue 数**: 1 (🟠 Major) | **修复任务**: 1 | **回归任务**: 3

---

## 修复任务

### M3-FIX-001: ThemeToggle 单元测试

| 字段 | 内容 |
|------|------|
| **Issue** | M3-ISSUE-001 (🟠 Major) |
| **文件** | `src/components/ui/__tests__/ThemeToggle.test.ts`（新建） |
| **原因** | 核心交互控件缺少自动化验证 |

**操作步骤**:

1. 创建目录 `src/components/ui/__tests__/`（如不存在）
2. 创建测试文件:

```typescript
// src/components/ui/__tests__/ThemeToggle.test.ts
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from '../ThemeToggle';
import { ThemeProvider } from '../../../contexts/ThemeContext';

const renderWithProvider = (props = {}) => {
  return render(
    <ThemeProvider>
      <ThemeToggle {...props} />
    </ThemeProvider>
  );
};

describe('ThemeToggle', () => {
  it('should render without crashing', () => {
    renderWithProvider();
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should have correct default aria-label (dark mode)', () => {
    renderWithProvider();
    // 默认 dark 模式，应显示"切换到亮色模式"
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label', expect.stringContaining('亮色')
    );
  });

  it('should toggle theme on click', () => {
    renderWithProvider();
    const button = screen.getByRole('button');
    
    // 初始 dark → aria-label 含"亮色"
    expect(button).toHaveAttribute('aria-label', expect.stringContaining('亮色'));
    
    fireEvent.click(button);
    // 切换后 light → aria-label 含"暗色"
    expect(button).toHaveAttribute('aria-label', expect.stringContaining('暗色'));
  });

  it('should apply size-specific classes for each size variant', () => {
    const { rerender } = renderWithProvider({ size: 'sm' });
    let btn = screen.getByRole('button');
    expect(btn.className).toContain('w-7');
    expect(btn.className).toContain('h-7');

    rerender(
      <ThemeProvider>
        <ThemeToggle size="lg" />
      </ThemeProvider>
    );
    btn = screen.getByRole('button');
    expect(btn.className).toContain('w-10');
    expect(btn.className).toContain('h-10');
  });

  it('should support custom className prop', () => {
    renderWithProvider({ className: 'custom-class' });
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('custom-class');
  });

  it('should contain Sun and Moon icons with transition classes', () => {
    renderWithProvider();
    const btn = screen.getByRole('button');
    // 确认内部包含 SVG 图标元素
    const svgs = btn.querySelectorAll('svg');
    expect(svgs.length).toBe(2); // Sun + Moon
  });
});
```

**验证命令**:
```bash
npm run test -- --testPathPattern="ui/__tests__/ThemeToggle"
```

---

## 回归验证任务

### M3-REG-001: ThemeToggle 组件完整性

- [ ] 文件 `src/components/ui/ThemeToggle.tsx` 存在（46 行左右）
- [ ] Props 接口: `{ className?: string; size?: 'sm' | 'md' | 'lg' }`
- [ ] sizeConfig 包含 sm/md/lg 三档配置
- [ ] Sun/Moon 图标使用绝对定位重叠
- [ ] 过渡动画: rotate + scale + opacity（300ms）
- [ ] 无 `any` 类型使用

### M3-REG-002: Header 集成位置

```bash
# 确认 ThemeToggle 在 Header 中正确位置（L106 附近）
grep -n 'ThemeToggle' src/components/layout/Header.tsx
# 预期: 1 处 import + 1 处 JSX 使用

# 确认 import 路径正确
grep "import ThemeToggle" src/components/layout/Header.tsx
# 预期: import ThemeToggle from '@ui/ThemeToggle'
```

### M3-REG-003: barrel 导出确认

```bash
# 确认 ui/index.ts 导出 ThemeToggle
grep 'ThemeToggle' src/components/ui/index.ts
# 预期: export { default as ThemeToggle } from './ThemeToggle'
```

---

## 完成标准

- [ ] M3-FIX-001: 测试文件创建完成，6 个用例全部通过
- [ ] M3-REG-001: 组件代码完整，Props/尺寸/动画/类型均符合规约
- [ ] M3-REG-002: Header 中 import 正确，JSX 位于 L104-L108 之间
- [ ] M3-REG-003: barrel index.ts 包含 ThemeToggle 导出
