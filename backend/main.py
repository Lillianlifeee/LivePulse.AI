import asyncio
import json
import random
import time
import signal
import sys
from datetime import datetime
from typing import Dict, List, Optional

import socketio
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
import os

# Import event triggers
from event_triggers import get_all_events, get_event_by_id, apply_event_effects

# Import chat router
from app.routers import chat as chat_router # Assuming chat.py is in backend/app/routers/

# Initialize FastAPI app
app = FastAPI(title="LivePulse.AI - Live Stream Sales Management")

# 创建一个运行状态标志
running = True # This will be controlled by startup/shutdown events now

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include chat router
app.include_router(chat_router.router, prefix="/api")

# Initialize Socket.IO server
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    ping_timeout=20,
    ping_interval=25,
    max_http_buffer_size=1000000,
    always_connect=True,
    logger=True,
    engineio_logger=True
)

# Create an ASGI app that combines FastAPI and Socket.IO
# The FastAPI app ('app') already has CORS middleware.
# This 'application' should be what uvicorn serves.
application = socketio.ASGIApp(sio, app)

# Mount static files if frontend build directory exists
frontend_build_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend/build"))
if os.path.exists(frontend_build_dir):
    app.mount("/", StaticFiles(directory=frontend_build_dir, html=True), name="static")

# Data models
class LiveRoom(BaseModel):
    id: str
    name: str
    host_name: str
    viewers: int = 0
    sales: float = 0
    conversion_rate: float = 0
    health_status: str = "green"  # green, yellow, red
    products: List[Dict] = []
    start_time: Optional[str] = None


# In-memory data store
live_rooms: Dict[str, LiveRoom] = {}
agent_logs: List[Dict] = []
global_stats = {
    "total_sales": 0,
    "total_profit": 0,
    "active_rooms": 0,
    "inventory_health": "green",
    "start_time": datetime.now().isoformat(),
}


# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.connection_count = 0

    async def connect(self, websocket: WebSocket):
        try:
            await websocket.accept()
            self.active_connections.append(websocket)
            self.connection_count += 1
            print(f"New connection established. Total connections: {self.connection_count}")
        except Exception as e:
            print(f"Error accepting WebSocket connection: {e}")
            return

    def disconnect(self, websocket: WebSocket):
        try:
            self.active_connections.remove(websocket)
            self.connection_count -= 1
            print(f"Connection closed. Total connections: {self.connection_count}")
        except ValueError:
            pass

    async def broadcast(self, message: str):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.append(connection)
        
        # Clean up any disconnected clients
        for connection in disconnected:
            self.disconnect(connection)


manager = ConnectionManager()


# API Routes
@app.get("/")
async def root():
    return {"message": "Welcome to LivePulse.AI API"}


@app.get("/live-rooms")
async def get_live_rooms():
    return list(live_rooms.values())


@app.get("/live-rooms/{room_id}")
async def get_live_room(room_id: str):
    if room_id not in live_rooms:
        return {"error": "Room not found"}
    return live_rooms[room_id]


@app.get("/agent-logs")
async def get_agent_logs(limit: int = 50):
    return agent_logs[-limit:]


@app.get("/global-stats")
async def get_global_stats():
    return global_stats


@app.get("/events")
async def get_events():
    """Get all available event triggers"""
    return get_all_events()


@app.post("/trigger-event/{event_id}")
async def trigger_event(event_id: str, room_id: str = None):
    """Trigger a specific event in a specific room or random room"""
    event = get_event_by_id(event_id)
    if not event:
        return {"error": "Event not found"}
    
    if room_id and room_id not in live_rooms:
        return {"error": "Room not found"}
    
    # If no room_id specified, choose a random room
    if not room_id:
        room_id = random.choice(list(live_rooms.keys()))
    
    room = live_rooms[room_id]
    
    # Apply the event effects
    raw_event_logs = apply_event_effects(event, room, global_stats, agent_logs)
    
    processed_event_logs = []
    if raw_event_logs: # Ensure there are logs to process
        for log_entry in raw_event_logs:
            # Assuming log_entry is a dict. If it's an object, attribute access would be needed.
            # This modification will affect the log_entry in the global agent_logs list
            # if apply_event_effects appends references to the same objects it returns.
            log_entry['source'] = 'triggered_event_effect'
            processed_event_logs.append(log_entry)
    
    # Emit the updated data and logs
    await sio.emit("live_rooms", [room.model_dump() for room in live_rooms.values()])
    await sio.emit("global_stats", global_stats)
    if processed_event_logs:
        for log in processed_event_logs:
            await sio.emit("agent_log", log)
    
    return {"success": True, "message": f"Event '{event.name}' triggered in room '{room.name}'"}


# WebSocket endpoint for real-time updates
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# Socket.IO events
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")
    # Send initial data
    await sio.emit('live_rooms', [room.model_dump() for room in live_rooms.values()], to=sid)
    await sio.emit('global_stats', global_stats, to=sid)
    await sio.emit('agent_logs', agent_logs[-50:], to=sid)  # Send last 50 logs


@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")


# Data simulation functions
def generate_random_product(product_id: str, category: str) -> Dict:
    # Define food-specific categories and names
    food_categories = {
        "snacks": ["什锦饼干礼盒", "进口巧克力", "网红辣条", "坚果大礼包", "薯片零食"],
        "drinks": ["有机牛奶", "果汁饮料", "气泡水", "咖啡豆", "茶叶礼盒"],
        "fresh": ["新鲜水果拼盘", "有机蔬菜", "生鲜海鲜", "冷鲜肉品", "乳制品"],
        "instant": ["速食拌饭", "方便面", "即食麦片", "速食汤品", "冻干食品"],
        "specialty": ["手工水饺", "风味香肠", "地方特产", "传统糕点", "调味酱料"]
    }
    
    # Select a random subcategory and its items
    subcategory = random.choice(list(food_categories.keys()))
    product_names = food_categories[subcategory]
    
    # Food-specific attributes
    sizes = ["小份", "标准", "家庭装", "派对装", "礼盒装"]
    flavors = ["原味", "香辣", "海苔", "芝士", "五香", "咖喱", "酱香", "甜辣", "麻辣", "清淡"]
    
    # Generate price and stock appropriate for food items
    base_price = {
        "snacks": (15, 50),
        "drinks": (20, 80),
        "fresh": (30, 150),
        "instant": (10, 40),
        "specialty": (25, 100)
    }
    
    price_range = base_price.get(subcategory, (20, 100))
    price = random.uniform(*price_range)
    stock = random.randint(100, 1000)  # Food items typically need more stock
    
    return {
        "id": product_id,
        "name": f"{random.choice(product_names)}",  # Remove the ID suffix for more natural names
        "price": round(price, 2),
        "original_price": round(price * random.uniform(1.1, 1.3), 2),
        "stock": stock,
        "initial_stock": stock,
        "sales": 0,
        "size": random.choice(sizes),
        "color": random.choice(flavors),  # Using flavors instead of colors
        "predicted_sales": 0,
        "stock_status": "充足",
        "ai_actions": [],
    }


def create_live_rooms():
    # Food-themed room names
    food_room_themes = [
        "深夜食堂 - 宵夜美食汇",
        "环球零食发现之旅",
        "健康轻食料理坊",
        "烘焙甜蜜时光屋",
        "妈妈的味道 - 家常菜精选"
    ]
    
    # Virtual host names themed around food
    virtual_host_names = [
        "食神小当家",
        "味蕾探险家Alice",
        "美食达人小K",
        "烹饪大师阿福",
        "甜点魔法师Lila"
    ]
    
    for i in range(5):  # Create 5 live rooms
        room_id = f"room_{i+1}"
        
        # Each room gets a unique theme and host
        room_name = food_room_themes[i]
        host_name = virtual_host_names[i]
        
        # Generate 3-6 food products for each room
        products = [
            generate_random_product(f"prod_{i+1}_{j+1}", "food")
            for j in range(random.randint(3, 6))
        ]
        
        live_rooms[room_id] = LiveRoom(
            id=room_id,
            name=room_name,
            host_name=host_name,
            viewers=random.randint(1000, 10000),
            sales=0,
            conversion_rate=random.uniform(0.01, 0.05),
            health_status="green",
            products=products,
            start_time=datetime.now().isoformat(),
        )
    
    global_stats["active_rooms"] = len(live_rooms)


def generate_agent_log(room_id: str, action_type: str, message: str, impact: str = None):
    room = live_rooms.get(room_id)
    if not room:
        return
    
    action_colors = {
        "销售预测": "green",
        "库存预警": "orange",
        "仓储管理": "blue",
        "舆情分析": "purple",
        "营销策略": "teal",
        "异常流量": "red",
    }
    
    log = {
        "timestamp": datetime.now().isoformat(),
        "room_id": room_id,
        "room_name": room.name,
        "action_type": action_type,
        "message": message,
        "impact": impact,
        "color": action_colors.get(action_type, "gray"),
    }
    
    agent_logs.append(log)
    return log


async def simulate_data():
    global running
    create_live_rooms()
    
    # 存储上一次的观众数，用于检测异常流量
    previous_viewers = {room_id: room.viewers for room_id, room in live_rooms.items()}
    
    while running:
        try:
            # Update each live room
            for room_id, room in live_rooms.items():
                # Simulate viewer count changes
                viewer_change = random.randint(-100, 200)
                room.viewers = max(100, room.viewers + viewer_change)
                
                # 检测异常流量
                if room_id in previous_viewers:
                    viewer_change_percentage = (room.viewers - previous_viewers[room_id]) / previous_viewers[room_id] * 100
                    
                    # 如果观众数变化超过15%，生成异常流量日志
                    if abs(viewer_change_percentage) > 15:
                        direction = "激增" if viewer_change_percentage > 0 else "骤降"
                        log = generate_agent_log(
                            room_id,
                            "异常流量",
                            f"检测到直播间观众{direction}，变化幅度{abs(viewer_change_percentage):.1f}%",
                            f"当前观众数：{room.viewers}人，AI助手正在分析原因"
                        )
                        if log:
                            await sio.emit("agent_log", log)
                
                # 更新上一次的观众数
                previous_viewers[room_id] = room.viewers
                
                # Simulate product sales
                for product in room.products:
                    if product["stock"] > 0:
                        sales_count = random.randint(0, 3)
                        if sales_count > product["stock"]:
                            sales_count = product["stock"]
                        
                        product["stock"] -= sales_count
                        product["sales"] += sales_count
                        sales_amount = sales_count * product["price"]
                        room.sales += sales_amount
                        global_stats["total_sales"] += sales_amount
                        global_stats["total_profit"] += sales_amount * 0.3  # Assume 30% profit margin
                        
                        # Update stock status
                        stock_percentage = product["stock"] / product["initial_stock"]
                        if stock_percentage < 0.1:
                            product["stock_status"] = "告急"
                            if random.random() < 0.3:  # 30% chance to generate a warning
                                log = generate_agent_log(
                                    room_id,
                                    "库存预警",
                                    f"{product['name']} 库存告急，仅剩{product['stock']}件！",
                                    "库存健康度调为红色"
                                )
                                if log:
                                    await sio.emit("agent_log", log)
                        elif stock_percentage < 0.3:
                            product["stock_status"] = "紧张"
                            if random.random() < 0.2:  # 20% chance to generate a warning
                                log = generate_agent_log(
                                    room_id,
                                    "库存预警",
                                    f"{product['name']} 库存偏低，当前{product['stock']}件",
                                    "建议及时补货以维持销售"
                                )
                                if log:
                                    await sio.emit("agent_log", log)
                        else:
                            product["stock_status"] = "充足"
                
                # Update room conversion rate
                if room.viewers > 0:
                    total_sales = sum(p["sales"] for p in room.products)
                    room.conversion_rate = total_sales / room.viewers
                
                # Generate AI insights
                if random.random() < 0.1:  # 10% chance to generate insights
                    insight_types = [
                        ("销售预测", "预计未来1小时销售额将增长20%", "销售预测调整"),
                        ("舆情分析", "直播间氛围活跃，用户评价正面", "直播间健康度保持绿色"),
                        ("营销策略", "建议开展限时促销活动", "预期提升转化率5%"),
                    ]
                    insight = random.choice(insight_types)
                    log = generate_agent_log(room_id, *insight)
                    if log:
                        await sio.emit("agent_log", log)
            
            # Update global stats
            total_viewers = sum(room.viewers for room in live_rooms.values())
            total_sales = sum(room.sales for room in live_rooms.values())
            if total_viewers > 0:
                global_stats["avg_conversion_rate"] = total_sales / total_viewers
            
            # Emit updated data
            await sio.emit("live_rooms", [room.model_dump() for room in live_rooms.values()])
            await sio.emit("global_stats", global_stats)
            
            await asyncio.sleep(2)  # Update every 2 seconds
            
        except Exception as e:
            print(f"Error in simulation: {str(e)}")
            await asyncio.sleep(5)  # Wait 5 seconds before retrying


@app.on_event("startup")
async def startup_event():
    # global loop # No longer needed
    # loop = asyncio.get_event_loop() # No longer needed
    global running
    running = True # Ensure running is true at startup
    app.state.simulation_task = asyncio.create_task(simulate_data())
    print("Data simulation task started.")


@app.on_event("shutdown")
async def shutdown_event():
    global running
    # global loop # No longer needed
    print("服务器正在关闭 (shutdown_event)...")
    running = False # Signal the simulation loop to stop

    if hasattr(app.state, "simulation_task") and app.state.simulation_task:
        print("Waiting for simulation task to complete...")
        try:
            await asyncio.wait_for(app.state.simulation_task, timeout=5.0) # Wait for 5 seconds
            print("Simulation task completed.")
        except asyncio.TimeoutError:
            print("Simulation task did not complete in time, cancelling.")
            app.state.simulation_task.cancel()
            try:
                await app.state.simulation_task
            except asyncio.CancelledError:
                print("Simulation task successfully cancelled.")
        except Exception as e:
            print(f"Error during simulation task shutdown: {e}")
    
    # Remove manual loop stop, Uvicorn handles its own loop.
    # if loop and loop.is_running():
    #     tasks = [t for t in asyncio.all_tasks(loop) if t is not asyncio.current_task(loop)]
    #     if tasks:
    #         print(f"等待 {len(tasks)} 个后台任务完成...")
    #         await asyncio.wait(tasks, timeout=5.0) 
    #     loop.stop()
    #     print("事件循环已停止。")
    print("清理完成，服务器已关闭 (shutdown_event).")


if __name__ == "__main__":
    # This part is for direct execution (e.g., python main.py)
    # The start.sh script uses `uvicorn main:application`, so it targets the 'application' object specifically.
    # To run with uvicorn and serve the 'application' (Socket.IO wrapped),
    # the command should be `uvicorn main:application`
    print("Starting server with Uvicorn (from if __name__ == \"__main__\")...")
    # loop = asyncio.get_event_loop() # Not needed when Uvicorn manages the loop
    uvicorn.run(application, host="0.0.0.0", port=8200, loop="asyncio") 