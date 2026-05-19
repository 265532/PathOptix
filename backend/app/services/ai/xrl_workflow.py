"""
xrl_workflow.py - 基于 LangGraph 的可解释性物流工作流
节点 1: RL 推断最优路径
节点 2: LLM 生成通俗中文解释报告
"""

from __future__ import annotations

import json
from typing import Any

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import END, START, StateGraph
from typing_extensions import TypedDict

from .train_agent import predict_route
from app.config import settings


# ================================================================
# 状态定义
# ================================================================

class LogisticsState(TypedDict):
    # --- 输入 ---
    start_node: str
    end_node: str
    w1: float        # 成本权重
    w2: float        # 时间权重
    w3: float        # 碳排放权重

    # --- 中间 ---
    rl_path_json: dict[str, Any]

    # --- 输出 ---
    explanation_report: str


# ================================================================
# 节点 1: RL 推断
# ================================================================

def rl_node(state: LogisticsState) -> dict:
    """调用强化学习模型推断最优路径。"""
    rl_result = predict_route(
        start_node_name=state["start_node"],
        end_node_name=state["end_node"],
        w1=state["w1"],
        w2=state["w2"],
        w3=state["w3"],
    )
    print(f"[rl_node] 路径推断完成: {' -> '.join(rl_result['route_nodes'])}")
    return {"rl_path_json": rl_result}


# ================================================================
# 节点 2: LLM 解释
# ================================================================

async def llm_node(state: LogisticsState) -> dict:
    """调用大模型，对 RL 推断路径生成通俗解释。"""
    llm = ChatOpenAI(
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
        api_key=settings.DASHSCOPE_API_KEY,
        model="qwen-turbo",
        temperature=0.5,
        max_tokens=400,
    )

    path_text = json.dumps(state["rl_path_json"], ensure_ascii=False, indent=2)

    system_prompt = (
        "你是一个资深的国际物流规划师。"
        "AI算法刚刚计算出了一条最优路径：\n"
        f"{path_text}\n\n"
        f"客户目前的偏好权重是：成本={state['w1']}, 时效={state['w2']}, 碳排放={state['w3']}。\n"
        "请用专业且通俗的中文，向客户简要解释为什么推荐这条路径，以及在成本💰、时效⏱️、碳排放🌱上的综合考量。\n"
        "【输出要求】：字数控制在200~300字左右，必须使用emoji表情符号（如💰⏱️🌱✈️🚢🚛📊✅）让输出生动直观，不要写标题和分段，一段话说完。"
    )

    response = await llm.ainvoke([
        SystemMessage(content="你是一位资深国际物流规划师，擅长用通俗语言解释物流方案。回答简洁有条理，善用emoji表情，200~300字。"),
        HumanMessage(content=system_prompt),
    ])

    report = response.content
    print(f"[llm_node] 解释报告生成完成 ({len(report)} 字符)")
    return {"explanation_report": report}


# ================================================================
# 图编排 & 对外接口
# ================================================================

def _build_graph() -> StateGraph:
    """构建并编译 LangGraph 工作流。"""
    graph = StateGraph(LogisticsState)
    graph.add_node("rl_node", rl_node)
    graph.add_node("llm_node", llm_node)
    graph.add_edge(START, "rl_node")
    graph.add_edge("rl_node", "llm_node")
    graph.add_edge("llm_node", END)
    return graph.compile()


# 预编译的工作流实例
_app = _build_graph()


async def run_logistics_pipeline(
    start_node: str = "shenzhen",
    end_node: str = "new_york",
    w1: float = 0.5,
    w2: float = 0.3,
    w3: float = 0.2,
) -> dict[str, Any]:
    """
    执行完整的物流推断 + 解释流水线。

    参数:
        start_node: 起点节点 ID
        end_node:   终点节点 ID
        w1:         成本权重
        w2:         时间权重
        w3:         碳排放权重

    返回:
        {
            "rl_path_json":        RL 推断的路径 JSON,
            "explanation_report":  LLM 生成的中文解释报告
        }
    """
    initial_state: LogisticsState = {
        "start_node": start_node,
        "end_node": end_node,
        "w1": w1,
        "w2": w2,
        "w3": w3,
        "rl_path_json": {},
        "explanation_report": "",
    }

    final_state = await _app.ainvoke(initial_state)

    return {
        "rl_path_json": final_state["rl_path_json"],
        "explanation_report": final_state["explanation_report"],
    }
