import React from 'react';
import { Compass } from 'lucide-react';
import { useChartTheme } from '@hooks/useChartTheme';

/* ================================================================
 *  地理坐标系统
 *  Canvas: 960×520
 *  Lon: 103°E → 122°E   (Δ19°)
 *  Lat:  22°N →   5°N   (Δ17°)
 * ================================================================ */
const W = 960;
const H = 520;
const lon2x = (lon: number) => (lon - 103) * 50.53;
const lat2y = (lat: number) => (22 - lat) * 30.59;

const PORTS = {
  shenzhen:  { x: lon2x(114.05), y: lat2y(22.45), label: '深圳', en: 'Shenzhen' },
  singapore: { x: lon2x(103.85), y: lat2y(1.27),   label: '新加坡', en: 'Singapore' },
  manila:    { x: lon2x(120.98), y: lat2y(14.60),  label: '马尼拉', en: 'Manila' },
  danang:    { x: lon2x(108.22), y: lat2y(16.07),  label: '岘港', en: 'Da Nang' },
};

/* 台风 / 风暴区 */
const STORMS = [
  { cx: lon2x(114.0), cy: lat2y(17.5), rx: 58, ry: 42, label: '台风走廊 TYPHOON', penalty: -800, rot: -15 },
  { cx: lon2x(111.5), cy: lat2y(12.0), rx: 40, ry: 35, label: '极端拥堵 CONGESTION', penalty: -500, rot: 10 },
  { cx: lon2x(117.0), cy: lat2y(10.5), rx: 48, ry: 38, label: '暗礁区 REEF', penalty: -600, rot: 5 },
];

/* 海岸线路径 */
const COASTLINES = {
  chinaMainland: `M 0 0 L 150 3 L 280 -8 L 350 4 L 400 18 L 435 15 L 475 28 L 530 22 L 590 35 L 630 28 L 670 40 L 710 32 L 750 48 L 780 38 L 800 55 L 820 45 L 860 60 L 900 50 L 950 65 L ${W} 55 L ${W} 0 Z`,
  hainan: `M 388 98 Q 400 86 418 90 Q 426 100 422 114 Q 412 124 396 120 Q 384 112 388 98 Z`,
  vietnam: `M 445 82 L 462 95 L 478 88 L 500 105 L 495 130 L 480 158 L 472 175 L 468 195 L 458 218 L 448 238 L 440 260 L 434 280 L 430 300 L 435 315 L 455 325 L 480 330 L 505 328 L 520 340 L 515 360 L 495 375 L 468 385 L 445 390 L 430 400 L 418 425 L 408 450 L 400 480 L 392 510 L 385 ${H} L 350 ${H} L 360 480 L 370 440 L 378 400 L 385 370 L 390 340 L 395 310 L 400 280 L 408 255 L 415 235 L 420 210 L 425 188 L 430 168 L 435 148 L 440 128 L 442 108 L 445 90 Z`,
  luzon: `M 748 135 L 758 148 L 770 142 L 782 155 L 776 172 L 765 188 L 758 205 L 752 218 L 744 230 L 736 222 L 740 205 L 746 188 L 752 170 L 750 152 Z`,
  visayas: `M 732 255 L 744 248 L 758 258 L 762 275 L 752 290 L 738 285 L 730 270 Z`,
  palawan: `M 658 265 L 668 258 L 678 268 L 682 290 L 676 315 L 665 335 L 655 325 L 650 300 L 652 280 Z`,
  borneo: `M 550 430 L 580 418 L 615 425 L 650 415 L 685 422 L 720 435 L 740 448 L 745 465 L 735 480 L 715 490 L 690 495 L 660 498 L 630 495 L 600 492 L 570 488 L 545 478 L 535 460 L 540 445 Z`,
  taiwan: `M 845 35 L 855 45 L 858 62 L 852 78 L 844 72 L 840 55 Z`,
};

/* 探索路径 */
const EXPLORATION_PATHS = [
  `M ${PORTS.shenzhen.x} ${PORTS.shenzhen.y} C ${PORTS.shenzhen.x - 40} 200 ${STORMS[0].cx + 20} ${STORMS[0].cy + 30} ${STORMS[0].cx} ${STORMS[0].cy}`,
  `M ${PORTS.shenzhen.x} ${PORTS.shenzhen.y} C ${PORTS.shenzhen.x - 20} 250 460 200 455 195`,
  `M ${PORTS.shenzhen.x} ${PORTS.shenzhen.y} C 600 180 740 170 755 175`,
  `M ${PORTS.shenzhen.x} ${PORTS.shenzhen.y} C 380 300 440 310 ${STORMS[1].cx + 10} ${STORMS[1].cy}`,
  `M ${PORTS.shenzhen.x} ${PORTS.shenzhen.y} C 300 350 380 420 400 470`,
];

/* 最优策略路径 */
const POLICY_D = `M ${PORTS.shenzhen.x} ${PORTS.shenzhen.y} C ${PORTS.shenzhen.x - 50} 280 200 350 180 400 S 150 460 ${PORTS.singapore.x} ${PORTS.singapore.y}`;

/* ================================================================
 *  组件 — 浅色主题
 * ================================================================ */
const Visualizer: React.FC = () => {
  const chartTheme = useChartTheme();
  const lonLines = [105, 108, 111, 114, 117, 120];
  const latLines = [20, 18, 16, 14, 12, 10, 8, 6];

  return (
    <div className="bg-bg-secondary rounded-3xl p-8 border border-border-default shadow-lg shadow-slate-200/50 flex-1 flex flex-col gap-6">
      {/* ─── Header ─── */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 border border-blue-200">
            <Compass size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-text-primary">路径可视化</h3>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
              SOUTH CHINA SEA · RL LOGISTICS TACTICAL DISPLAY
            </p>
          </div>
        </div>
      </div>

      {/* ─── SVG 地图主体 ─── */}
      <div className="flex-1 bg-sky-100 rounded-2xl border border-border-default relative overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">

          {/* ══════ Defs ══════ */}
          <defs>
            {/* 风暴区渐变 — 浅色模式下用 mix-blend-multiply 压暗 */}
            {STORMS.map((s, i) => (
              <React.Fragment key={`sd-${i}`}>
                <radialGradient id={`storm-${i}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#dc2626" stopOpacity="0.7" />
                  <stop offset="30%" stopColor="#ea580c" stopOpacity="0.35" />
                  <stop offset="65%" stopColor="#f59e0b" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </radialGradient>
                <radialGradient id={`storm-core-${i}`} cx="45%" cy="42%" r="35%">
                  <stop offset="0%" stopColor="#dc2626" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
                </radialGradient>
              </React.Fragment>
            ))}

            {/* 最优路径发光 */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ══════ 1. 海洋背景 ══════ */}
          <rect width={W} height={H} fill={chartTheme.gridColor} />

          {/* ══════ 2. 经纬度网格 ══════ */}
          <g>
            {lonLines.map((lon) => {
              const x = lon2x(lon);
              return (
                <g key={`lon-${lon}`}>
                  <line x1={x} y1={0} x2={x} y2={H} stroke={chartTheme.axisTextColor} strokeWidth="0.5" strokeOpacity="0.3" />
                  <text x={x + 3} y={H - 6} fill={chartTheme.axisTextColor} fontSize="8" fontWeight="700" style={{ fontFamily: 'monospace' }}>{lon}°E</text>
                </g>
              );
            })}
            {latLines.map((lat) => {
              const y = lat2y(lat);
              return (
                <g key={`lat-${lat}`}>
                  <line x1={0} y1={y} x2={W} y2={y} stroke={chartTheme.axisTextColor} strokeWidth="0.5" strokeOpacity="0.3" />
                  <text x={4} y={y - 3} fill={chartTheme.axisTextColor} fontSize="8" fontWeight="700" style={{ fontFamily: 'monospace' }}>{lat}°N</text>
                </g>
              );
            })}
          </g>

          {/* ══════ 3. 陆地板块 ══════ */}
          <g>
            {Object.entries(COASTLINES).map(([key, d]) => (
              d && <path key={key} d={d} fill={chartTheme.tooltipStyle.backgroundColor} stroke={chartTheme.axisStroke} strokeWidth="1.2" />
            ))}
            {/* 南沙群岛散点 */}
            {[lon2x(112.5), lon2x(113.8), lon2x(114.3), lon2x(115.5), lon2x(112.0)].map((sx, si) => (
              <circle key={`sp-${si}`} cx={sx} cy={lat2y(9.5 + si * 0.7)} r="2" fill={chartTheme.tooltipStyle.backgroundColor} stroke={chartTheme.axisStroke} strokeWidth="0.5" />
            ))}

            {/* 陆地标签 */}
            <text x={lon2x(107.5)} y={lat2y(20.5)} fill={chartTheme.axisTextColor} fontSize="9" fontWeight="800" letterSpacing="0.15em" style={{ fontFamily: 'monospace' }}>中国 CHINA</text>
            <text x={lon2x(105.8)} y={lat2y(14.5)} fill={chartTheme.axisTextColor} fontSize="8" fontWeight="700" letterSpacing="0.1em" style={{ fontFamily: 'monospace' }} transform={`rotate(-55,${lon2x(105.8)},${lat2y(14.5)})`}>VIETNAM</text>
            <text x={lon2x(120.0)} y={lat2y(17.0)} fill={chartTheme.axisTextColor} fontSize="8" fontWeight="700" letterSpacing="0.1em" style={{ fontFamily: 'monospace' }}>菲律宾</text>
            <text x={lon2x(113.0)} y={lat2y(3.5)} fill={chartTheme.axisTextColor} fontSize="8" fontWeight="700" letterSpacing="0.1em" style={{ fontFamily: 'monospace' }}>婆罗洲 BORNEO</text>
            <text x={lon2x(109.0)} y={lat2y(19.8)} fill={chartTheme.axisTextColor} fontSize="7" fontWeight="700" style={{ fontFamily: 'monospace' }}>海南</text>
          </g>

          {/* ══════ 4. 风暴区 (惩罚区) — mix-blend-multiply 压暗 ══════ */}
          <g style={{ mixBlendMode: 'multiply' }}>
            {STORMS.map((s, i) => (
              <g key={`storm-${i}`}>
                {/* 外圈呼吸光晕 */}
                <ellipse cx={s.cx} cy={s.cy} rx={s.rx * 1.8} ry={s.ry * 1.8}
                  fill={`url(#storm-${i})`} opacity="0.7"
                  className="animate-pulse"
                  style={{ animationDuration: `${3 + i * 0.7}s`, animationDelay: `${i * 0.4}s` }}
                  transform={`rotate(${s.rot}, ${s.cx}, ${s.cy})`}
                />
                {/* 内核 (台风眼) */}
                <ellipse cx={s.cx - 5} cy={s.cy - 5} rx={s.rx * 0.35} ry={s.ry * 0.35}
                  fill={`url(#storm-core-${i})`}
                  transform={`rotate(${s.rot}, ${s.cx}, ${s.cy})`}
                />
                {/* 虚线边界 */}
                <ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry}
                  fill="none" stroke="#dc2626" strokeWidth="0.8"
                  strokeDasharray="4 3" opacity="0.45"
                  transform={`rotate(${s.rot}, ${s.cx}, ${s.cy})`}
                />
              </g>
            ))}
          </g>
          {/* 风暴标签 (在 mix-blend 层外面, 避免颜色混合) */}
          {STORMS.map((s, i) => (
            <text key={`sl-${i}`} x={s.cx} y={s.cy - s.ry - 12} textAnchor="middle"
              fill="#dc2626" fontSize="8" fontWeight="800"
              letterSpacing="0.06em" style={{ fontFamily: 'monospace' }}
              opacity="0.9">
              {s.label} (Penalty {s.penalty})
            </text>
          ))}

          {/* ══════ 5. 历史探索轨迹 — 浅色模式用更深的灰蓝 ══════ */}
          <g opacity="0.5">
            {EXPLORATION_PATHS.map((d, i) => (
              <path key={`exp-${i}`}
                d={d}
                fill="none"
                stroke={i % 2 === 0 ? '#64748b' : '#78716c'}
                strokeWidth={1.0 + (i % 3) * 0.2}
                strokeDasharray="5 4"
                strokeLinecap="round"
                opacity={0.5 + (i % 3) * 0.15}
              />
            ))}
            {/* 终止标记 */}
            <g>
              <line x1={STORMS[0].cx - 5} y1={STORMS[0].cy + 15} x2={STORMS[0].cx + 5} y2={STORMS[0].cy + 25} stroke="#dc2626" strokeWidth="1.5" opacity="0.6" />
              <line x1={STORMS[0].cx + 5} y1={STORMS[0].cy + 15} x2={STORMS[0].cx - 5} y2={STORMS[0].cy + 25} stroke="#dc2626" strokeWidth="1.5" opacity="0.6" />
            </g>
            <g>
              <line x1={455 - 5} y1={190} x2={455 + 5} y2={200} stroke={chartTheme.axisTextColor} strokeWidth="1.2" opacity="0.5" />
              <line x1={455 + 5} y1={190} x2={455 - 5} y2={200} stroke={chartTheme.axisTextColor} strokeWidth="1.2" opacity="0.5" />
            </g>
          </g>

          {/* ══════ 6. 最优策略路径 (发光贝塞尔曲线) ══════ */}
          {/* 外发光层 */}
          <path d={POLICY_D} fill="none" stroke="#0891b2" strokeWidth="12"
            strokeLinecap="round" strokeOpacity="0.1" filter="url(#glow-strong)" />
          {/* 中发光层 */}
          <path d={POLICY_D} fill="none" stroke="#06b6d4" strokeWidth="5"
            strokeLinecap="round" strokeOpacity="0.25" filter="url(#glow)" />
          {/* 主路径 */}
          <path d={POLICY_D} fill="none" stroke="#06b6d4" strokeWidth="2.5"
            strokeLinecap="round" filter="url(#glow)" />
          {/* 虚线脉冲 */}
          <path d={POLICY_D} fill="none" stroke="#22d3ee" strokeWidth="2"
            strokeLinecap="round" strokeDasharray="2 10" strokeOpacity="0.7">
            <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="2s" repeatCount="indefinite" />
          </path>

          {/* ══════ 7. 港口标注 ══════ */}
          {Object.entries(PORTS).map(([key, p]) => {
            const isOrigin = key === 'shenzhen';
            const isDest = key === 'singapore';
            const color = isOrigin ? '#059669' : isDest ? '#d97706' : '#2563eb';
            return (
              <g key={key}>
                {(isOrigin || isDest) && (
                  <circle cx={p.x} cy={p.y} r="14" fill={color} fillOpacity="0.12"
                    className="animate-ping" style={{ animationDuration: '2.5s' }} />
                )}
                <circle cx={p.x} cy={p.y} r={isOrigin || isDest ? 6 : 4} fill={color} />
                <circle cx={p.x} cy={p.y} r={isOrigin || isDest ? 10 : 7}
                  fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
                <text x={p.x} y={p.y - (isOrigin || isDest ? 18 : 12)}
                  textAnchor="middle" fill={color} fontSize="9" fontWeight="800"
                  letterSpacing="0.04em" style={{ fontFamily: 'monospace' }}>
                  {p.label}
                </text>
                <text x={p.x} y={p.y - (isOrigin || isDest ? 8 : 3)}
                  textAnchor="middle" fill={color} fontSize="7" fontWeight="600"
                  opacity="0.5" style={{ fontFamily: 'monospace' }}>
                  {p.en}
                </text>
              </g>
            );
          })}

          {/* ══════ 8. 南沙群岛 ══════ */}
          {[
            [lon2x(112.2), lat2y(10.2)],
            [lon2x(113.0), lat2y(9.8)],
            [lon2x(114.2), lat2y(8.5)],
            [lon2x(115.5), lat2y(10.0)],
            [lon2x(112.8), lat2y(11.0)],
          ].map(([sx, sy], si) => (
            <circle key={`isl-${si}`} cx={sx} cy={sy} r="1.5" fill={chartTheme.tooltipStyle.backgroundColor} stroke={chartTheme.axisStroke} strokeWidth="0.4" />
          ))}
          <text x={lon2x(113.5)} y={lat2y(11.8)} fill={chartTheme.axisTextColor} fontSize="7" fontWeight="700"
            letterSpacing="0.08em" style={{ fontFamily: 'monospace' }}>
            南沙群岛 SPRATLY
          </text>

          {/* ══════ 左上角: 区域标识 ══════ */}
          <text x="16" y="22" fill={chartTheme.axisTextColor} fontSize="11" fontWeight="900"
            letterSpacing="0.2em" style={{ fontFamily: 'monospace' }}>
            南海 SOUTH CHINA SEA
          </text>
          <text x="16" y="36" fill={chartTheme.axisTextColor} fontSize="8" fontWeight="600"
            style={{ fontFamily: 'monospace' }}>
            RL Policy Visualization · γ=0.99 · α=0.001 · PPO-Clip ε=0.2
          </text>
        </svg>

        {/* ══════ 左下角图例 — 浅色毛玻璃 ══════ */}
        <div className="absolute bottom-4 left-4 flex items-center gap-5 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-border-default shadow-lg shadow-slate-200/50 z-10">
          <div className="flex items-center gap-2">
            <div className="w-5 h-[2px] bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.5)] rounded-full" />
            <span className="text-[9px] text-text-muted font-black uppercase tracking-tight">最优策略 (Policy)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-[2px] bg-text-muted rounded-full" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #94a3b8 0, #94a3b8 4px, transparent 4px, transparent 7px)' }} />
            <span className="text-[9px] text-text-muted font-black uppercase tracking-tight">历史尝试 (Exploration)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400/30 border border-red-400/50" />
            <span className="text-[9px] text-red-500 font-black uppercase tracking-tight">风险区 (Penalty)</span>
          </div>
        </div>

        {/* ══════ 右侧信息浮层 — 浅色毛玻璃 ══════ */}
        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-border-default space-y-2.5 min-w-[210px] shadow-lg shadow-slate-200/50 z-10">
          <div className="text-[8px] text-text-muted font-black uppercase tracking-[0.2em] mb-3 border-b border-border-default pb-2">
            实时状态观测 · OBSERVER
          </div>
          <Row label="当前坐标" value="Lat: 11.2°N, Lon: 111.8°E" color="text-blue-600" />
          <Row label="即时步奖励" value="+24.50" color="text-emerald-600" />
          <Row label="探索率 ε" value="0.05 ↓" color="text-amber-600" />
          <div className="pt-2 border-t border-border-default">
            <Row label="最大 Q-Value" value="128.4" color="text-cyan-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="flex justify-between items-center text-[11px]">
    <span className="text-text-muted font-bold">{label}</span>
    <span className={`${color} font-black font-mono tracking-tighter`}>{value}</span>
  </div>
);

export default Visualizer;
