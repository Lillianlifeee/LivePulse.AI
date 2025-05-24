from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import events, chat
from .sockets import sio_app
from .config import FRONTEND_URL

app = FastAPI()

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载 Socket.IO 应用
app.mount("/", sio_app)

# 注册路由
app.include_router(events.router)
app.include_router(chat.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "LivePulse.AI Backend API"} 