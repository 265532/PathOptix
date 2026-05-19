# REMEDY-M1: 基础设施配置 — 修复 + 回归

> **原验收得分**: 100% ✅ | **Issue 数**: 1 (🔵 Info) | **修复任务**: 1 | **回归任务**: 3

---

## 修复任务

### M1-FIX-001: 移除 index.html 中冗余 importmap 块

| 字段 | 内容 |
|------|------|
| **Issue** | M1-INFO-001 (🔵 Info) |
| **文件** | `index.html` |
| **原因** | CDN script 已移除至 npm，importmap 无实际作用 |

**操作步骤**:

1. 打开 `index.html`，定位到 `<body>` 末尾区域
2. 找到以下代码块并**整体删除**（约 8 行）:
   ```html
   <script type="importmap">
   {
     "imports": {
       ...
     }
   }
   </script>
   ```
3. 保存文件

**验证命令**:
```bash
# 确认 importmap 已完全移除
grep -n "importmap" index.html
# 预期输出: 无结果（空）
```

---

## 回归验证任务

### M1-REG-001: Tailwind 构建链路完整性

```bash
# 1. 确认依赖版本正确
npm list tailwindcss postcss autoprefixer
# 预期: tailwindcss@3.4.x, postcss@8.5.x, autoprefixer@10.5.x

# 2. 确认配置文件存在
ls -la tailwind.config.js postcss.config.js
# 预期: 两个文件均存在

# 3. 构建验证
npm run build
# 预期: 成功，零报错，产物输出到 dist/
```

### M1-REG-002: themes.css 变量完整性

```bash
# 检查 CSS 变量数量
grep -c '--' src/styles/themes.css
# 预期: >= 22 个变量定义

# 确认双主题选择器存在
grep -c 'data-theme="dark"' src/styles/themes.css
grep -c 'data-theme="light"' src/styles/themes.css
# 预期: 各至少 1 处

# 确认 @tailwind 指令完整
grep -E '@tailwind (base|components|utilities)' src/styles/themes.css
# 预期: 3 行匹配
```

### M1-REG-003: FOUC 脚本 + CDN 移除确认

```bash
# 1. 确认 FOUC 脚本在 <head> 最顶部
grep -n 'localStorage.*theme\|data-theme' index.html | head -5
# 预期: 行号 < 10（位于 head 顶部）

# 2. 确认 CDN 已移除
grep -n 'cdn.tailwindcss' index.html
# 预期: 无结果

# 3. 确认 Google Fonts 保留
grep -n 'fonts.googleapis\|fonts.gstatic' index.html
# 预期: 2 处匹配（Preconnect + Stylesheet）
```

---

## 完成标准

- [ ] M1-FIX-001: `grep importmap index.html` 返回空
- [ ] M1-REG-001: `npm run build` 零报错
- [ ] M1-REG-002: themes.css 含 22+ 变量 + 双主题选择器 + 3 条 @tailwind 指令
- [ ] M1-REG-003: FOUC 脚本位置正确 + CDN 已清除 + Fonts 保留
