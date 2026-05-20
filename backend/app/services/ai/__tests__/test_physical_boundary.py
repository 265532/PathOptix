"""
test_physical_boundary.py - PhysicalBoundaryValidator 单元测试
"""

import pytest
from app.services.ai.physical_boundary import (
    PhysicalBoundaryValidator,
    _haversine,
    _bearing,
    _angle_diff,
)


class TestHaversine:
    def test_same_point_returns_zero(self):
        assert _haversine(0, 0, 0, 0) == 0.0

    def test_known_distance_nyc_la(self):
        """纽约→洛杉矶约 3940km，允许 ±5% 误差"""
        dist = _haversine(40.71, -74.01, 34.05, -118.24)
        assert 3700 < dist < 4200

    def test_known_distance_nyc_shanghai(self):
        """纽约→上海约 11900km"""
        dist = _haversine(40.71, -74.01, 31.23, 121.47)
        assert 11000 < dist < 12500


class TestBearing:
    def test_north(self):
        """正北方向 ≈ 0°"""
        b = _bearing(0, 0, 10, 0)
        assert abs(b) < 1 or abs(b - 360) < 1

    def test_east(self):
        """正东方向 ≈ 90°"""
        b = _bearing(0, 0, 0, 10)
        assert abs(b - 90) < 1


class TestAngleDiff:
    def test_same_angle(self):
        assert _angle_diff(45, 45) == 0

    def test_opposite(self):
        assert _angle_diff(0, 180) == 180

    def test_small_diff(self):
        assert abs(_angle_diff(10, 20) - 10) < 0.01


class TestPhysicalBoundaryValidator:
    """四层校验逻辑测试"""

    # ---- 第0层: 节点回访禁止 ----
    def test_cycle_prevention(self):
        v = PhysicalBoundaryValidator("shenzhen", "new_york")
        v.set_current_node("shanghai")
        valid, reason = v.is_action_valid("shenzhen")
        assert not valid
        assert reason == "cycle_prevention"

    # ---- 第1层: 大区流转墙 ----
    def test_regional_wall_blocks_asia_detour_for_na_to_na(self):
        """北美→北美 路径不应经过亚洲"""
        v = PhysicalBoundaryValidator("new_york", "los_angeles")
        valid, reason = v.is_action_valid("shanghai")
        assert not valid
        assert reason == "regional_wall"

    def test_regional_wall_blocks_europe_detour_for_asia_to_na(self):
        """亚洲→北美 路径不应经过欧洲"""
        v = PhysicalBoundaryValidator("shenzhen", "los_angeles")
        valid, reason = v.is_action_valid("rotterdam")
        assert not valid
        assert reason == "regional_wall"

    def test_regional_wall_allows_asia_for_asia_to_na(self):
        """亚洲→北美 路径允许经过亚洲节点"""
        v = PhysicalBoundaryValidator("shenzhen", "los_angeles")
        valid, reason = v.is_action_valid("shanghai")
        assert valid
        assert reason == ""

    def test_irreversible_boundary(self):
        """离开起点大区后禁止回退"""
        v = PhysicalBoundaryValidator("shenzhen", "new_york")
        v.set_current_node("los_angeles")  # 已离开亚洲
        valid, reason = v.is_action_valid("shanghai")  # 尝试回亚洲
        assert not valid
        assert reason == "irreversible_boundary"

    # ---- 第2层: 距离单调递减 ----
    def test_distance_bounding_blocks_far_detour(self):
        """跨洲场景下距离约束生效"""
        v = PhysicalBoundaryValidator("shenzhen", "new_york")
        v.set_current_node("shanghai")
        # 从上海选择鹿特丹：亚洲→北美只允许亚洲和北美，鹿特丹在欧洲
        valid, reason = v.is_action_valid("rotterdam")
        assert not valid

    def test_distance_bounding_allows_closer_node(self):
        """深圳→纽约时，上海比深圳更近纽约，应被允许"""
        v = PhysicalBoundaryValidator("shenzhen", "new_york")
        valid, reason = v.is_action_valid("shanghai")
        assert valid

    # ---- 第3层: 方向偏离检测 ----
    def test_vector_deviation_blocks_wrong_direction(self):
        """从纽约去洛杉矶时，选择飞往法兰克福（方向偏离>90°）应被拦截"""
        v = PhysicalBoundaryValidator("new_york", "los_angeles")
        # 法兰克福在欧洲，第1层(regional_wall)就会拦截
        valid, reason = v.is_action_valid("frankfurt")
        assert not valid
        assert reason == "regional_wall"

    # ---- 综合场景 ----
    def test_na_to_na_direct_route_allowed(self):
        """北美→北美直连路径应被允许"""
        v = PhysicalBoundaryValidator("new_york", "los_angeles")
        valid, reason = v.is_action_valid("los_angeles")
        assert valid
        assert reason == ""

    def test_asia_to_eu_allows_europe_nodes(self):
        """亚洲→欧洲允许经过欧洲节点"""
        v = PhysicalBoundaryValidator("shenzhen", "frankfurt")
        valid, reason = v.is_action_valid("rotterdam")
        assert valid
        assert reason == ""

    # ---- 反向走廊 ----
    def test_eu_to_asia_allows_asia_nodes(self):
        """欧洲→亚洲允许经过亚洲节点"""
        v = PhysicalBoundaryValidator("rotterdam", "shenzhen")
        valid, reason = v.is_action_valid("shanghai")
        assert valid
        assert reason == ""

    def test_eu_to_asia_allows_europe_nodes(self):
        """欧洲→亚洲允许经过欧洲节点"""
        v = PhysicalBoundaryValidator("rotterdam", "shenzhen")
        valid, reason = v.is_action_valid("frankfurt")
        assert valid
        assert reason == ""

    def test_na_to_asia_blocks_europe(self):
        """北美→亚洲不应经过欧洲"""
        v = PhysicalBoundaryValidator("new_york", "shenzhen")
        valid, reason = v.is_action_valid("rotterdam")
        assert not valid
        assert reason == "regional_wall"

    def test_na_to_eu_blocks_asia(self):
        """北美→欧洲不应经过亚洲"""
        v = PhysicalBoundaryValidator("los_angeles", "frankfurt")
        valid, reason = v.is_action_valid("shanghai")
        assert not valid
        assert reason == "regional_wall"

    # ---- 偏离惩罚 ----
    def test_deviation_penalty_severe(self):
        """严重偏离返回 -10000"""
        v = PhysicalBoundaryValidator("new_york", "los_angeles")
        # 法兰克福方向严重偏离洛杉矶方向
        penalty = v.compute_deviation_penalty("frankfurt")
        assert penalty == -10000.0

    def test_deviation_penalty_normal(self):
        """正常方向返回 0"""
        v = PhysicalBoundaryValidator("new_york", "los_angeles")
        penalty = v.compute_deviation_penalty("los_angeles")
        assert penalty == 0.0

    # ---- reset ----
    def test_reset_clears_state(self):
        v = PhysicalBoundaryValidator("shenzhen", "new_york")
        v.set_current_node("shanghai")
        v.reset()
        valid, reason = v.is_action_valid("shenzhen")
        # reset后 shenzhen 在 visited 中（起点），应被 cycle_prevention 拦截
        assert not valid
        assert reason == "cycle_prevention"
