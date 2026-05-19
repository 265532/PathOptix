"""chat service — LLM 流式对话核心逻辑。"""

from typing import AsyncIterator

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

from app.config import settings
from app.schemas.chat import ChatRequest

SYSTEM_PROMPT = (
    "你是一个专业的跨境物流智能管家。你需要解答用户的订单查询问题，"
    "并精通各国海关政策（如关税、禁运品等）。回答必须专业、热情、"
    "极其简明扼要，拒绝长篇大论，直接给出核心结论。"
)


def _build_messages(data: ChatRequest):
    """将请求转为 LangChain 消息列表。"""
    system = SYSTEM_PROMPT
    if data.context:
        system += f"\n\n【当前上下文】{data.context}"
    msgs = [SystemMessage(content=system)]
    for item in (data.history or []):
        if item.role == "user":
            msgs.append(HumanMessage(content=item.content))
        elif item.role == "assistant":
            msgs.append(AIMessage(content=item.content))
    msgs.append(HumanMessage(content=data.message))
    return msgs


def _create_llm() -> ChatOpenAI:
    """创建 DashScope ChatOpenAI 实例。"""
    return ChatOpenAI(
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
        api_key=settings.DASHSCOPE_API_KEY,
        model="qwen-turbo",
        temperature=0.5,
        streaming=True,
    )


async def stream_chat_response(data: ChatRequest) -> AsyncIterator[str]:
    """流式生成 LLM 回复，逐 chunk yield SSE 文本。"""
    llm = _create_llm()
    messages = _build_messages(data)
    async for chunk in llm.astream(messages):
        text = chunk.content
        if text:
            yield f"data: {text}\n\n"
    yield "data: [DONE]\n\n"
