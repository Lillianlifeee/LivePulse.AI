from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set")

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent"

class ChatRequest(BaseModel):
    message: str
    context: Dict[str, Any]

class ChatResponse(BaseModel):
    response: str

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # 构建系统提示，包含实时数据上下文
        system_prompt = f"""你是一个专业的直播销售策略顾问。你将根据实时数据为用户提供销售策略建议。

当前数据概况：
- 总销售额: ¥{request.context['globalStats']['total_sales']}
- 总利润: ¥{request.context['globalStats']['total_profit']}
- 直播间数量: {len(request.context['liveRooms'])}

直播间详情：
{chr(10).join([f"- {room['host_name']}: {room['viewers']}观众, {room['conversion_rate']*100:.1f}%转化率" for room in request.context['liveRooms']])}

请基于以上数据，为用户提供专业、具体且可操作的建议。回答要简洁明了，重点突出。"""

        # 准备发送给 Gemini API 的消息
        # Gemini API expects a list of "parts" for content, and roles are typically "user" and "model"
        # The system prompt can be the first part of the user's message, or handled differently depending on specific Gemini model best practices.
        # For simplicity, we'll prepend system prompt to user message here.
        contents = [
            {
                "role": "user",
                "parts": [{"text": system_prompt + "\n\n" + request.message}]
            }
        ]

        # 调用 Gemini API
        async with httpx.AsyncClient() as client:
            try:
                print("[CHAT_API] Attempting to call Gemini API...")
                response = await client.post(
                    f"{GEMINI_API_URL}?key={GEMINI_API_KEY}", # API key is often sent as a query parameter
                    headers={
                        "Content-Type": "application/json"
                    },
                    json={
                        "contents": contents,
                        # "generationConfig": { # Optional: configure temperature, max_tokens etc.
                        # "temperature": 0.7,
                        # "maxOutputTokens": 1000
                        # }
                    },
                    timeout=30.0
                )
                
                response.raise_for_status()  # 如果响应状态码不是2xx，抛出异常
                
                ai_response = response.json()
                print(f"[CHAT_API] Received response from Gemini API: {ai_response}")
                
                # Extracting text from Gemini's response structure
                # This might need adjustment based on the exact Gemini model and response
                if "candidates" not in ai_response or not ai_response["candidates"] or \
                   "content" not in ai_response["candidates"][0] or \
                   "parts" not in ai_response["candidates"][0]["content"] or not ai_response["candidates"][0]["content"]["parts"] or \
                   "text" not in ai_response["candidates"][0]["content"]["parts"][0]:
                    raise ValueError("Invalid response format from Gemini API")
                
                return ChatResponse(response=ai_response['candidates'][0]['content']['parts'][0]['text'])
                
            except httpx.HTTPStatusError as e:
                error_message = f"Gemini API error: {e.response.status_code}"
                print(f"[CHAT_API] HTTPStatusError: {error_message} - Response: {e.response.text}")
                try:
                    error_data = e.response.json()
                    if "error" in error_data and "message" in error_data["error"] :
                        error_message = f"Gemini API error: {error_data['error']['message']}"
                except:
                    pass # Keep the original status code error if parsing fails
                raise HTTPException(status_code=500, detail=error_message)
                
            except httpx.RequestError as e:
                print(f"[CHAT_API] RequestError: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Network error: {str(e)}")
            except ValueError as e:
                print(f"[CHAT_API] ValueError (likely invalid response format): {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error processing Gemini response: {str(e)}")
            except Exception as e:
                print(f"[CHAT_API] Unexpected error during Gemini API call: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

    except Exception as e:
        print(f"[CHAT_API] Outer exception: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 