"""
AI 服务模块 - 调用 OpenAI API
"""
from typing import AsyncGenerator
import openai
import logging
import traceback
import json

logger = logging.getLogger(__name__)


async def chat_completion_stream(
    messages: list,
    api_key: str,
    base_url: str,
    model: str
) -> AsyncGenerator[str, None]:
    """
    流式调用 AI API
    
    Args:
        messages: 消息历史列表 [{"role": "user", "content": "..."}, ...]
        api_key: AI API Key
        base_url: AI API Base URL
        model: 模型名称
        
    Yields:
        str: 流式返回的文本片段
    """
    logger.info(f"开始调用 AI API")
    logger.info(f"  Model: {model}")
    logger.info(f"  Base URL: {base_url}")
    logger.info(f"  API Key: {api_key[:10]}..." if api_key else "  API Key: None")
    logger.info(f"  消息数量: {len(messages)}")
    
    client = openai.AsyncOpenAI(
        api_key=api_key,
        base_url=base_url
    )
    
    try:
        logger.info("正在创建流式请求...")
        stream = await client.chat.completions.create(
            model=model,
            messages=messages,
            stream=True
        )
        
        logger.info("开始接收流式响应...")
        has_content = False
        chunk_count = 0
        
        async for chunk in stream:
            chunk_count += 1
            
            # 详细记录每个 chunk
            logger.debug(f"收到 chunk #{chunk_count}:")
            logger.debug(f"  chunk.choices: {chunk.choices}")
            
            if chunk.choices:
                logger.debug(f"  choices[0].delta: {chunk.choices[0].delta}")
                logger.debug(f"  delta.content: {chunk.choices[0].delta.content}")
                logger.debug(f"  finish_reason: {chunk.choices[0].finish_reason}")
            
            if chunk.choices and chunk.choices[0].delta.content:
                has_content = True
                content = chunk.choices[0].delta.content
                logger.info(f"✅ 收到内容 chunk #{chunk_count}: {content[:50]}...")
                yield content
            else:
                logger.debug(f"⚠️ Chunk #{chunk_count} 没有内容")
        
        logger.info(f"流式响应完成，共收到 {chunk_count} 个 chunk，有内容: {has_content}")
        
        if not has_content:
            logger.warning("AI 返回内容为空")
            yield "⚠️ AI 没有返回任何内容\n\n可能的原因：\n1. API Key 无效或过期\n2. Base URL 配置错误\n3. 模型名称不支持\n4. API 配额不足"
            
    except Exception as e:
        error_type = type(e).__name__
        error_msg = str(e)
        logger.error(f"AI 调用失败: {error_type}: {error_msg}")
        logger.error(f"完整错误:\n{traceback.format_exc()}")
        
        yield f"\n\n❌ 调用失败\n"
        yield f"错误类型: {error_type}\n"
        yield f"错误信息: {error_msg}\n\n"
        yield "请检查：\n"
        yield f"1. Base URL: {base_url}\n"
        yield f"2. 模型名称: {model}\n"
        yield "3. API Key 是否有效\n"
