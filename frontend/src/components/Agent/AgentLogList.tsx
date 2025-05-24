import React, { useMemo } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Chip,
  Divider,
  useTheme,
  Paper,
} from '@mui/material';
import { AgentLog } from '../../types';
import { useAppContext } from '../../context/AppContext';

interface AgentLogListProps {
  logs: AgentLog[];
  maxItems?: number;
  roomId?: string; // Optional: filter logs by room ID
}

const AgentLogList: React.FC<AgentLogListProps> = ({ logs, maxItems = 50, roomId }) => {
  const theme = useTheme();
  const { formatTime } = useAppContext();
  
  const displayLogs = useMemo(() => {
    // Filter logs by room if roomId is provided
    let filteredLogs = roomId
      ? logs.filter(log => log.room_id === roomId)
      : logs;

    // Remove duplicates based on timestamp and message
    filteredLogs = filteredLogs.filter((log, index, self) =>
      index === self.findIndex((l) => (
        l.timestamp === log.timestamp && l.message === log.message
      ))
    );

    // Group logs by action_type
    const groupedLogs = filteredLogs.reduce((acc, log) => {
      if (!acc[log.action_type]) {
        acc[log.action_type] = [];
      }
      acc[log.action_type].push(log);
      return acc;
    }, {} as Record<string, typeof logs>);

    // Sort logs within each group by timestamp
    Object.values(groupedLogs).forEach(group => {
      group.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    });

    // Flatten and limit to maxItems
    return Object.values(groupedLogs)
      .flat()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, maxItems);
  }, [logs, maxItems, roomId]);
  
  // Get color for action type
  const getActionColor = (color: string) => {
    switch (color) {
      case 'green':
        return theme.palette.success.main;
      case 'orange':
        return theme.palette.warning.main;
      case 'red':
        return theme.palette.error.main;
      case 'blue':
        return theme.palette.primary.main;
      case 'purple':
        return theme.palette.secondary.main;
      case 'teal':
        return theme.palette.info.main;
      default:
        return theme.palette.text.secondary;
    }
  };
  
  return (
    <Paper 
      sx={{ 
        p: 2, 
        borderRadius: 2, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        height: '400px', // 固定高度
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // 防止内容溢出
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        AI Agent 日志记录
      </Typography>
      
      {displayLogs.length === 0 ? (
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.secondary">暂无日志</Typography>
        </Box>
      ) : (
        <Box 
          sx={{ 
            flexGrow: 1,
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0,0,0,0.1)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
              '&:hover': {
                background: 'rgba(0,0,0,0.3)',
              },
            },
          }}
        >
          <List disablePadding>
            {displayLogs.map((log, index) => (
          <React.Fragment key={`${log.timestamp}-${index}`}>
            <ListItem
              alignItems="flex-start"
              sx={{
                px: 1,
                py: 1.5,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                },
                opacity: log.color === 'gray' ? 0.7 : 1,
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Chip
                    label={log.action_type}
                    size="small"
                    sx={{
                      bgcolor: `${getActionColor(log.color)}20`,
                      color: getActionColor(log.color),
                      fontWeight: 'bold',
                      fontSize: '0.7rem',
                      height: '20px',
                      borderRadius: '4px',
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(log.timestamp)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.5 }}>
                  <Box
                    sx={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      bgcolor: getActionColor(log.color),
                      mr: 1,
                      mt: 0.5,
                    }}
                  />
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {log.message}
                      </Typography>
                    }
                    disableTypography
                  />
                </Box>
                
                {log.impact && (
                  <Paper
                    variant="outlined"
                    sx={{
                      ml: 3,
                      p: 1,
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {log.impact}
                    </Typography>
                  </Paper>
                )}
                
                <Typography variant="caption" sx={{ ml: 3, color: 'text.secondary' }}>
                  {log.room_name}
                </Typography>
              </Box>
            </ListItem>
            {index < displayLogs.length - 1 && (
              <Divider variant="inset" component="li" sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />
            )}
          </React.Fragment>
            ))}
          </List>
        </Box>
      )}
    </Paper>
  );
};

export default AgentLogList; 