# FINAL-CHECKLIST: 最终验收复检清单

> **执行时机**: Phase A/B/C 全部修复完成 + M1~M7 回归验证通过后
> **目的**: 对 [acceptance-report.md](../acceptance-report.md) 中 F-01~F-10 / T-01~T-07 / V-01~V-06 逐项复检
> **通过标准**: 23 项中 ≥22 项通过（允许 1 项 V-01 需人工测量）

---

## 一、功能验收（F-01 ~ F-10）

### F-01: 点击 Header 切换按钮可在明/暗主题间切换

**验证方法**:
```bash
# 1. 启动开发服务器
npm run dev

# 2. 浏览器打开 http://localhost:3000
# 3. 找到 Header 右上角的 ThemeToggle 按钮
# 4. 点击 → 页面整体颜色应切换
```

**检查点**:
- [ ] 按钮可见且可点击
- [ ] 点击后 data-theme 属性在 html 元素上从 "dark" 变为 "light"（或反之）
- [ ] 页面背景色、文字色、边框色均发生变化

### F-02: 切换后图标正确对应

**检查点**:
- [ ] 暗色模式时显示 ☀️ 太阳图标（提示可切换到亮色）
- [ ] 亮色模式时显示 🌙 月亮图标（提示可切换到暗色）
- [ ] 图标过渡动画流畅（rotate + scale + opacity，300ms）

### F-03: 刷新页面后主题保持

**操作**: 切换到亮色 → 按 F5 刷新
**检查点**:
- [ ] 刷新后仍为亮色模式（非回退到默认暗色）
- [ ] 无 FOUC 闪烁（不会先闪暗色再变亮色）

### F-04: 首次访问默认为暗色主题

**操作**: 打开无痕/隐私窗口访问应用
**检查点**:
- [ ] 首次加载为暗色模式
- [ ] localStorage 中 `pathoptix-theme` 值为 `"dark"`

### F-05: 关闭浏览器重新打开后主题保持

**操作**: 切换到亮色 → 关闭全部标签页 → 重新打开浏览器访问
**检查点**:
- [ ] 主题保持为亮色（localStorage 持久化生效）

### F-06: 所有 8 个业务模块在两种主题下均正常显示

| 模块 | 路径/入口 | 暗色正常 | 亮色正常 |
|------|----------|---------|---------|
| Dashboard | 首页/仪表板 | ⬜ | ⬜ |
| Orders | 订单管理 | ⬜ | ⬜ |
| Routing | 路线优化 | ⬜ | ⬜ |
| Training | 训练优化 | ⬜ | ⬜ |
| Carbon | 碳监测 | ⬜ | ⬜ |
| Compliance | 合规安全 | ⬜ | ⬜ |
| Customer Service | 客户服务 | ⬜ | ⬜ |
| Settings | 系统设置 | ⬜ | ⬜ |

### F-07: 登录页在两种主题下均正常显示

**检查点**:
- [ ] 背景色正确（暗: bg-bg-primary, 亮: bg-bg-primary 映射到浅色）
- [ ] 输入框边框/背景/文字可见
- [ ] 按钮样式正确
- [ ] 错误提示文字可见
- [ ] 链接颜色正确

### F-08: Header 和 Sidebar 在两种主题下正常

**Header 检查点**:
- [ ] 背景色: `bg-bg-secondary` 在双主题下均有合适值
- [ ] 文字: Logo/菜单项/时间等文字清晰可读
- [ ] 边框: 底部分隔线可见但不突兀
- [ ] ThemeToggle 按钮图标与背景对比度足够

**Sidebar 检查点**:
- [ ] 背景色: `bg-bg-primary` 正确
- [ ] 激活菜单项高亮可见（`bg-bg-secondary border-brand-primary/10 text-brand-primary`）
- [ ] 非激活菜单项文字可读（`text-text-muted`）
- [ ] 品牌发光效果保留（rgba cyan 光晕）
- [ ] 右侧分隔线可见（`border-r border-border-default`）

### F-09: 表格、表单、Modal、图表在两种主题下可用

**检查点**:
- [ ] 表格: 表头/行背景/边框/文字/斑马纹在双主题下清晰
- [ ] 表单: 输入框/下拉选择/复选框/标签在双主题下可用
- [ ] Modal: 弹窗背景遮罩/内容区/关闭按钮在双主题下正常
- [ ] 图表: StatCard 折线图/柱状图、ChartCard 饼图颜色随主题变化

### F-10: 打印预览始终为亮色样式

**操作**: Ctrl+P 打印预览
**检查点**:
- [ ] 打印预览为白底黑字（不受当前主题影响）
- [ ] `@media print` 规则生效

---

## 二、技术验收（T-01 ~ T-07）

### T-01: npm run build 构建成功，零报错

```bash
npm run build
```
- [ ] Exit code = 0
- [ ] dist/ 目录生成
- [ ] 无 TypeScript 编译错误
- [ ] 无 CSS 解析错误

### T-02: npm run dev 开发服务器正常启动

```bash
npm run dev
```
- [ ] 服务器启动于 :3000 端口（或配置端口）
- [ ] 无 PostCSS/Tailwind 处理错误
- [ ] HMR（热更新）正常工作

### T-03: 零 console.log 残留

```bash
grep -rn 'console\.log' src/ --include='*.ts' --include='*.tsx'
```
- [ ] 结果为空（允许 `console.error` 在 catch 块中）

### T-04: 零新的 any 类型引入

```bash
grep -rn ': any' src/ --include='*.ts' --include='*.tsx'
```
- [ ] 新增代码中无 `: any`（如有需有注释说明原因）

### T-05: 硬编码颜色降至目标值

```bash
# Tailwind 格式硬编码（目标: <= 5）
grep -rn '\[#' src/components/ --include='*.tsx' | grep -v '\.svg' | wc -l

# dark: 前缀残留（目标: 0，A组组件已清除）
grep -rn 'dark:' src/components/ --include='*.tsx' | wc -l
```
- [ ] `#[hex]` 残余 ≤ 5 处（仅 SVG 内联 + 打印模板）
- [ ] `dark:` 前缀残余 = 0（A 组组件）

### T-06: Tailwind CDN 引用已完全移除

```bash
grep -n 'cdn.tailwindcss\|tailwindcdn' index.html
```
- [ ] 无结果

### T-07: tailwind.config.js 和 postcss.config.js 配置正确

```bash
# tailwind.config.js
# 确认:
cat tailwind.config.js | grep -E 'darkMode|content|bg-bg-primary'
# 预期: darkMode: 'class', content 含 src/ 路径, 语义 token 定义存在

# postcss.config.js
cat postcss.config.js
# 预期: 包含 tailwindcss + autoprefixer 插件
```

---

## 三、视觉验收（V-01 ~ V-06）

> ⚠️ 以下项目建议在真实浏览器中进行人工验证

### V-01: 亮色模式文字对比度符合 WCAG AA 标准

**验证工具**: Chrome DevTools Accessibility Panel 或 Lighthouse
**标准**:
- [ ] 正文文字（text-text-primary on bg-bg-primary）: 对比度 ≥ 4.5:1
- [ ] 次要文字（text-text-muted）: 对比度 ≥ 3:1
- [ ] 小字（<14px 或 <18px bold）: 对比度 ≥ 4.5:1

### V-02: 两种模式下品牌色使用一致

**检查点**:
- [ ] brand-primary (#137fec / 变体) 在双主题下视觉感知一致
- [ ] success/warning/error/info 色在双主题下含义不变
- [ ] 品牌色不被背景淹没（亮色模式下品牌色仍醒目）

### V-03: 亮色模式下卡片之间有足够层次感

**检查点**:
- [ ] bg-bg-primary（页面底色）与 bg-bg-secondary（卡片）有明显区分
- [ ] bg-bg-elevated（浮层/Modal）比 bg-bg-secondary 更亮/更突出
- [ ] shadow-sm / border-border-default 提供足够的层级暗示

### V-04: 切换动画流畅无卡顿（300ms）

**检查点**:
- [ ] 整体颜色过渡约 300ms 完成
- [ ] 无布局抖动（Layout Shift）
- [ ] 动画使用 `transition-colors` 而非 `transition-all`（避免影响 transform）

### V-05: 无 FOUC（首次加载无闪烁）

**验证方法**:
1. 打开 Chrome DevTools → Network → 勾选 "Disable cache"
2. Application → Local Storage → 清除 `pathoptix-theme`
3. 硬刷新 (Ctrl+Shift+R)
4. 观察页面首次渲染

**检查点**:
- [ ] 首次渲染即为正确的暗色主题（不闪白色再变暗）
- [ ] FOUC 脚本在 `<head>` 最顶部同步执行

### V-06: 所有自定义工具类在两种主题下表现正常

| 工具类 | 用途 | 暗色 OK | 亮色 OK |
|--------|------|---------|---------|
| `.glow-cyan` | 品牌发光效果 | ⬜ | ⬜ |
| `.glass-card` | 玻璃拟态卡片 | ⬜ | ⬜ |
| `.path-glow` | 路径发光 | ⬜ | ⬜ |
| `.glow-button` | 发光按钮 | ⬜ | ⬜ |
| `.network-gradient` | 网络渐变背景 | ⬜ | ⬜ |

---

## 四、最终判定矩阵

| 类别 | 总项数 | 通过 | 条件通过 | 不通过 | 通过率 |
|------|-------|------|---------|--------|--------|
| 功能验收 F | 10 | — | — | — | —% |
| 技术验收 T | 7 | — | — | — | —% |
| 视觉验收 V | 6 | — | — | — | —% |
| **合计** | **23** | — | — | — | **—%** |

**最终结论**: ⬜ **通过** / ⬜ **有条件通过** / ⬜ **不通过**

---

## 五、签署

| 角色 | 姓名 | 日期 | 结论 |
|------|------|------|------|
| 执行者 | | | |
| 审核者 | | | |
| 批准者 | | | |
