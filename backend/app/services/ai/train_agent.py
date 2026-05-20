"""
train_agent.py - PPO 训练与路线推断
使用 stable-baselines3 的 PPO 算法训练 LogisticsEnv，并提供结构化路线预测接口
"""

import json
import os
from typing import Any

from stable_baselines3 import PPO
from stable_baselines3.common.env_util import make_vec_env

from .logistics_env import LogisticsEnv
from .db_init import NODE_REGION

MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ppo_logistics_model.zip")


# ================================================================
# 训练
# ================================================================

def train_model(
    total_timesteps: int = 20_000,
    save_path: str = MODEL_PATH,
    w_cost: float = 0.5,
    w_time: float = 0.3,
    w_carbon: float = 0.2,
    verbose: int = 1,
) -> str:
    """
    训练 PPO 智能体并保存模型。

    参数:
        total_timesteps: 总训练步数
        save_path:       模型保存路径
        w_cost:          成本权重
        w_time:          时间权重
        w_carbon:        碳排放权重
        verbose:         日志级别 (0=静默, 1=训练信息)

    返回:
        模型文件的绝对路径
    """
    # SB3 要求 VecEnv，用 make_vec_env 包装
    env = make_vec_env(
        lambda: LogisticsEnv(w_cost=w_cost, w_time=w_time, w_carbon=w_carbon),
        n_envs=1,
    )

    model = PPO(
        policy="MlpPolicy",
        env=env,
        learning_rate=3e-4,
        n_steps=128,
        batch_size=64,
        n_epochs=10,
        gamma=0.99,
        gae_lambda=0.95,
        clip_range=0.2,
        verbose=verbose,
    )

    model.learn(total_timesteps=total_timesteps)
    model.save(save_path)
    env.close()

    print(f"[train_model] 模型已保存: {save_path}")
    return save_path


# ================================================================
# 推断
# ================================================================

def predict_route(
    start_node_name: str = "shenzhen",
    end_node_name: str = "new_york",
    w1: float = 0.5,
    w2: float = 0.3,
    w3: float = 0.2,
    model_path: str = MODEL_PATH,
) -> dict[str, Any]:
    """
    加载已训练模型，从起点到终点逐步推断最优路线。

    参数:
        start_node_name: 起点节点 ID (如 "shenzhen")
        end_node_name:   终点节点 ID (如 "new_york")
        w1:              成本权重
        w2:              时间权重
        w3:              碳排放权重
        model_path:      模型文件路径

    返回:
        结构化字典，包含完整路线和汇总数据。
    """
    model = PPO.load(model_path)

    # 用指定的起点 / 终点 / 权重创建推断环境
    env = LogisticsEnv(
        start_node=start_node_name,
        goal_node=end_node_name,
        w_cost=w1,
        w_time=w2,
        w_carbon=w3,
    )

    obs, info = env.reset()

    # 采集每一步的详情
    route_nodes: list[str] = [start_node_name]
    transport_modes: list[str] = []
    steps_detail: list[dict] = []
    total_time = 0.0
    total_cost = 0.0
    total_carbon = 0.0
    total_reward = 0.0
    reached_goal = False

    max_steps = env.max_steps
    for _ in range(max_steps):
        action, _ = model.predict(obs, deterministic=True)

        # 确认合法动作，若模型选择了非法动作则回退到第一个合法动作
        valid = env.get_valid_actions()
        if action not in valid:
            action = valid[0]

        # 禁止回头: 过滤掉会导致回到已访问节点的动作
        dst_node, _ = env._action_list[int(action)]
        if dst_node in env.visited_nodes:
            non_backtrack = [
                a for a in valid
                if env._action_list[a][0] not in env.visited_nodes
            ]
            if non_backtrack:
                action = non_backtrack[0]
            # 若所有动作都回头（死胡同），仍用原动作，让 env 终止回合

        step_info = env.action_to_route_step(int(action))

        obs, reward, terminated, truncated, info = env.step(int(action))

        # 回头惩罚: 不记录这一步的路径信息
        if info.get("backtrack"):
            total_reward += reward
            break

        # 物理边界拒绝: 不记录，尝试换一个合法动作
        if info.get("boundary_rejected"):
            total_reward += reward
            # 从合法动作中排除被拒绝的目标节点
            rejected_dst = env._action_list[int(action)][0]
            fallback = [
                a for a in valid
                if env._action_list[a][0] not in env.visited_nodes
                and env._action_list[a][0] != rejected_dst
            ]
            if fallback:
                # 重试：用备选动作再走一步
                action = fallback[0]
                step_info = env.action_to_route_step(int(action))
                obs, reward, terminated, truncated, info = env.step(int(action))
                if info.get("backtrack") or info.get("boundary_rejected"):
                    total_reward += reward
                    break
            else:
                break

        route_nodes.append(step_info["to"])
        transport_modes.append(step_info["mode"])
        steps_detail.append({
            "from": step_info["from"],
            "to": step_info["to"],
            "transport_mode": step_info["mode"],
            "time_days": step_info["time_days"],
            "cost_usd": step_info["cost_usd"],
            "carbon_kg": step_info["carbon_kg"],
        })
        total_time += step_info["time_days"]
        total_cost += step_info["cost_usd"]
        total_carbon += step_info["carbon_kg"]
        total_reward += reward

        if terminated:
            reached_goal = True
            break
        if truncated:
            break

    env.close()

    # ---------- 组装返回值 ----------
    result = {
        "start_node": start_node_name,
        "end_node": end_node_name,
        "reached_goal": reached_goal,
        "route_nodes": route_nodes,
        "transport_modes": transport_modes,
        "num_legs": len(transport_modes),
        "total_time_days": round(total_time, 2),
        "total_cost_usd": round(total_cost, 2),
        "total_carbon_kg": round(total_carbon, 2),
        "total_reward": round(total_reward, 2),
        "weights": {"w_cost": w1, "w_time": w2, "w_carbon": w3},
        "steps_detail": steps_detail,
    }

    # ---------- 路径合理性后置校验 ----------
    # 同大区起终点不应经过其他大区
    start_region = NODE_REGION.get(start_node_name, "")
    end_region = NODE_REGION.get(end_node_name, "")
    if start_region and end_region and start_region == end_region:
        for node in route_nodes:
            node_region = NODE_REGION.get(node, "")
            if node_region and node_region != start_region:
                result["path_warning"] = (
                    f"路径异常: {start_node_name}→{end_node_name} 同属{start_region}，"
                    f"但经过{node}({node_region})中转"
                )
                break

    return result
