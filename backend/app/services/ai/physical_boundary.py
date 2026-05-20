"""
physical_boundary.py - 物理边界验证器
四层硬性物理边界校验，从根本上杜绝违反物理常识的跨洲折返跑
"""

from __future__ import annotations

import math

from .db_init import NODE_REGION, REGION_GROUPS, _CITY_LOOKUP


# ---------- 大区合法流转走廊（双向） ----------
_LEGAL_CORRIDORS: dict[tuple[str, str], set[str]] = {
    ("亚洲", "欧洲"): {"亚洲", "欧洲"},
    ("亚洲", "北美"): {"亚洲", "北美"},
    ("欧洲", "北美"): {"欧洲", "北美"},
    ("欧洲", "亚洲"): {"亚洲", "欧洲"},
    ("北美", "亚洲"): {"亚洲", "北美"},
    ("北美", "欧洲"): {"欧洲", "北美"},
    ("亚洲", "亚洲"): {"亚洲"},
    ("北美", "北美"): {"北美"},
    ("欧洲", "欧洲"): {"欧洲"},
}


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """计算地球表面两点间的大圆距离（单位：km）。"""
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 2 * 6371 * math.asin(math.sqrt(a))


def _bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """计算从点1到点2的方位角（单位：度，正北为0°，顺时针）。"""
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlon = lon2 - lon1
    x = math.sin(dlon) * math.cos(lat2)
    y = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(dlon)
    return (math.degrees(math.atan2(x, y)) + 360) % 360


def _angle_diff(a: float, b: float) -> float:
    """计算两个方位角之间的最小夹角（0°~180°）。"""
    diff = abs(a - b) % 360
    return min(diff, 360 - diff)


class PhysicalBoundaryValidator:
    """
    物理边界验证器：四层硬性校验。

    第0层: 节点回访禁止
    第1层: 大区单向流转墙
    第2层: 距离单调递减
    第3层: 方向偏离检测
    """

    def __init__(self, start_node: str, goal_node: str):
        self._start_node = start_node
        self._goal_node = goal_node
        self._start_region = NODE_REGION[start_node]
        self._goal_region = NODE_REGION[goal_node]

        # 合法流转区域
        corridor_key = (self._start_region, self._goal_region)
        self._allowed_regions = _LEGAL_CORRIDORS.get(corridor_key, set())

        # 已访问节点集合
        self._visited: set[str] = {start_node}

        # 上一步所在大区
        self._prev_region: str = self._start_region

        # 当前节点（外部通过 set_current_node 更新）
        self._current_node: str = start_node

    def reset(self) -> None:
        """重置验证器状态。"""
        self._visited = {self._start_node}
        self._prev_region = self._start_region
        self._current_node = self._start_node

    def set_current_node(self, node: str) -> None:
        """移动到新节点时更新内部状态。"""
        self._current_node = node
        self._visited.add(node)
        self._prev_region = NODE_REGION[node]

    def is_action_valid(self, dst_node: str) -> tuple[bool, str]:
        """
        四层校验：任何一层不通过即拒绝。

        返回: (是否合法, 拒绝原因)
        """
        # 第0层: 节点回访禁止
        if dst_node in self._visited:
            return False, "cycle_prevention"

        # 第1层: 大区单向流转墙
        dst_region = NODE_REGION[dst_node]
        if dst_region not in self._allowed_regions:
            return False, "regional_wall"

        # 不可逆边界: 离开起点大区后禁止回退
        if self._prev_region != self._start_region and dst_region == self._start_region:
            return False, "irreversible_boundary"

        # 第2层: 距离单调递减
        cur_coords = _CITY_LOOKUP[self._current_node]
        dst_coords = _CITY_LOOKUP[dst_node]
        goal_coords = _CITY_LOOKUP[self._goal_node]

        cur_dist = _haversine(cur_coords["lat"], cur_coords["lon"],
                              goal_coords["lat"], goal_coords["lon"])
        dst_dist = _haversine(dst_coords["lat"], dst_coords["lon"],
                              goal_coords["lat"], goal_coords["lon"])
        tolerance = max(cur_dist * 0.10, 500)
        if dst_dist > cur_dist + tolerance:
            return False, "distance_bounding"

        # 第3层: 方向偏离检测（距离终点 > 2000km 时启用）
        if cur_dist > 2000:
            bearing_to_dst = _bearing(cur_coords["lat"], cur_coords["lon"],
                                      dst_coords["lat"], dst_coords["lon"])
            bearing_to_goal = _bearing(cur_coords["lat"], cur_coords["lon"],
                                       goal_coords["lat"], goal_coords["lon"])
            deviation = _angle_diff(bearing_to_dst, bearing_to_goal)
            if deviation > 90:
                return False, "vector_deviation"

        return True, ""

    def compute_deviation_penalty(self, dst_node: str) -> float:
        """
        计算方向偏离惩罚（在 step() 中调用）。

        偏离 > 90°: 返回 -10000（严重偏离，应终止回合）
        偏离 <= 90°: 返回 0（正常）
        """
        cur_coords = _CITY_LOOKUP[self._current_node]
        dst_coords = _CITY_LOOKUP[dst_node]
        goal_coords = _CITY_LOOKUP[self._goal_node]

        cur_dist = _haversine(cur_coords["lat"], cur_coords["lon"],
                              goal_coords["lat"], goal_coords["lon"])
        if cur_dist <= 2000:
            return 0.0

        bearing_to_dst = _bearing(cur_coords["lat"], cur_coords["lon"],
                                  dst_coords["lat"], dst_coords["lon"])
        bearing_to_goal = _bearing(cur_coords["lat"], cur_coords["lon"],
                                   goal_coords["lat"], goal_coords["lon"])
        deviation = _angle_diff(bearing_to_dst, bearing_to_goal)

        if deviation > 90:
            return -10000.0
        return 0.0
