"""
logistics_env.py - 基于 Gymnasium 的跨境物流强化学习环境
从 db_init.build_graph() 获取图结构，支持多目标 Reward（成本 / 时间 / 碳排放）
"""

from __future__ import annotations

from typing import Any

import gymnasium as gym
import networkx as nx
from gymnasium import spaces

from .db_init import build_graph

DEFAULT_START = "shenzhen"
DEFAULT_GOAL = "new_york"


class LogisticsEnv(gym.Env):
    """
    跨境物流路径规划环境。

    observation: 当前所在节点的离散 ID (int)
    action:      离散动作，索引映射到 (目标节点, 运输方式) 二元组
    reward:      到达终点 +100，否则每步 -(W1*成本 + W2*时间 + W3*碳排)
    """

    metadata = {"render_modes": ["human"]}

    def __init__(
        self,
        graph: nx.DiGraph | None = None,
        start_node: str = DEFAULT_START,
        goal_node: str = DEFAULT_GOAL,
        w_cost: float = 0.5,
        w_time: float = 0.3,
        w_carbon: float = 0.2,
        max_steps: int = 15,
        render_mode: str | None = None,
    ):
        super().__init__()

        self.start_node = start_node
        self.goal_node = goal_node
        self.w_cost = w_cost
        self.w_time = w_time
        self.w_carbon = w_carbon
        self.max_steps = max_steps
        self.render_mode = render_mode

        # ---------- 加载图 ----------
        self._G: nx.DiGraph = graph if graph is not None else build_graph()
        self._build_internal_graph()

        # ---------- 索引映射 ----------
        self._node_ids: list[str] = sorted(self._graph.keys())
        self._node_to_idx: dict[str, int] = {nid: i for i, nid in enumerate(self._node_ids)}

        # 动作列表: action_idx -> (neighbor_id, transport_mode)
        self._action_list: list[tuple[str, str]] = []
        for nid in self._node_ids:
            for nb, mode, _ in self._graph[nid]:
                pair = (nb, mode)
                if pair not in self._action_list:
                    self._action_list.append(pair)

        self._num_nodes = len(self._node_ids)
        self._num_actions = len(self._action_list)

        # ---------- Gymnasium spaces ----------
        self.observation_space = spaces.Discrete(self._num_nodes)
        self.action_space = spaces.Discrete(self._num_actions)

        # ---------- 运行时状态 ----------
        self._current_node: str = start_node
        self._steps_taken: int = 0
        self.visited_nodes: set[str] = set()

    # ================================================================
    # 图构建
    # ================================================================

    def _build_internal_graph(self):
        """
        将 NetworkX DiGraph 转换为内部邻接表格式:
        dict[node_id] -> list[(neighbor_id, transport_mode, edge_info)]
        """
        self._graph: dict[str, list[tuple[str, str, dict[str, float]]]] = {}
        for nid in self._G.nodes:
            self._graph.setdefault(nid, [])
        for u, v, data in self._G.edges(data=True):
            edge_info = {
                "time_days": data["time_days"],
                "cost_usd": data["cost_usd"],
                "carbon_kg": data["carbon_kg"],
            }
            self._graph[u].append((v, data["transport_mode"], edge_info))

    # ================================================================
    # Gymnasium 接口
    # ================================================================

    def reset(
        self,
        *,
        seed: int | None = None,
        options: dict[str, Any] | None = None,
    ) -> tuple[int, dict]:
        super().reset(seed=seed)
        self._current_node = self.start_node
        self._steps_taken = 0
        self.visited_nodes = {self.start_node}
        obs = self._node_to_idx[self._current_node]
        info = self._get_info()
        return obs, info

    def step(self, action: int) -> tuple[int, float, bool, bool, dict]:
        """
        执行动作，返回 (observation, reward, terminated, truncated, info)。
        """
        self._steps_taken += 1

        if action < 0 or action >= self._num_actions:
            raise ValueError(f"无效动作 {action}，合法范围 [0, {self._num_actions})")

        dst_node, mode = self._action_list[action]

        # 检查是否是当前节点的合法 (邻居, 运输方式)
        valid_neighbors = {
            (nb, m) for nb, m, _ in self._graph.get(self._current_node, [])
        }
        if (dst_node, mode) not in valid_neighbors:
            reward = -50.0
            terminated = False
            truncated = self._steps_taken >= self.max_steps
            obs = self._node_to_idx[self._current_node]
            info = self._get_info()
            info["illegal_action"] = True
            return obs, reward, terminated, truncated, info

        # ----- 禁止回头: 目标节点已访问过则强惩罚并终止 -----
        if dst_node in self.visited_nodes:
            obs = self._node_to_idx[self._current_node]
            info = self._get_info()
            info["backtrack"] = True
            return obs, -50.0, True, False, info

        # 查找边属性
        edge_info = None
        for nb, m, ei in self._graph[self._current_node]:
            if nb == dst_node and m == mode:
                edge_info = ei
                break

        # 移动
        self._current_node = dst_node
        self.visited_nodes.add(self._current_node)

        # Reward
        terminated = self._current_node == self.goal_node
        if terminated:
            reward = 100.0
        else:
            reward = -(
                self.w_cost * edge_info["cost_usd"]
                + self.w_time * edge_info["time_days"]
                + self.w_carbon * edge_info["carbon_kg"]
            )

        truncated = not terminated and self._steps_taken >= self.max_steps

        obs = self._node_to_idx[self._current_node]
        info = self._get_info()
        return obs, reward, terminated, truncated, info

    def _get_info(self) -> dict:
        return {
            "current_node": self._current_node,
            "steps_taken": self._steps_taken,
            "goal_node": self.goal_node,
        }

    def render(self):
        if self.render_mode == "human":
            print(
                f"Step {self._steps_taken}: "
                f"当前节点={self._current_node}, 目标={self.goal_node}"
            )

    def close(self):
        pass

    # ================================================================
    # 辅助方法
    # ================================================================

    def get_valid_actions(self) -> list[int]:
        """返回当前节点所有合法动作索引。"""
        neighbors = {
            (nb, m) for nb, m, _ in self._graph.get(self._current_node, [])
        }
        return [i for i, pair in enumerate(self._action_list) if pair in neighbors]

    def action_to_route_step(self, action: int) -> dict:
        """将动作索引转换为可读信息。"""
        dst, mode = self._action_list[action]
        for nb, m, ei in self._graph.get(self._current_node, []):
            if nb == dst and m == mode:
                return {"from": self._current_node, "to": dst, "mode": mode, **ei}
        return {"from": self._current_node, "to": dst, "mode": mode}
