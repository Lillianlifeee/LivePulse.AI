# PulseCast - 直播带货销售预测与管理系统

PulseCast 是一个实时直播带货销售预测与管理系统的演示项目，它展示了 AI Agent 如何作为"全局掌控者"监控、预测和管理多个直播间的销售情况。

## 项目特点

- **实时数据可视化**：动态展示直播间观众、销售额、转化率等关键指标
- **AI Agent 决策流程**：清晰展示 AI Agent 的监控、预测和管理决策过程
- **事件驱动系统**：可触发各种正面和负面事件，观察 AI Agent 的反应
- **沉浸式控制中心**：高级、未来感的"直播运营控制中心"仪表盘

## 技术栈

### 前端
- React + TypeScript
- Material-UI 组件库
- Recharts 图表库
- Socket.IO 客户端

### 后端
- Python + FastAPI
- Socket.IO 服务器
- 模拟数据生成器

## 安装与运行

### 前提条件
- Node.js (v14+)
- Python (v3.8+)
- npm 或 yarn

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/yourusername/LivePulse.AI.git
cd LivePulse.AI
```

2. 安装后端依赖
```bash
cd backend
python -m venv venv
source venv/bin/activate  # 在 Windows 上使用 venv\Scripts\activate
pip install -r requirements.txt
```

3. 安装前端依赖
```bash
cd ../frontend
npm install
```

4. 启动应用
```bash
cd ..
./start.sh
```

或分别启动前后端:
```bash
# 终端 1
cd backend
source venv/bin/activate
python main.py

# 终端 2
cd frontend
npm start
```

5. 打开浏览器访问 http://localhost:3000

## 功能介绍

### 控制中心
- 全局概览：展示总销售额、总利润、总观众数、平均转化率
- 直播间状态：显示所有活跃直播间的关键指标
- 实时数据流：可视化展示数据流动
- AI Agent 行动日志：实时展示 AI Agent 的决策和行动
- 事件触发器：可触发各种事件，观察系统反应

### 事件触发器
可触发以下类型的事件：

#### 正面事件
- 竞品主播下线，流量涌入
- 某商品被知名KOL推荐，瞬间爆火
- 主播超常发挥，互动率飙升

#### 负面事件
- 核心商品库存不足
- 直播间出现大量负面评论
- 主播口误/表现不佳
- 竞争对手突然推出同类商品并大幅降价
- 外部网络波动，直播间观看人数骤降
- 物流系统故障，发货延迟

## 项目结构

```
PulseCast/
├── backend/                # 后端代码
│   ├── main.py             # 主服务器入口
│   ├── event_triggers.py   # 事件触发器逻辑
│   └── venv/               # Python 虚拟环境
│
├── frontend/               # 前端代码
│   ├── public/             # 静态资源
│   ├── src/                # 源代码
│   │   ├── components/     # React 组件
│   │   ├── context/        # React 上下文
│   │   ├── types.ts        # TypeScript 类型定义
│   │   └── App.tsx         # 主应用组件
│   ├── package.json        # 依赖配置
│   └── tsconfig.json       # TypeScript 配置
│
├── start.sh                # 启动脚本
└── README.md               # 项目文档
```

## 贡献

欢迎提交 Pull Request 或创建 Issue 来改进这个项目！

## 许可证

MIT 
