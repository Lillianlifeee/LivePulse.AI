import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any

from pydantic import BaseModel


class EventTrigger(BaseModel):
    id: str
    name: str
    description: str
    type: str  # positive, negative
    effects: Dict[str, Any]


# Predefined event triggers
PREDEFINED_EVENTS = [
    # Positive events
    EventTrigger(
        id="competitor_offline",
        name="竞品主播下线",
        description="竞品主播突然下线，流量涌入",
        type="positive",
        effects={
            "viewers_change": (1000, 5000),  # Random range for viewer increase
            "conversion_boost": 0.02,  # Conversion rate boost
            "duration": 300,  # Effect lasts for 5 minutes
        },
    ),
    EventTrigger(
        id="kol_promotion",
        name="KOL推荐爆火",
        description="某商品被知名KOL推荐，瞬间爆火",
        type="positive",
        effects={
            "product_sales_multiplier": 5,  # Sales rate multiplied by 5
            "viewers_change": (2000, 8000),
            "duration": 600,  # Effect lasts for 10 minutes
        },
    ),
    EventTrigger(
        id="host_performance",
        name="主播超常发挥",
        description="主播超常发挥，互动率飙升",
        type="positive",
        effects={
            "conversion_boost": 0.05,
            "viewers_change": (500, 2000),
            "duration": 450,  # Effect lasts for 7.5 minutes
        },
    ),
    
    # Negative events
    EventTrigger(
        id="stock_shortage",
        name="核心商品库存不足",
        description="核心商品库存不足",
        type="negative",
        effects={
            "stock_reduction": 0.8,  # Reduce stock by 80%
            "duration": 600,
        },
    ),
    EventTrigger(
        id="negative_comments",
        name="负面评论增多",
        description="直播间出现大量负面评论",
        type="negative",
        effects={
            "conversion_penalty": 0.03,  # Reduce conversion rate
            "viewers_change": (-2000, -500),  # Lose viewers
            "duration": 300,
        },
    ),
    EventTrigger(
        id="host_mistake",
        name="主播口误",
        description="主播口误/表现不佳",
        type="negative",
        effects={
            "conversion_penalty": 0.02,
            "viewers_change": (-1000, -200),
            "duration": 180,  # Effect lasts for 3 minutes
        },
    ),
    EventTrigger(
        id="competitor_discount",
        name="竞争对手降价",
        description="竞争对手突然推出同类商品并大幅降价",
        type="negative",
        effects={
            "conversion_penalty": 0.04,
            "viewers_change": (-1500, -300),
            "duration": 900,  # Effect lasts for 15 minutes
        },
    ),
    EventTrigger(
        id="network_issues",
        name="网络波动",
        description="外部网络波动，直播间观看人数骤降",
        type="negative",
        effects={
            "viewers_change": (-4000, -1000),
            "duration": 240,  # Effect lasts for 4 minutes
        },
    ),
    EventTrigger(
        id="logistics_failure",
        name="物流系统故障",
        description="物流系统故障，发货延迟",
        type="negative",
        effects={
            "conversion_penalty": 0.03,
            "duration": 1200,  # Effect lasts for 20 minutes
        },
    ),
]


def get_all_events():
    return PREDEFINED_EVENTS


def get_event_by_id(event_id: str) -> Optional[EventTrigger]:
    for event in PREDEFINED_EVENTS:
        if event.id == event_id:
            return event
    return None


# 仓库管理策略
INVENTORY_STRATEGIES = [
    "实时库存预测",
    "智能补货计划",
    "多仓协同调度",
    "库存优化分配",
    "紧急调货方案",
    "销量预测补货",
    "供应链协调"
]

# 仓库位置
WAREHOUSE_LOCATIONS = [
    "上海中心仓",
    "广州南方仓",
    "北京北方仓",
    "成都西部仓",
    "武汉中部仓"
]

# 物流方式
LOGISTICS_METHODS = [
    "特快直达",
    "空运专线",
    "城市即时达",
    "次日达",
    "优先配送"
]


def apply_event_effects(event: EventTrigger, live_room, global_stats, agent_logs):
    """Apply the effects of an event to a live room and generate appropriate logs"""
    
    effects = event.effects
    room_id = live_room.id
    
    # Create log entry for the event
    log = {
        "timestamp": datetime.now().isoformat(),
        "room_id": room_id,
        "room_name": live_room.name,
        "action_type": "事件触发",
        "message": f"触发事件：{event.name} - {event.description}",
        "impact": "AI Agent正在分析并采取应对措施...",
        "color": "green" if event.type == "positive" else "red",
    }
    
    agent_logs.append(log)
    
    # Apply viewer changes
    if "viewers_change" in effects:
        min_change, max_change = effects["viewers_change"]
        viewer_change = random.randint(min_change, max_change)
        live_room.viewers = max(100, live_room.viewers + viewer_change)
        
        # Log the viewer change
        direction = "增加" if viewer_change > 0 else "减少"
        abs_change = abs(viewer_change)
        
        log = {
            "timestamp": datetime.now().isoformat(),
            "room_id": room_id,
            "room_name": live_room.name,
            "action_type": "观众变化",
            "message": f"直播间观众{direction}{abs_change}人",
            "impact": f"当前观众数：{live_room.viewers}人",
            "color": "green" if viewer_change > 0 else "red",
        }
        agent_logs.append(log)
        
        # 添加库存预测行为 - 观众变化触发
        if viewer_change > 2000:  # 大量观众涌入
            # 智能库存预测
            strategy = random.choice(INVENTORY_STRATEGIES)
            warehouse = random.choice(WAREHOUSE_LOCATIONS)
            predicted_sales_increase = round(viewer_change * random.uniform(0.01, 0.05))
            
            log = {
                "timestamp": datetime.now().isoformat(),
                "room_id": room_id,
                "room_name": live_room.name,
                "action_type": "库存预测",
                "message": f"检测到观众激增，启动「{strategy}」分析",
                "impact": f"预计销量增加{predicted_sales_increase}件，已通知{warehouse}备货",
                "color": "blue",
            }
            agent_logs.append(log)
    
    # Apply conversion rate changes
    if "conversion_boost" in effects:
        boost = effects["conversion_boost"]
        live_room.conversion_rate = min(0.2, live_room.conversion_rate + boost)
        
        log = {
            "timestamp": datetime.now().isoformat(),
            "room_id": room_id,
            "room_name": live_room.name,
            "action_type": "转化率提升",
            "message": f"直播间转化率提升{boost*100:.1f}%",
            "impact": f"当前转化率：{live_room.conversion_rate*100:.1f}%",
            "color": "green",
        }
        agent_logs.append(log)
        
        # 添加库存管理行为 - 转化率提升触发
        if boost >= 0.03:  # 显著转化率提升
            strategy = random.choice(INVENTORY_STRATEGIES)
            for product in live_room.products[:2]:  # 对前两个产品进行库存调整
                restock_amount = random.randint(100, 300)
                eta_minutes = random.randint(15, 45)
                eta_time = (datetime.now() + timedelta(minutes=eta_minutes)).strftime("%H:%M")
                
                log = {
                    "timestamp": datetime.now().isoformat(),
                    "room_id": room_id,
                    "room_name": live_room.name,
                    "action_type": "库存管理",
                    "message": f"启动「{strategy}」，为{product['name']}增调{restock_amount}件库存",
                    "impact": f"预计{eta_time}前到达，确保直播间持续销售",
                    "color": "teal",
                }
                agent_logs.append(log)
    
    if "conversion_penalty" in effects:
        penalty = effects["conversion_penalty"]
        live_room.conversion_rate = max(0.01, live_room.conversion_rate - penalty)
        
        log = {
            "timestamp": datetime.now().isoformat(),
            "room_id": room_id,
            "room_name": live_room.name,
            "action_type": "转化率下降",
            "message": f"直播间转化率下降{penalty*100:.1f}%",
            "impact": f"当前转化率：{live_room.conversion_rate*100:.1f}%",
            "color": "red",
        }
        agent_logs.append(log)
        
        # 添加库存调整行为 - 转化率下降触发
        if penalty >= 0.03:  # 显著转化率下降
            strategy = random.choice(INVENTORY_STRATEGIES)
            log = {
                "timestamp": datetime.now().isoformat(),
                "room_id": room_id,
                "room_name": live_room.name,
                "action_type": "库存调整",
                "message": f"检测到转化率大幅下降，启动「{strategy}」",
                "impact": f"暂缓部分商品补货计划，避免库存积压",
                "color": "purple",
            }
            agent_logs.append(log)
    
    # Apply stock changes
    if "stock_reduction" in effects:
        reduction_factor = effects["stock_reduction"]
        
        for product in live_room.products:
            if product["stock_status"] == "充足":  # Only affect products with sufficient stock
                original_stock = product["stock"]
                product["stock"] = max(10, int(product["stock"] * (1 - reduction_factor)))
                
                # Update stock status
                stock_percentage = product["stock"] / product["initial_stock"]
                if stock_percentage < 0.1:
                    product["stock_status"] = "告急"
                elif stock_percentage < 0.3:
                    product["stock_status"] = "紧张"
                
                log = {
                    "timestamp": datetime.now().isoformat(),
                    "room_id": room_id,
                    "room_name": live_room.name,
                    "action_type": "库存预警",
                    "message": f"{product['name']} 库存急剧减少，从{original_stock}降至{product['stock']}",
                    "impact": f"库存状态更新为：{product['stock_status']}",
                    "color": "red",
                }
                agent_logs.append(log)
                
                # 增强的AI仓库管理响应
                if product["stock_status"] == "告急":
                    # 选择策略和仓库
                    strategy = random.choice(INVENTORY_STRATEGIES)
                    warehouse = random.choice(WAREHOUSE_LOCATIONS)
                    logistics = random.choice(LOGISTICS_METHODS)
                    
                    # 第一步：紧急调货
                    restock_amount = random.randint(100, 500)
                    eta_minutes = random.randint(15, 45)
                    eta_time = (datetime.now() + timedelta(minutes=eta_minutes)).strftime("%H:%M")
                    
                    log = {
                        "timestamp": datetime.now().isoformat(),
                        "room_id": room_id,
                        "room_name": live_room.name,
                        "action_type": "紧急调货",
                        "message": f"AI Agent启动「{strategy}」，从{warehouse}紧急调拨{product['name']} {restock_amount}件",
                        "impact": f"通过{logistics}配送，预计{eta_time}前到达",
                        "color": "blue",
                    }
                    agent_logs.append(log)
                    
                    # 第二步：库存预测和长期计划
                    future_days = random.randint(3, 7)
                    future_stock = random.randint(500, 2000)
                    
                    log = {
                        "timestamp": datetime.now().isoformat(),
                        "room_id": room_id,
                        "room_name": live_room.name,
                        "action_type": "库存规划",
                        "message": f"AI分析近期{product['name']}销售趋势，制定{future_days}天补货计划",
                        "impact": f"已向供应商下单{future_stock}件，优化库存结构，防止再次短缺",
                        "color": "purple",
                    }
                    agent_logs.append(log)
                    
                    # 更新产品库存
                    product["stock"] += restock_amount
                    
                elif product["stock_status"] == "紧张":
                    # 库存紧张但未告急的处理
                    strategy = random.choice(INVENTORY_STRATEGIES)
                    warehouse = random.choice(WAREHOUSE_LOCATIONS)
                    
                    restock_amount = random.randint(50, 200)
                    product["stock"] += restock_amount
                    
                    log = {
                        "timestamp": datetime.now().isoformat(),
                        "room_id": room_id,
                        "room_name": live_room.name,
                        "action_type": "库存补充",
                        "message": f"AI Agent检测到{product['name']}库存偏低，启动「{strategy}」",
                        "impact": f"从{warehouse}调拨{restock_amount}件，确保销售持续性",
                        "color": "teal",
                    }
                    agent_logs.append(log)
    
    # Apply product sales multiplier
    if "product_sales_multiplier" in effects:
        multiplier = effects["product_sales_multiplier"]
        
        # Select a random product to boost
        if live_room.products:
            product = random.choice(live_room.products)
            product_name = product["name"]
            
            log = {
                "timestamp": datetime.now().isoformat(),
                "room_id": room_id,
                "room_name": live_room.name,
                "action_type": "销售预测",
                "message": f"{product_name} 销售预期大幅提升，预计销量增长{multiplier}倍",
                "impact": "AI Agent建议增加库存并提高曝光",
                "color": "green",
            }
            agent_logs.append(log)
            
            # 增强的AI营销和库存响应
            # 第一步：营销策略
            discount = random.randint(5, 15)
            log = {
                "timestamp": datetime.now().isoformat(),
                "room_id": room_id,
                "room_name": live_room.name,
                "action_type": "营销策略",
                "message": f"AI Agent为{product_name}自动发放限时{discount}元优惠券",
                "impact": "预计将进一步提升销量和转化率",
                "color": "teal",
            }
            agent_logs.append(log)
            
            # 第二步：库存准备
            strategy = random.choice(INVENTORY_STRATEGIES)
            warehouse = random.choice(WAREHOUSE_LOCATIONS)
            logistics = random.choice(LOGISTICS_METHODS)
            
            # 计算需要的库存量
            predicted_sales = int(product["sales"] * multiplier * random.uniform(1.2, 2.0))
            current_stock = product["stock"]
            
            if predicted_sales > current_stock:
                needed_stock = predicted_sales - current_stock
                
                log = {
                    "timestamp": datetime.now().isoformat(),
                    "room_id": room_id,
                    "room_name": live_room.name,
                    "action_type": "库存调度",
                    "message": f"AI预测{product_name}销量将达{predicted_sales}件，当前库存{current_stock}件不足",
                    "impact": f"启动「{strategy}」，从{warehouse}紧急调拨{needed_stock}件",
                    "color": "blue",
                }
                agent_logs.append(log)
                
                # 第三步：多仓协同
                secondary_warehouse = random.choice([w for w in WAREHOUSE_LOCATIONS if w != warehouse])
                secondary_amount = int(needed_stock * random.uniform(0.3, 0.5))
                
                log = {
                    "timestamp": datetime.now().isoformat(),
                    "room_id": room_id,
                    "room_name": live_room.name,
                    "action_type": "多仓协同",
                    "message": f"启动多仓协同方案，{secondary_warehouse}额外提供{secondary_amount}件{product_name}",
                    "impact": f"通过{logistics}加急配送，确保爆款商品充足供应",
                    "color": "purple",
                }
                agent_logs.append(log)
                
                # 更新产品库存
                product["stock"] += (needed_stock + secondary_amount)
    
    return agent_logs[-8:]  # Return the last 8 logs generated 