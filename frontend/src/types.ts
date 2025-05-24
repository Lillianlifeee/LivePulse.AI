// Product type
export interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number;
  stock: number;
  initial_stock: number;
  sales: number;
  size: string;
  color: string;
  predicted_sales: number;
  stock_status: '充足' | '紧张' | '告急';
  ai_actions: AIAction[];
}

// Live Room type
export interface LiveRoom {
  id: string;
  name: string;
  host_name: string;
  viewers: number;
  sales: number;
  conversion_rate: number;
  health_status: 'green' | 'yellow' | 'red';
  products: Product[];
  start_time: string;
}

// AI Action type
export interface AIAction {
  type: string;
  message: string;
  timestamp: string;
}

// Agent Log type
export interface AgentLog {
  timestamp: string;
  room_id: string;
  room_name: string;
  action_type: string;
  message: string;
  impact?: string;
  color: string;
  source?: string;
}

// Global Stats type
export interface GlobalStats {
  total_sales: number;
  total_profit: number;
  active_rooms: number;
  inventory_health: 'green' | 'yellow' | 'red';
  start_time: string;
}

// Event Trigger type
export interface EventTrigger {
  id: string;
  name: string;
  description: string;
  type: 'positive' | 'negative';
  effects: Record<string, any>;
} 