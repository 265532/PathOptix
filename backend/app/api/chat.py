from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.schemas.chat import ChatRequest
from app.services.chat import stream_chat_response

# [DEMO MODE] 鉴权已禁用 — 所有接口允许匿名访问
router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("")
async def chat_stream(
    data: ChatRequest,
):
    """流式返回 LLM 生成内容 (SSE 格式)。"""
    return StreamingResponse(
        stream_chat_response(data),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )
