import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { AgentLog, EventTrigger, GlobalStats, LiveRoom } from '../types';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8200';

// Auto-refresh interval in milliseconds (5 seconds)
const AUTO_REFRESH_INTERVAL = 5000;

// Context interface
interface AppContextType {
  liveRooms: LiveRoom[];
  selectedRoom: LiveRoom | null;
  agentLogs: AgentLog[];
  globalStats: GlobalStats;
  events: EventTrigger[];
  isLoading: boolean;
  error: string | null;
  selectRoom: (roomId: string | null) => void;
  triggerEvent: (eventId: string, roomId?: string) => Promise<void>;
  formatCurrency: (amount: number) => string;
  formatNumber: (num: number) => string;
  formatPercent: (value: number) => string;
  formatTime: (timestamp: string) => string;
  getElapsedTime: (startTime: string) => string;
  socket: Socket | null;
  isAutoRefreshEnabled: boolean;
  toggleAutoRefresh: () => void;
  getYesterdayStats: () => {
    salesChange: number;
    profitChange: number;
    viewersChange: number;
    conversionChange: number;
  };
}

// Default context value
const defaultContextValue: AppContextType = {
  liveRooms: [],
  selectedRoom: null,
  agentLogs: [],
  globalStats: {
    total_sales: 0,
    total_profit: 0,
    active_rooms: 0,
    inventory_health: 'green',
    start_time: new Date().toISOString(),
  },
  events: [],
  isLoading: true,
  error: null,
  selectRoom: () => {},
  triggerEvent: async () => {},
  formatCurrency: () => '',
  formatNumber: () => '',
  formatPercent: () => '',
  formatTime: () => '',
  getElapsedTime: () => '',
  socket: null,
  isAutoRefreshEnabled: true,
  toggleAutoRefresh: () => {},
  getYesterdayStats: () => ({
    salesChange: 0,
    profitChange: 0,
    viewersChange: 0,
    conversionChange: 0,
  }),
};

// Create context
const AppContext = createContext<AppContextType>(defaultContextValue);

// Context provider props
interface AppProviderProps {
  children: ReactNode;
}

// Context provider component
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [liveRooms, setLiveRooms] = useState<LiveRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<LiveRoom | null>(null);
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats>(defaultContextValue.globalStats);
  const [events, setEvents] = useState<EventTrigger[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState<boolean>(true);
  const [baselineStats, setBaselineStats] = useState({
    sales: 0,
    profit: 0,
    viewers: 0,
    conversion: 0,
  });

  // Toggle auto refresh
  const toggleAutoRefresh = () => {
    setIsAutoRefreshEnabled(prev => !prev);
  };

  // Function to fetch data from backend
  const fetchData = async () => {
    try {
      // Fetch live rooms
      const roomsResponse = await fetch(`${API_BASE_URL}/live-rooms`);
      const roomsData = await roomsResponse.json();
      setLiveRooms(roomsData);
      
      // Update selected room if it exists
      if (selectedRoom) {
        const updatedRoom = roomsData.find((room: LiveRoom) => room.id === selectedRoom.id);
        if (updatedRoom) {
          setSelectedRoom(updatedRoom);
        }
      }
      
      // Fetch agent logs
      const logsResponse = await fetch(`${API_BASE_URL}/agent-logs`);
      const logsData = await logsResponse.json();
      setAgentLogs(logsData);
      
      // Fetch global stats
      const statsResponse = await fetch(`${API_BASE_URL}/global-stats`);
      const statsData = await statsResponse.json();
      setGlobalStats(statsData);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to refresh data. Please check your connection.');
    }
  };

  // Initialize socket connection and fetch initial data
  useEffect(() => {
    // Connect to socket with proper configuration
    const socketInstance = io(API_BASE_URL, {
      path: '/socket.io',
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
    setSocket(socketInstance);

    // Socket event handlers
    socketInstance.on('connect', () => {
      console.log('Connected to server');
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server');
      // Clear any stale notifications
      setAgentLogs([]);
    });

    socketInstance.on('live_rooms', (rooms: LiveRoom[]) => {
      setLiveRooms(rooms);
      
      // Update selected room if it exists
      if (selectedRoom) {
        const updatedRoom = rooms.find(room => room.id === selectedRoom.id);
        if (updatedRoom) {
          setSelectedRoom(updatedRoom);
        }
      }
    });

    socketInstance.on('agent_log', (log: AgentLog) => {
      setAgentLogs(prev => {
        // Remove any duplicate logs based on timestamp and message
        const filtered = prev.filter(l => 
          !(l.timestamp === log.timestamp && l.message === log.message)
        );
        return [log, ...filtered].slice(0, 100); // Keep only the latest 100 logs
      });
    });

    socketInstance.on('global_stats', (stats: GlobalStats) => {
      setGlobalStats(stats);
    });

    // Fetch initial data
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch live rooms
        const roomsResponse = await fetch(`${API_BASE_URL}/live-rooms`);
        const roomsData = await roomsResponse.json();
        setLiveRooms(roomsData);
        
        // Fetch agent logs
        const logsResponse = await fetch(`${API_BASE_URL}/agent-logs`);
        const logsData = await logsResponse.json();
        setAgentLogs(logsData);
        
        // Fetch global stats
        const statsResponse = await fetch(`${API_BASE_URL}/global-stats`);
        const statsData = await statsResponse.json();
        setGlobalStats(statsData);
        
        // Fetch events
        const eventsResponse = await fetch(`${API_BASE_URL}/events`);
        const eventsData = await eventsResponse.json();
        setEvents(eventsData);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load data. Please refresh the page.');
        setIsLoading(false);
      }
    };

    fetchInitialData();

    // Cleanup
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Set up auto refresh
  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;
    
    if (isAutoRefreshEnabled) {
      refreshInterval = setInterval(() => {
        fetchData();
      }, AUTO_REFRESH_INTERVAL);
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [isAutoRefreshEnabled, selectedRoom]);

  // Select a room
  const selectRoom = (roomId: string | null) => {
    if (!roomId) {
      setSelectedRoom(null);
      return;
    }
    
    const room = liveRooms.find(r => r.id === roomId);
    setSelectedRoom(room || null);
  };

  // Trigger an event
  const triggerEvent = async (eventId: string, roomId?: string) => {
    try {
      const url = roomId 
        ? `${API_BASE_URL}/trigger-event/${eventId}?room_id=${roomId}`
        : `${API_BASE_URL}/trigger-event/${eventId}`;
        
      const response = await fetch(url, { method: 'POST' });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to trigger event');
      }
      
      return data;
    } catch (err) {
      console.error('Error triggering event:', err);
      setError('Failed to trigger event. Please try again.');
      throw err;
    }
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('zh-CN').format(num);
  };

  // Format percent
  const formatPercent = (value: number): string => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value);
  };

  // Format timestamp
  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Get elapsed time since start
  const getElapsedTime = (startTime: string): string => {
    const start = new Date(startTime).getTime();
    const now = new Date().getTime();
    const diff = now - start;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // 初始化基准数据
  useEffect(() => {
    const initializeBaseline = () => {
      const baseValue = 0.7 + Math.random() * 0.3; // 生成0.7到1之间的随机数
      setBaselineStats({
        sales: globalStats.total_sales * baseValue,
        profit: globalStats.total_profit * baseValue,
        viewers: liveRooms.reduce((sum, room) => sum + room.viewers, 0) * baseValue,
        conversion: (liveRooms.length > 0
          ? liveRooms.reduce((sum, room) => sum + room.conversion_rate, 0) / liveRooms.length
          : 0) * baseValue,
      });
    };

    // 只在组件首次加载时初始化基准数据
    if (baselineStats.sales === 0 && globalStats.total_sales > 0) {
      initializeBaseline();
    }
  }, [globalStats.total_sales, liveRooms]);

  // 固定的昨日基准数据（更新后的基准值）
  const YESTERDAY_BASELINE = {
    sales: 150000,    // 15万销售额
    profit: 45000,    // 4.5万利润（按照30%利润率计算）
    viewers: 30000,   // 3万观众
    conversion: 0.04, // 4%转化率
  };

  // 计算昨日数据的变化率
  const getYesterdayStats = () => {
    const totalViewers = liveRooms.reduce((sum, room) => sum + room.viewers, 0);
    const avgConversionRate = liveRooms.length > 0
      ? liveRooms.reduce((sum, room) => sum + room.conversion_rate, 0) / liveRooms.length
      : 0;

    // 计算每个指标相对于固定基准的变化率
    const salesChange = ((globalStats.total_sales / YESTERDAY_BASELINE.sales) - 1) * 100;
    const profitChange = ((globalStats.total_profit / YESTERDAY_BASELINE.profit) - 1) * 100;
    const viewersChange = ((totalViewers / YESTERDAY_BASELINE.viewers) - 1) * 100;
    const conversionChange = ((avgConversionRate / YESTERDAY_BASELINE.conversion) - 1) * 100;

    // 确保所有变化率都在合理范围内（-100% 到 +200%）
    const clampChange = (value: number) => Math.max(-100, Math.min(200, value));

    return {
      salesChange: clampChange(salesChange),
      profitChange: clampChange(profitChange),
      viewersChange: clampChange(viewersChange),
      conversionChange: clampChange(conversionChange),
    };
  };

  // Context value
  const contextValue: AppContextType = {
    liveRooms,
    selectedRoom,
    agentLogs,
    globalStats,
    events,
    isLoading,
    error,
    selectRoom,
    triggerEvent,
    formatCurrency,
    formatNumber,
    formatPercent,
    formatTime,
    getElapsedTime,
    socket,
    isAutoRefreshEnabled,
    toggleAutoRefresh,
    getYesterdayStats,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using the context
export const useAppContext = () => useContext(AppContext);

export default AppContext; 