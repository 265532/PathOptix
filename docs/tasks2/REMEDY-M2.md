# REMEDY-M2: 状态管理 — 修复 + 回归

> **原验收得分**: 75% ⚠️ | **Issue 数**: 1 (🔴 Critical) | **修复任务**: 1 | **回归任务**: 3

---

## 修复任务

### M2-FIX-001: 补充 ThemeContext + useTheme 单元测试

| 字段 | 内容 |
|------|------|
| **Issue** | ISS-001 (🔴 Critical) |
| **文件** | `src/contexts/__tests__/ThemeContext.test.ts`（新建）<br>`src/hooks/__tests__/useTheme.test.ts`（新建） |
| **原因** | 规约要求核心业务逻辑覆盖率 ≥80%，当前为 0% |

**操作步骤 — 文件 1: ThemeContext.test.ts**:

1. 创建目录 `src/contexts/__tests__/`
2. 创建文件，覆盖以下测试场景:

```typescript
// src/contexts/__tests__/ThemeContext.test.ts
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, ThemeContext, Theme } from '../ThemeContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorageMock.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark');
  });

  it('should default to dark theme when no localStorage value', () => {
    render(
      <ThemeProvider>
        <ThemeContext.Consumer>
          {(value) => <span>{value.theme}</span>}
        </ThemeContext.Consumer>
      </ThemeProvider>
    );
    expect(screen.getByText('dark')).toBeInTheDocument();
  });

  it('should read theme from localStorage on mount', () => {
    localStorageMock.setItem('pathoptix-theme', 'light');
    render(
      <ThemeProvider>
        <ThemeContext.Consumer>
          {(value) => <span>{value.theme}</span>}
        </ThemeContext.Consumer>
      </ThemeProvider>
    );
    expect(screen.getByText('light')).toBeInTheDocument();
  });

  it('should toggle theme between dark and light', async () => {
    render(
      <ThemeProvider>
        <ThemeContext.Consumer>
          {(value) => (
            <button onClick={value.toggleTheme}>{value.theme}</button>
          )}
        </ThemeContext.Consumer>
      </ThemeProvider>
    );
    
    const btn = screen.getByRole('button');
    expect(screen.getByText('dark')).toBeInTheDocument();
    
    await act(async () => { btn.click(); });
    expect(screen.getByText('light')).toBeInTheDocument();
    
    await act(async () => { btn.click(); });
    expect(screen.getByText('dark')).toBeInTheDocument();
  });

  it('should persist theme to localStorage on toggle', async () => {
    render(
      <ThemeProvider>
        <ThemeContext.Consumer>
          {(value) => (
            <button onClick={value.toggleTheme}>toggle</button>
          )}
        </ThemeContext.Consumer>
      </ThemeProvider>
    );

    const btn = screen.getByText('toggle');
    await act(async () => { btn.click(); });
    expect(localStorageMock.setItem).toHaveBeenCalledWith('pathoptix-theme', 'light');
  });

  it('should apply data-theme attribute to html element', async () => {
    render(
      <ThemeProvider>
        <ThemeContext.Consumer>
          {(value) => (
            <button onClick={value.toggleTheme}>toggle</button>
          )}
        </ThemeContext.Consumer>
      </ThemeProvider>
    );

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    const btn = screen.getByText('toggle');
    await act(async () => { btn.click(); });
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should provide correct isDark and isLight flags', () => {
    render(
      <ThemeProvider>
        <ThemeContext.Consumer>
          {(value) => (
            <span>{String(value.isDark)}-{String(value.isLight)}</span>
          )}
        </ThemeContext.Consumer>
      </ThemeProvider>
    );
    expect(screen.getByText('true-false')).toBeInTheDocument();
  });
});
```

3. 保存文件

**操作步骤 — 文件 2: useTheme.test.ts**:

1. 创建目录 `src/hooks/__tests__/`
2. 创建文件:

```typescript
// src/hooks/__tests__/useTheme.test.ts
import React from 'react';
import { render, screen } from '@testing-library/react';
import { useTheme } from '../useTheme';
import { ThemeProvider } from '../../contexts/ThemeContext';

function TestComponent() {
  const { theme, isDark, isLight, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="isDark">{String(isDark)}</span>
      <span data-testid="isLight">{String(isLight)}</span>
      <button data-testid="toggle" onClick={toggleTheme}>toggle</button>
      <button data-testid="setLight" onClick={() => setTheme('light')}>setLight</button>
    </div>
  );
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should throw error when used outside ThemeProvider', () => {
    // Suppress console.error for this test
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow(
      'useTheme must be used within a ThemeProvider'
    );
    spy.mockRestore();
  });

  it('should return current theme context values', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(screen.getByTestId('isDark').textContent).toBe('true');
    expect(screen.getByTestId('isLight').textContent).toBe('false');
  });
});
```

3. 保存文件

**验证命令**:
```bash
# 运行测试
npm run test -- --testPathPattern="contexts/__tests__|hooks/__tests__"

# 检查覆盖率
npm run test:coverage -- --testPathPattern="contexts/__tests__|hooks/__tests__"
# 预期: ThemeContext 覆盖率 >= 80%
```

---

## 回归验证任务

### M2-REG-001: ThemeContext 运行时正确性

- [ ] `src/contexts/ThemeContext.tsx` 文件存在
- [ ] 导出类型: `Theme` (`'light' | 'dark'`), `ThemeContextValue`, `ThemeProvider`, `ThemeContext`
- [ ] `THEME_STORAGE_KEY` 值为 `'pathoptix-theme'`
- [ ] `applyTheme` 函数执行三步同步: setAttribute + classList.toggle + localStorage.setItem
- [ ] 使用 useCallback (toggleTheme) 和 useMemo (value) 优化

### M2-REG-002: useTheme Hook 正确性

- [ ] `src/hooks/useTheme.ts` 文件存在
- [ ] 通过 useContext(ThemeContext) 消费
- [ ] Provider 外抛出明确错误信息

### M2-REG-003: main.tsx Provider 注入

```bash
# 确认 main.tsx 包含以下关键元素
grep -n 'ThemeProvider\|themes.css\|StrictMode' src/main.tsx
# 预期:
#   L4:  import './styles/themes.css'
#   L5:  import { ThemeProvider }
#   L16-L18: <ThemeProvider><App /></ThemeProvider> (在 StrictMode 内部)
```

---

## 完成标准

- [ ] M2-FIX-001: 两个测试文件创建完成，`npm run test` 全部通过，覆盖率 ≥80%
- [ ] M2-REG-001: ThemeContext 类型完整、applyTheme 三步同步、Hook 优化到位
- [ ] M2-REG-002: useTheme Hook 文件存在且逻辑正确
- [ ] M2-REG-003: main.tsx 中 ThemeProvider 正确包裹 App
