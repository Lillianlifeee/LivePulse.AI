import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Chip,
  useTheme,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  AutorenewOutlined as AutorenewIcon,
  Percent as PercentIcon,
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';
import { LiveRoom } from '../../types';
import LiveRoomCard from '../LiveRoom/LiveRoomCard';
import AgentLogList from '../Agent/AgentLogList';
import EventTriggerPanel from '../Events/EventTriggerPanel';
import ExpandableStatCard from './ExpandableStatCard';
import ValueBin from './ValueBin';
import AIStrategyDisplay from './AIStrategyDisplay';
import EventImpactDisplay from './EventImpactDisplay';
import AIChat from '../Chat/AIChat';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const { 
    liveRooms, 
    globalStats, 
    agentLogs, 
    formatCurrency, 
    formatNumber,
    formatPercent,
    getElapsedTime,
    selectRoom,
    isAutoRefreshEnabled,
    toggleAutoRefresh,
    getYesterdayStats,
  } = useAppContext();
  
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  
  useEffect(() => {
    const timer = setInterval(() => {
      if (globalStats.start_time) {
        setElapsedTime(getElapsedTime(globalStats.start_time));
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [globalStats.start_time, getElapsedTime]);
  
  const avgConversionRate = liveRooms.length > 0
    ? liveRooms.reduce((sum, room) => sum + room.conversion_rate, 0) / liveRooms.length
    : 0;
  
  const totalViewers = liveRooms.reduce((sum, room) => sum + room.viewers, 0);
  
  const handleRoomSelect = (room: LiveRoom) => {
    selectRoom(room.id);
  };
  
  return (
    <Stack spacing={3}>
      {/* Header with Auto-refresh and Runtime */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          直播运营控制中心
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title={isAutoRefreshEnabled ? "自动刷新已开启 (5秒)" : "自动刷新已关闭"}>
            <IconButton 
              onClick={toggleAutoRefresh} 
              color={isAutoRefreshEnabled ? "primary" : "default"}
              sx={{ 
                bgcolor: isAutoRefreshEnabled ? 'rgba(0, 160, 252, 0.1)' : 'transparent',
                '&:hover': {
                  bgcolor: isAutoRefreshEnabled ? 'rgba(0, 160, 252, 0.2)' : 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <AutorenewIcon />
            </IconButton>
          </Tooltip>
          <Chip
            label={`已运行 ${elapsedTime}`}
            sx={{
              bgcolor: theme.palette.background.paper,
              fontSize: '1rem',
              p: 1,
              height: 'auto',
            }}
          />
        </Box>
      </Box>
      
      {/* Top Stats Cards */}
      <Stack direction="row" spacing={3}>
        <ExpandableStatCard
          title="总销售额"
          value={formatCurrency(globalStats.total_sales)}
          icon={<ShoppingCartIcon />}
          avatarBgColor="rgba(0, 160, 252, 0.1)"
          avatarColor={theme.palette.primary.main}
          valueColor={theme.palette.primary.main}
          trend={(() => {
            const { salesChange } = getYesterdayStats();
            return (
              <>
                {salesChange >= 0 ? (
                    <TrendingUpIcon sx={{ color: theme.palette.success.main, mr: 0.5, fontSize: '1rem' }} />
                ) : (
                  <TrendingDownIcon sx={{ color: theme.palette.error.main, mr: 0.5, fontSize: '1rem' }} />
                )}
                <span style={{ color: salesChange >= 0 ? theme.palette.success.main : theme.palette.error.main }}>
                  {salesChange >= 0 ? '+' : ''}{salesChange.toFixed(1)}%
                </span>
                    <span style={{ color: theme.palette.text.secondary, marginLeft: '0.5rem' }}>
                      较昨日
                    </span>
              </>
            );
          })()}
          calculationDetails={
            <Typography variant="body2" color="text.secondary">
              所有直播间当前场次销售额的总和。
                  </Typography>
          }
        />
        <ExpandableStatCard
          title="总利润"
          value={formatCurrency(globalStats.total_profit)}
          icon={<TrendingUpIcon />}
          avatarBgColor="rgba(82, 196, 26, 0.1)"
          avatarColor={theme.palette.success.main}
          valueColor={theme.palette.success.main}
          trend={(() => {
            const { profitChange } = getYesterdayStats();
            return (
              <>
                {profitChange >= 0 ? (
                    <TrendingUpIcon sx={{ color: theme.palette.success.main, mr: 0.5, fontSize: '1rem' }} />
                ) : (
                  <TrendingDownIcon sx={{ color: theme.palette.error.main, mr: 0.5, fontSize: '1rem' }} />
                )}
                <span style={{ color: profitChange >= 0 ? theme.palette.success.main : theme.palette.error.main }}>
                  {profitChange >= 0 ? '+' : ''}{profitChange.toFixed(1)}%
                </span>
                    <span style={{ color: theme.palette.text.secondary, marginLeft: '0.5rem' }}>
                      较昨日
                    </span>
              </>
            );
          })()}
          calculationDetails={
            <Typography variant="body2" color="text.secondary">
              所有直播间当前场次利润的总和 (销售额 - 成本)。
                  </Typography>
          }
        />
        <ExpandableStatCard
          title="总观众数"
          value={formatNumber(totalViewers)}
          icon={<PeopleIcon />}
          avatarBgColor="rgba(121, 40, 202, 0.1)"
          avatarColor={theme.palette.secondary.main}
          trend={(() => {
            const { viewersChange } = getYesterdayStats();
            return (
              <>
                {viewersChange >= 0 ? (
                    <TrendingUpIcon sx={{ color: theme.palette.success.main, mr: 0.5, fontSize: '1rem' }} />
                ) : (
                  <TrendingDownIcon sx={{ color: theme.palette.error.main, mr: 0.5, fontSize: '1rem' }} />
                )}
                <span style={{ color: viewersChange >= 0 ? theme.palette.success.main : theme.palette.error.main }}>
                  {viewersChange >= 0 ? '+' : ''}{viewersChange.toFixed(1)}%
                </span>
                    <span style={{ color: theme.palette.text.secondary, marginLeft: '0.5rem' }}>
                      较昨日
                    </span>
              </>
            );
          })()}
          calculationDetails={
            <Typography variant="body2" color="text.secondary">
              所有直播间当前实时在线观众的总和。
                  </Typography>
          }
        />
        <ExpandableStatCard
          title="平均转化率"
          value={formatPercent(avgConversionRate)}
          icon={<PercentIcon />}
          avatarBgColor="rgba(255, 171, 0, 0.1)"
          avatarColor={theme.palette.warning.main}
          valueColor={theme.palette.warning.main}
          trend={(() => {
            const { conversionChange } = getYesterdayStats();
            return (
              <>
                {conversionChange >= 0 ? (
                  <TrendingUpIcon sx={{ color: theme.palette.success.main, mr: 0.5, fontSize: '1rem' }} />
                ) : (
                    <TrendingDownIcon sx={{ color: theme.palette.error.main, mr: 0.5, fontSize: '1rem' }} />
                )}
                <span style={{ color: conversionChange >= 0 ? theme.palette.success.main : theme.palette.error.main }}>
                  {conversionChange >= 0 ? '+' : ''}{conversionChange.toFixed(1)}%
                </span>
                    <span style={{ color: theme.palette.text.secondary, marginLeft: '0.5rem' }}>
                      较昨日
                    </span>
              </>
            );
          })()}
          calculationDetails={
            <Typography variant="body2" color="text.secondary">
              所有直播间转化率的平均值 (订单数 / 观看人数)。
                  </Typography>
          }
        />
      </Stack>
      
      {/* Row 1: Live Rooms (65%) and (Event Triggers + Event Impact) (35%) */}
      <Stack direction="row" spacing={3} sx={{ alignItems: 'stretch' }}>
        {/* Live Rooms Section - 65% width */}
        <Box sx={{ width: '65%' }}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              height: '100%',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              直播间状态
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                '& > *': {
                  flexBasis: 'calc(50% - 8px)',
                  maxWidth: 'calc(50% - 8px)',
                  '&:nth-of-type(5)': {
                    flexBasis: 'calc(50% - 8px)',
                    maxWidth: 'calc(50% - 8px)',
                  },
                },
              }}
            >
              {liveRooms.map((room) => (
                <LiveRoomCard key={room.id} room={room} onClick={() => handleRoomSelect(room)} />
              ))}
            </Box>
          </Paper>
        </Box>
        
        {/* Right Column: Event Triggers and Event Impact - 35% width */}
        <Box sx={{ width: '35%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Event Triggers Panel (takes its own content height) */}
          <Box>
            <EventTriggerPanel />
          </Box>
          {/* Event Impact Display (takes remaining space) */}
          <Box sx={{ flexGrow: 1, minHeight: 0 }}>
            <EventImpactDisplay agentLogs={agentLogs} />
          </Box>
        </Box>
      </Stack>

      {/* Row 2: ValueBin (50%) and AI Strategy (50%) side by side */}
      <Stack direction="row" spacing={3}>
        <Box sx={{ width: '50%' }}>
          <ValueBin agentLogs={agentLogs} />
        </Box>
        <Box sx={{ width: '50%' }}>
          <AIChat />
        </Box>
      </Stack>

      {/* Row 3: Agent Logs (full width) */}
      <Box>
        <AgentLogList logs={agentLogs} />
    </Box>
    </Stack>
  );
};

export default Dashboard; 