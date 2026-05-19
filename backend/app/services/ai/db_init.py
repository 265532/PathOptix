"""
db_init.py - 使用 NetworkX 在内存中构建跨境物流图
提供 build_graph() 函数，返回带完整节点和边属性的有向图
"""

import math
import random

import networkx as nx

random.seed(42)

# ---------- 城市节点 ----------
CITIES = [
    {"id": "shenzhen",    "name": "深圳",     "country": "CN", "lat": 22.54, "lon": 114.06},
    {"id": "shanghai",    "name": "上海",     "country": "CN", "lat": 31.23, "lon": 121.47},
    {"id": "los_angeles", "name": "洛杉矶",   "country": "US", "lat": 34.05, "lon": -118.24},
    {"id": "new_york",    "name": "纽约",     "country": "US", "lat": 40.71, "lon": -74.01},
    {"id": "rotterdam",   "name": "鹿特丹",   "country": "NL", "lat": 51.92, "lon": 4.48},
    {"id": "frankfurt",   "name": "法兰克福", "country": "DE", "lat": 50.11, "lon": 8.68},
]

# ---------- 运输方式参数 ----------
TRANSPORT_PROFILES = {
    "sea":  {"time_factor": 1.0,  "cost_factor": 0.4,  "carbon_factor": 0.8},
    "air":  {"time_factor": 0.1,  "cost_factor": 1.5,  "carbon_factor": 1.0},
    "land": {"time_factor": 0.5,  "cost_factor": 0.7,  "carbon_factor": 0.3},
}

# ---------- 稀疏连通边 (保证 6 城市可达) ----------
POSSIBLE_EDGES = [
    ("shenzhen", "shanghai"),
    ("shenzhen", "los_angeles"),
    ("shanghai", "los_angeles"),
    ("shanghai", "new_york"),
    ("shenzhen", "rotterdam"),
    ("shanghai", "frankfurt"),
    ("los_angeles", "new_york"),
    ("new_york", "rotterdam"),
    ("new_york", "frankfurt"),
    ("rotterdam", "frankfurt"),
]

_ASIA = {"shenzhen", "shanghai"}
_NA = {"los_angeles", "new_york"}
_EU = {"rotterdam", "frankfurt"}

# 用于查找坐标的快速索引
_CITY_LOOKUP = {c["id"]: c for c in CITIES}


def _approx_days(a: str, b: str) -> float:
    """大圆距离粗估运输天数。"""
    ca, cb = _CITY_LOOKUP[a], _CITY_LOOKUP[b]
    dlat = math.radians(ca["lat"] - cb["lat"])
    dlon = math.radians(ca["lon"] - cb["lon"])
    x = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(ca["lat"]))
         * math.cos(math.radians(cb["lat"]))
         * math.sin(dlon / 2) ** 2)
    dist_km = 2 * 6371 * math.asin(math.sqrt(x))
    return max(dist_km / 800, 1.0)


def _cross_continent(a: str, b: str) -> bool:
    for group in (_ASIA, _NA, _EU):
        if a in group and b in group:
            return False
    return True


def _edge_props(src: str, dst: str, mode: str) -> dict | None:
    """生成单条边属性，陆运跨洲返回 None。"""
    if mode == "land" and _cross_continent(src, dst):
        return None
    p = TRANSPORT_PROFILES[mode]
    base = _approx_days(src, dst)
    return {
        "transport_mode": mode,
        "time_days":   round(base * p["time_factor"]  * random.uniform(0.8, 1.2), 1),
        "cost_usd":    round(base * p["cost_factor"]  * random.uniform(80, 150), 2),
        "carbon_kg":   round(base * p["carbon_factor"] * random.uniform(5, 15), 2),
    }


# ---------- 硬编码跨洲主干线（保底连通性） ----------
# 每条: (src, dst, mode)，确保任意两洲之间至少有一条可达路径
TRUNK_ROUTES = [
    # 亚洲 ↔ 北美
    ("shenzhen",    "los_angeles", "sea"),
    ("shenzhen",    "los_angeles", "air"),
    ("shanghai",    "los_angeles", "air"),
    ("shanghai",    "new_york",    "air"),
    # 亚洲 ↔ 欧洲
    ("shenzhen",    "rotterdam",   "sea"),
    ("shanghai",    "frankfurt",   "air"),
    # 北美国内
    ("los_angeles", "new_york",    "land"),
    ("los_angeles", "new_york",    "air"),
    # 北美 ↔ 欧洲
    ("new_york",    "rotterdam",   "sea"),
    ("new_york",    "frankfurt",   "air"),
    # 欧洲国内
    ("rotterdam",   "frankfurt",   "land"),
]


def build_graph() -> nx.DiGraph:
    """
    构建并返回完整的跨境物流有向图。

    节点属性: name, country, lat, lon
    边属性:   transport_mode, time_days, cost_usd, carbon_kg
    """
    G = nx.DiGraph()

    # 添加节点
    for city in CITIES:
        G.add_node(city["id"], **{k: city[k] for k in ("name", "country", "lat", "lon")})

    # 1) 添加随机双向边
    modes = list(TRANSPORT_PROFILES.keys())
    edge_count = 0
    for src, dst in POSSIBLE_EDGES:
        selected = random.sample(modes, k=random.randint(1, len(modes)))
        for mode in selected:
            props = _edge_props(src, dst, mode)
            if props is None:
                continue
            G.add_edge(src, dst, **props)
            G.add_edge(dst, src, **props)
            edge_count += 1

    # 2) 强制添加跨洲主干线（双向），保证图绝对连通
    trunk_count = 0
    for src, dst, mode in TRUNK_ROUTES:
        props = _edge_props(src, dst, mode)
        if props is None:
            continue
        # 检查该特定运输模式是否已存在
        existing_modes_fwd = {G.edges[src, dst]["transport_mode"]} if G.has_edge(src, dst) else set()
        existing_modes_bwd = {G.edges[dst, src]["transport_mode"]} if G.has_edge(dst, src) else set()
        if mode not in existing_modes_fwd:
            G.add_edge(src, dst, **props)
            trunk_count += 1
        if mode not in existing_modes_bwd:
            G.add_edge(dst, src, **props)
            trunk_count += 1

    # 3) 连通性校验（无向视图）
    undirected = G.to_undirected()
    if not nx.is_connected(undirected):
        components = list(nx.connected_components(undirected))
        print(f"[build_graph] 警告: 图不连通，共 {len(components)} 个连通分量")
        for i, comp in enumerate(components):
            print(f"  分量 {i}: {comp}")

    print(f"[build_graph] 节点 {G.number_of_nodes()}, 有向边 {G.number_of_edges()} "
          f"(随机连接 {edge_count} + 主干线路 {trunk_count})")
    return G


# ---------- 便捷导出 ----------

def save_graph(G: nx.DiGraph, path: str = "logistics_graph.gpickle"):
    """将图序列化到磁盘（可选）。"""
    import pickle
    with open(path, "wb") as f:
        pickle.dump(G, f)
    print(f"[save_graph] 已保存到 {path}")


def load_graph(path: str = "logistics_graph.gpickle") -> nx.DiGraph:
    """从磁盘加载图（可选）。"""
    import pickle
    with open(path, "rb") as f:
        return pickle.load(f)


# ---------- 主入口：构建并打印摘要 ----------

if __name__ == "__main__":
    G = build_graph()

    print("\n--- 节点 ---")
    for nid, data in G.nodes(data=True):
        print(f"  {nid:15s}  {data['name']}  ({data['country']})")

    print("\n--- 有向边 ---")
    for u, v, data in G.edges(data=True):
        print(f"  {u:15s} -> {v:15s}  {data['transport_mode']:4s}  "
              f"${data['cost_usd']:>9.2f}  {data['time_days']:>5.1f}d  "
              f"{data['carbon_kg']:>7.2f}kg CO2")

    # 可选：持久化
    # save_graph(G)
    print("\n[DONE] 图构建完成")
