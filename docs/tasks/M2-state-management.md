# M2: 主题状态管理模块 — 实施任务

> **模块编号**: M2
> **前置依赖**: M1 (基础设施配置)
> **预估工时**: 1-2 小时
> **风险等级**: 低

---

## 模块目标

创建 ThemeContext + ThemeProvider + useTheme Hook，实现主题状态的完整生命周期管理：初始化读取、切换逻辑、DOM 同步、localStorage 持久化。

---

## Task 2.1: 创建 contexts 目录和 ThemeContext.tsx

**新建目录**: `src/contexts/`
**新建文件**: `src/contexts/ThemeContext.tsx`
**新建文件**: `src/contexts/index.ts` (barrel export)

- [ ] **Step 1: 创建目录**

```bash
mkdir -p src/contexts
```

- [ ] **Step 2: 创建 ThemeContext.tsx**

```typescript
import React, { createContext, useState, useCallback, useMemo, useEffect } from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  isLight: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  isDark: true,
  isLight: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

const THEME_STORAGE_KEY = 'pathoptix-theme';

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    }
    return 'dark';
  });

  const applyTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      isDark: theme === 'dark',
      isLight: theme === 'light',
      toggleTheme,
      setTheme,
    }),
    [theme, toggleTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeProvider, ThemeContext };
```

**关键设计说明**:
- `useEffect` + `applyTheme` 确保 state 变化时 DOM 同步更新
- 初始化从 localStorage 读取，无值则默认 `'dark'`
- 同时操作 `data-theme` 属性（驱动 CSS 变量）和 `class="dark"`（驱动 Tailwind `dark:` 前缀）
- 导出 `Theme` 类型供外部使用

- [ ] **Step 3: 创建 index.ts barrel 导出**

```typescript
export { ThemeProvider, ThemeContext } from './ThemeContext';
export type { Theme, ThemeContextValue } from './ThemeContext';
```

- [ ] **Step 4: Commit**

```bash
git add src/contexts/
git commit -m "feat(M2): create ThemeContext, ThemeProvider with localStorage persistence and DOM sync"
```

---

## Task 2.2: 创建 useTheme Hook

**新建目录**: `src/hooks/` (如不存在)
**新建文件**: `src/hooks/useTheme.ts`

- [ ] **Step 1: 创建目录**

```bash
mkdir -p src/hooks
```

- [ ] **Step 2: 创建 useTheme.ts**

```typescript
import { useContext } from 'react';
import { ThemeContext, type ThemeContextValue } from '@contexts/ThemeContext';

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider. Wrap your app with <ThemeProvider> in main.tsx.');
  }
  return context;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/
git commit -m "feat(M2): create useTheme hook for consuming ThemeContext"
```

---

## Task 2.3: 将 ThemeProvider 注入 main.tsx

**修改文件**: `src/main.tsx`

当前 main.tsx 内容 (Task 1.6 修改后):

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/themes.css';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 1: 修改 main.tsx，包裹 ThemeProvider**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/themes.css';
import { ThemeProvider } from './contexts/ThemeContext';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
```

- [ ] **Step 2: 验证开发服务器正常启动**

```bash
npm run dev
```

预期：页面正常显示，无报错。ThemeProvider 在 StrictMode 内部正确初始化。

- [ ] **Step 3: Commit**

```bash
git add src/main.tsx
git commit -m "feat(M2): wrap App with ThemeProvider in main.tsx entry point"
```

---

## Task 2.4: 单元测试（基础验证）

- [ ] **Step 1: 创建测试文件**

**新建文件**: `src/contexts/__tests__/ThemeContext.test.ts`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.removeItem('pathoptix-theme');
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    localStorage.removeItem('pathoptix-theme');
  });

  describe('initialization', () => {
    it('should default to dark theme when no saved preference', () => {
      const TestComponent = () => {
        const { theme, isDark, isLight } = useTheme();
        return (
          <div data-testid="theme-info">
            <span data-testid="theme">{theme}</span>
            <span data-testid="is-dark">{String(isDark)}</span>
            <span data-testid="is-light">{String(isLight)}</span>
          </div>
        );
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme').textContent).toBe('dark');
      expect(screen.getByTestId('is-dark').textContent).toBe('true');
      expect(screen.getByTestId('is-light').textContent).toBe('false');
    });

    it('should restore light theme from localStorage', () => {
      localStorage.setItem('pathoptix-theme', 'light');

      const TestComponent = () => {
        const { theme } = useTheme();
        return <span data-testid="theme">{theme}</span>;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme').textContent).toBe('light');
    });
  });

  describe('toggleTheme', () => {
    it('should switch from dark to light on toggle', async () => {
      let capturedToggle: (() => void) | undefined;

      const TestComponent = () => {
        const { theme, toggleTheme } = useTheme();
        capturedToggle = toggleTheme;
        return <span data-testid="theme">{theme}</span>;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme').textContent).toBe('dark');
      capturedToggle!();

      expect(screen.getByTestId('theme').textContent).toBe('light');
    });

    it('should switch from light to dark on toggle', async () => {
      localStorage.setItem('pathoptix-theme', 'light');

      let capturedToggle: (() => void) | undefined;

      const TestComponent = () => {
        const { theme, toggleTheme } = useTheme();
        capturedToggle = toggleTheme;
        return <span data-testid="theme">{theme}</span>;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme').textContent).toBe('light');
      capturedToggle!();

      expect(screen.getByTestId('theme').textContent).toBe('dark');
    });
  });

  describe('DOM sync', () => {
    it('should set data-theme attribute on html element', () => {
      render(
        <ThemeProvider>
          <div />
        </ThemeProvider>
      );

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should update data-theme and class when toggling', async () => {
      let capturedToggle: (() => void) | undefined;

      const TestComponent = () => {
        const { toggleTheme } = useTheme();
        capturedToggle = toggleTheme;
        return null;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      capturedToggle!();

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('localStorage persistence', () => {
    it('should save theme to localStorage after toggle', async () => {
      let capturedToggle: (() => void) | undefined;

      const TestComponent = () => {
        const { toggleTheme } = useTheme();
        capturedToggle = toggleTheme;
        return null;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      capturedToggle!();

      expect(localStorage.getItem('pathoptix-theme')).toBe('light');
    });
  });

  describe('error handling', () => {
    it('should throw error when useTheme is called outside ThemeProvider', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      const TestComponent = () => {
        useTheme();
        return null;
      };

      expect(() => render(<TestComponent />)).toThrow(
        'useTheme must be used within a ThemeProvider'
      );

      consoleError.mockRestore();
    });
  });
});
```

- [ ] **Step 2: 运行测试**

```bash
npm test -- --testPathPattern="ThemeContext" --verbose
```

预期：所有测试用例通过

- [ ] **Step 3: Commit**

```bash
git add src/contexts/__tests__/ThemeContext.test.ts
git commit -m "test(M2): add unit tests for ThemeContext and useTheme hook"
```

---

## 完成标准 Checklist

- [ ] `src/contexts/ThemeContext.tsx` 已创建，包含完整的 Provider/Context/类型定义
- [ ] `src/contexts/index.ts` barrel 导出已创建
- [ ] `src/hooks/useTheme.ts` 已创建
- [ ] `src/main.tsx` 已包裹 ThemeProvider
- [ ] 单元测试全部通过（至少覆盖：默认初始化、toggle 切换、DOM 同步、localStorage 持久化、错误处理）
- [ ] `npm run dev` 正常启动
- [ ] `npm run build` 构建成功

---

## 向下游模块提供的接口

| 接口 | 签名 | 文件 | 消费者 |
|------|------|------|--------|
| `<ThemeProvider>` | `(props: { children: ReactNode }) => JSX.Element` | `src/contexts/ThemeContext.tsx` | main.tsx |
| `useTheme()` | `() => ThemeContextValue` | `src/hooks/useTheme.ts` | M3, M4, M5, M6, M7 |
| `Theme` 类型 | `'light' \| 'dark'` | `src/contexts/ThemeContext.tsx` | 任何需要类型约束处 |
