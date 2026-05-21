import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Compass } from 'lucide-react';
import { useChartTheme } from '@hooks/useChartTheme';
import type { PathStepLog } from './TrainingOptimizationView';

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

/* 探索路径（旧版，仅作背景装饰） */
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
 *  实时规划演示路径（3 条不同路线，同一目的地：新加坡，均避开风险区）
 *  3 分钟一个循环：每条约 55s + 5s 间隔 ≈ 180s
 *
 *  每条路径的真实数据：
 *    西线避风: ~2650km, 5天, $3200, 碳排放 18.5t, 奖励系数 +1.0
 *    中线直航: ~2400km, 4天, $2800, 碳排放 15.2t, 奖励系数 -0.5（穿越拥堵区边缘，扣分）
 *    东线绕行: ~3500km, 7天, $4100, 碳排放 26.8t, 奖励系数 +0.3（绕远但安全）
 * ================================================================ */
const DEMO_PATHS = [
  {
    id: 'demo-1',
    label: '路线A · 西线避风',
    shortLabel: '西线',
    d: `M ${PORTS.shenzhen.x} ${PORTS.shenzhen.y} C ${PORTS.shenzhen.x - 80} ${lat2y(18)} ${lon2x(108)} ${lat2y(14)} ${lon2x(107)} ${lat2y(10)} S ${lon2x(105.5)} ${lat2y(4)} ${PORTS.singapore.x} ${PORTS.singapore.y}`,
    color: '#06b6d4',
    tailwindColor: 'text-cyan-400',
    duration: 55000,
    totalDist: 2650,
    totalDays: 5,
    totalCost: 3200,
    totalCarbon: 18.5,
    rewardModifier: 1.0,
    waypoints: [
      { name: '深圳', lat: 22.45, lon: 114.05 },
      { name: '海南南侧', lat: 18.0, lon: 109.5 },
      { name: '越南沿海', lat: 14.0, lon: 108.0 },
      { name: '金兰湾外海', lat: 10.0, lon: 107.0 },
      { name: '新加坡', lat: 1.27, lon: 103.85 },
    ],
  },
  {
    id: 'demo-2',
    label: '路线B · 中线直航',
    shortLabel: '中线',
    d: `M ${PORTS.shenzhen.x} ${PORTS.shenzhen.y} C ${PORTS.shenzhen.x - 40} ${lat2y(16)} ${lon2x(110)} ${lat2y(8)} ${lon2x(108)} ${lat2y(4)} S ${PORTS.singapore.x + 10} ${PORTS.singapore.y - 5} ${PORTS.singapore.x} ${PORTS.singapore.y}`,
    color: '#8b5cf6',
    tailwindColor: 'text-violet-400',
    duration: 55000,
    totalDist: 2400,
    totalDays: 4,
    totalCost: 2800,
    totalCarbon: 15.2,
    rewardModifier: -0.5,
    waypoints: [
      { name: '深圳', lat: 22.45, lon: 114.05 },
      { name: '南海中部', lat: 16.0, lon: 112.0 },
      { name: '南沙群岛西侧', lat: 8.0, lon: 110.0 },
      { name: '赤道航道', lat: 4.0, lon: 108.0 },
      { name: '新加坡', lat: 1.27, lon: 103.85 },
    ],
  },
  {
    id: 'demo-3',
    label: '路线C · 东线绕行',
    shortLabel: '东线',
    d: `M ${PORTS.shenzhen.x} ${PORTS.shenzhen.y} C ${lon2x(119)} ${lat2y(19)} ${lon2x(120)} ${lat2y(10)} ${lon2x(116)} ${lat2y(3)} S ${PORTS.singapore.x + 30} ${PORTS.singapore.y + 10} ${PORTS.singapore.x} ${PORTS.singapore.y}`,
    color: '#f59e0b',
    tailwindColor: 'text-amber-400',
    duration: 55000,
    totalDist: 3500,
    totalDays: 7,
    totalCost: 4100,
    totalCarbon: 26.8,
    rewardModifier: 0.3,
    waypoints: [
      { name: '深圳', lat: 22.45, lon: 114.05 },
      { name: '吕宋海峡', lat: 19.0, lon: 119.0 },
      { name: '菲律宾东侧', lat: 10.0, lon: 120.0 },
      { name: '苏禄海', lat: 3.0, lon: 116.0 },
      { name: '新加坡', lat: 1.27, lon: 103.85 },
    ],
  },
];

/* localStorage key */
const STORAGE_KEY = 'pathoptix-training-count';

/* ================================================================
 *  组件
 * ================================================================ */
interface VisualizerProps {
  onPathStep?: (log: PathStepLog) => void;
}

const Visualizer: React.FC<VisualizerProps> = ({ onPathStep }) => {
  const chartTheme = useChartTheme();
  const lonLines = [105, 108, 111, 114, 117, 120];
  const latLines = [20, 18, 16, 14, 12, 10, 8, 6];

  // 训练次数（从 localStorage 读取，默认 79）
  const [trainCount, setTrainCount] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 79;
  });

  // 当前正在播放的演示路径索引（-1 = 未开始）
  const [activeDemo, setActiveDemo] = useState(-1);
  // 路径绘制进度 0~1
  const [drawProgress, setDrawProgress] = useState(0);
  // 已完成的历史路径（保留在地图上作为半透明轨迹）
  const [completedPaths, setCompletedPaths] = useState<{ d: string; color: string; label: string }[]>([]);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  // 已发射的日志步进标记（避免重复发射）
  const emittedStepsRef = useRef<Set<string>>(new Set());

  // ─── 实时状态观测数据（联动路径动画） ───
  const currentPath = activeDemo >= 0 ? DEMO_PATHS[activeDemo] : null;
  const progress = drawProgress;

  // 当前坐标：沿 waypoints 线性插值
  const observerCoord = (() => {
    if (!currentPath) return { lat: 22.45, lon: 114.05 };
    const wp = currentPath.waypoints;
    if (!wp || wp.length < 2) return { lat: 22.45, lon: 114.05 };
    const segCount = wp.length - 1;
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const segIdx = Math.min(Math.floor(clampedProgress * segCount), segCount - 1);
    const segProgress = (clampedProgress * segCount) - segIdx;
    const from = wp[segIdx];
    const to = wp[segIdx + 1] || wp[segIdx];
    if (!from || !to) return { lat: 22.45, lon: 114.05 };
    return {
      lat: from.lat + (to.lat - from.lat) * segProgress,
      lon: from.lon + (to.lon - from.lon) * segProgress,
    };
  })();

  // 即时步奖励：基础值 + 路线奖励系数 + 探索率加成
  const epsilonNum = Math.max(0.01, 0.15 - trainCount * 0.001);
  const epsilon = epsilonNum.toFixed(3);
  const stepReward = currentPath
    ? ((20 + progress * 15 + Math.sin(progress * Math.PI) * 8) * currentPath.rewardModifier + epsilonNum * 10).toFixed(1)
    : '0.0';

  // Q-Value：随进度增长
  const qValue = currentPath
    ? (80 + progress * currentPath.totalDist * 0.03).toFixed(1)
    : '0.0';

  const nowStr = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
  };

  // 播放一轮 3 条路径（3 分钟循环）
  const playCycle = useCallback(() => {
    let demoIdx = 0;
    emittedStepsRef.current.clear();
    const roundCompleted: { d: string; color: string; label: string }[] = [];

    const playNext = () => {
      if (demoIdx >= DEMO_PATHS.length) {
        // 一轮播放完毕，训练次数 +1
        setTrainCount(prev => {
          const next = prev + 1;
          localStorage.setItem(STORAGE_KEY, String(next));
          return next;
        });
        // 保留历史轨迹，开始下一轮
        setCompletedPaths(prev => [...prev, ...roundCompleted].slice(-12));
        demoIdx = 0;
        emittedStepsRef.current.clear();
        roundCompleted.length = 0;
        setTimeout(playNext, 5000);
        return;
      }

      const path = DEMO_PATHS[demoIdx];
      setActiveDemo(demoIdx);
      setDrawProgress(0);
      startTimeRef.current = performance.now();

      // 发射路径开始日志
      const startKey = `${path.id}-start`;
      if (!emittedStepsRef.current.has(startKey)) {
        emittedStepsRef.current.add(startKey);
        onPathStep?.({
          id: Date.now(),
          time: nowStr(),
          msg: `▶ [${path.shortLabel}] 开始规划 ${path.label} → 新加坡`,
          color: path.tailwindColor,
          routeLabel: path.shortLabel,
        });
      }

      const animate = (now: number) => {
        const elapsed = now - startTimeRef.current;
        const p = Math.min(elapsed / path.duration, 1);
        setDrawProgress(p);

        // 根据进度发射路径步进日志（每个中间 waypoint 触发一次）
        const wp = path.waypoints;
        for (let i = 1; i < wp.length - 1; i++) {
          const stepThreshold = i / (wp.length - 1);
          const stepKey = `${path.id}-wp-${i}`;
          if (p >= stepThreshold && !emittedStepsRef.current.has(stepKey)) {
            emittedStepsRef.current.add(stepKey);
            // 距离 = 总距离 × 当前进度
            const dist = Math.round(path.totalDist * stepThreshold);
            // 步奖励 = 基础值 × 路线系数 + 探索率加成
            const baseReward = 20 + stepThreshold * 15 + Math.sin(stepThreshold * Math.PI) * 8;
            const reward = (baseReward * path.rewardModifier + epsilonNum * 10).toFixed(1);
            const rewardSign = parseFloat(reward) >= 0 ? '+' : '';
            // 已用天数 = 总天数 × 进度
            const daysUsed = (path.totalDays * stepThreshold).toFixed(1);
            onPathStep?.({
              id: Date.now() + i,
              time: nowStr(),
              msg: `  ↳ [${path.shortLabel}] 途经 ${wp[i].name} (距起点 ${dist}km, 已用时 ${daysUsed}天, 步奖励 ${rewardSign}${reward})`,
              color: path.tailwindColor,
              routeLabel: path.shortLabel,
            });
          }
        }

        if (p < 1) {
          animRef.current = requestAnimationFrame(animate);
        } else {
          // 路径完成日志
          const endKey = `${path.id}-end`;
          if (!emittedStepsRef.current.has(endKey)) {
            emittedStepsRef.current.add(endKey);
            onPathStep?.({
              id: Date.now() + 100,
              time: nowStr(),
              msg: `✓ [${path.shortLabel}] ${path.label} 到达新加坡 (总距离 ${path.totalDist}km, ${path.totalDays}天, $${path.totalCost}, 碳排放 ${path.totalCarbon}t)`,
              color: 'text-emerald-400',
              routeLabel: path.shortLabel,
            });
          }
          // 记录已完成路径
          roundCompleted.push({ d: path.d, color: path.color, label: path.label });
          demoIdx++;
          setTimeout(playNext, 5000);
        }
      };

      animRef.current = requestAnimationFrame(animate);
    };

    playNext();
  }, [onPathStep]);

  useEffect(() => {
    playCycle();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [playCycle]);

  // 计算当前演示路径的 stroke-dasharray / stroke-dashoffset
  const getDemoPathStyle = (idx: number) => {
    if (activeDemo !== idx) {
      return { opacity: 0, strokeDasharray: 'none', strokeDashoffset: 0 };
    }
    return {
      opacity: 1,
      strokeDasharray: '2000',
      strokeDashoffset: 2000 * (1 - drawProgress),
      transition: 'none',
    };
  };

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

        {/* ─── 右上角：地区 + 训练次数 ─── */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-bg-tertiary/50 px-4 py-2 rounded-xl border border-border-default">
            <span className="text-xs text-text-muted font-bold">南海</span>
            <span className="w-px h-4 bg-border-default" />
            <span className="text-sm text-cyan-400 font-black font-mono">{trainCount}</span>
            <span className="text-xs text-text-muted font-bold">次训练</span>
          </div>
        </div>
      </div>

      {/* ─── 演示路径标签 ─── */}
      {activeDemo >= 0 && (
        <div className="flex items-center gap-3">
          {DEMO_PATHS.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                activeDemo === i
                  ? 'border-current bg-bg-tertiary/50 shadow-sm'
                  : 'border-border-default bg-transparent opacity-40'
              }`}
              style={{ color: activeDemo === i ? p.color : undefined }}
            >
              <div className={`w-2 h-2 rounded-full ${activeDemo === i ? 'animate-pulse' : ''}`} style={{ backgroundColor: p.color }} />
              {p.label}
              {activeDemo === i && (
                <span className="text-text-muted font-mono">{Math.round(drawProgress * 100)}%</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─── SVG 地图主体 ─── */}
      <div className="flex-1 bg-sky-100 rounded-2xl border border-border-default relative overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">

          {/* ══════ Defs ══════ */}
          <defs>
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

            <filter id="demo-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
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
            {[lon2x(112.5), lon2x(113.8), lon2x(114.3), lon2x(115.5), lon2x(112.0)].map((sx, si) => (
              <circle key={`sp-${si}`} cx={sx} cy={lat2y(9.5 + si * 0.7)} r="2" fill={chartTheme.tooltipStyle.backgroundColor} stroke={chartTheme.axisStroke} strokeWidth="0.5" />
            ))}
            <text x={lon2x(107.5)} y={lat2y(20.5)} fill={chartTheme.axisTextColor} fontSize="9" fontWeight="800" letterSpacing="0.15em" style={{ fontFamily: 'monospace' }}>中国 CHINA</text>
            <text x={lon2x(105.8)} y={lat2y(14.5)} fill={chartTheme.axisTextColor} fontSize="8" fontWeight="700" letterSpacing="0.1em" style={{ fontFamily: 'monospace' }} transform={`rotate(-55,${lon2x(105.8)},${lat2y(14.5)})`}>VIETNAM</text>
            <text x={lon2x(120.0)} y={lat2y(17.0)} fill={chartTheme.axisTextColor} fontSize="8" fontWeight="700" letterSpacing="0.1em" style={{ fontFamily: 'monospace' }}>菲律宾</text>
            <text x={lon2x(113.0)} y={lat2y(3.5)} fill={chartTheme.axisTextColor} fontSize="8" fontWeight="700" letterSpacing="0.1em" style={{ fontFamily: 'monospace' }}>婆罗洲 BORNEO</text>
            <text x={lon2x(109.0)} y={lat2y(19.8)} fill={chartTheme.axisTextColor} fontSize="7" fontWeight="700" style={{ fontFamily: 'monospace' }}>海南</text>
          </g>

          {/* ══════ 4. 风暴区 ══════ */}
          <g style={{ mixBlendMode: 'multiply' }}>
            {STORMS.map((s, i) => (
              <g key={`storm-${i}`}>
                <ellipse cx={s.cx} cy={s.cy} rx={s.rx * 1.8} ry={s.ry * 1.8}
                  fill={`url(#storm-${i})`} opacity="0.7"
                  className="animate-pulse"
                  style={{ animationDuration: `${3 + i * 0.7}s`, animationDelay: `${i * 0.4}s` }}
                  transform={`rotate(${s.rot}, ${s.cx}, ${s.cy})`}
                />
                <ellipse cx={s.cx - 5} cy={s.cy - 5} rx={s.rx * 0.35} ry={s.ry * 0.35}
                  fill={`url(#storm-core-${i})`}
                  transform={`rotate(${s.rot}, ${s.cx}, ${s.cy})`}
                />
                <ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry}
                  fill="none" stroke="#dc2626" strokeWidth="0.8"
                  strokeDasharray="4 3" opacity="0.45"
                  transform={`rotate(${s.rot}, ${s.cx}, ${s.cy})`}
                />
              </g>
            ))}
          </g>
          {STORMS.map((s, i) => (
            <text key={`sl-${i}`} x={s.cx} y={s.cy - s.ry - 12} textAnchor="middle"
              fill="#dc2626" fontSize="8" fontWeight="800"
              letterSpacing="0.06em" style={{ fontFamily: 'monospace' }}
              opacity="0.9">
              {s.label} (Penalty {s.penalty})
            </text>
          ))}

          {/* ══════ 5. 历史探索轨迹 ══════ */}
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
            <g>
              <line x1={STORMS[0].cx - 5} y1={STORMS[0].cy + 15} x2={STORMS[0].cx + 5} y2={STORMS[0].cy + 25} stroke="#dc2626" strokeWidth="1.5" opacity="0.6" />
              <line x1={STORMS[0].cx + 5} y1={STORMS[0].cy + 15} x2={STORMS[0].cx - 5} y2={STORMS[0].cy + 25} stroke="#dc2626" strokeWidth="1.5" opacity="0.6" />
            </g>
            <g>
              <line x1={455 - 5} y1={190} x2={455 + 5} y2={200} stroke={chartTheme.axisTextColor} strokeWidth="1.2" opacity="0.5" />
              <line x1={455 + 5} y1={190} x2={455 - 5} y2={200} stroke={chartTheme.axisTextColor} strokeWidth="1.2" opacity="0.5" />
            </g>
          </g>

          {/* ══════ 6. 最优策略路径 ══════ */}
          <path d={POLICY_D} fill="none" stroke="#0891b2" strokeWidth="12"
            strokeLinecap="round" strokeOpacity="0.1" filter="url(#glow-strong)" />
          <path d={POLICY_D} fill="none" stroke="#06b6d4" strokeWidth="5"
            strokeLinecap="round" strokeOpacity="0.25" filter="url(#glow)" />
          <path d={POLICY_D} fill="none" stroke="#06b6d4" strokeWidth="2.5"
            strokeLinecap="round" filter="url(#glow)" />
          <path d={POLICY_D} fill="none" stroke="#22d3ee" strokeWidth="2"
            strokeLinecap="round" strokeDasharray="2 10" strokeOpacity="0.7">
            <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="2s" repeatCount="indefinite" />
          </path>

          {/* ══════ 6.5 历史尝试轨迹（已完成的路径保留为半透明实线） ══════ */}
          {completedPaths.map((cp, i) => (
            <path
              key={`hist-${i}`}
              d={cp.d}
              fill="none"
              stroke={cp.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeOpacity="0.3"
            />
          ))}

          {/* ══════ 6.6 实时规划演示路径（3 条动画） ══════ */}
          {DEMO_PATHS.map((demo, i) => (
            <g key={demo.id}>
              <path
                d={demo.d}
                fill="none"
                stroke={demo.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeOpacity="0.15"
                filter="url(#demo-glow)"
                style={getDemoPathStyle(i)}
              />
              <path
                d={demo.d}
                fill="none"
                stroke={demo.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                filter="url(#demo-glow)"
                style={getDemoPathStyle(i)}
              />
              {activeDemo === i && drawProgress > 0 && drawProgress < 1 && (
                <circle r="5" fill={demo.color} filter="url(#demo-glow)">
                  <animateMotion
                    key={`${demo.id}-${drawProgress}`}
                    dur={demo.duration + 'ms'}
                    repeatCount="1"
                    path={demo.d}
                  />
                </circle>
              )}
            </g>
          ))}

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

        {/* ══════ 左下角图例 ══════ */}
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

        {/* ══════ 右侧信息浮层（动态联动路径动画） ══════ */}
        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-border-default space-y-2.5 min-w-[220px] shadow-lg shadow-slate-200/50 z-10">
          <div className="text-[8px] text-text-muted font-black uppercase tracking-[0.2em] mb-3 border-b border-border-default pb-2">
            实时状态观测 · OBSERVER
          </div>
          <Row label="当前坐标" value={`Lat: ${observerCoord.lat.toFixed(1)}°N, Lon: ${observerCoord.lon.toFixed(1)}°E`} color="text-blue-600" />
          <Row label="即时步奖励" value={`+${stepReward}`} color="text-emerald-600" />
          <Row label="探索率 ε" value={`${epsilon} ↓`} color="text-amber-600" />
          <div className="pt-2 border-t border-border-default">
            <Row label="最大 Q-Value" value={qValue} color="text-cyan-600" />
          </div>
          {currentPath && (
            <div className="pt-2 border-t border-border-default">
              <Row label="当前路线" value={currentPath.shortLabel} color={currentPath.tailwindColor} />
              <Row label="已行距离" value={`${Math.round(currentPath.totalDist * progress)} / ${currentPath.totalDist} km`} color="text-text-secondary" />
            </div>
          )}
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
