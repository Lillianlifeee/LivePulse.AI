import React from 'react';
import {
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import { AgentLog } from '../../types';

interface EventImpactDisplayProps {
  agentLogs: AgentLog[];
}

const EventImpactDisplay: React.FC<EventImpactDisplayProps> = ({ agentLogs }) => {
  // 只显示事件触发和相关的连锁影响
  const eventImpactLogs = agentLogs.filter(
    (log) => log.action_type === '事件触发' || 
    (log.source === 'triggered_event_effect' && log.impact)
  ).slice(0, 50); // 限制显示最新的50条记录

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
        事件影响
      </Typography>
      {eventImpactLogs.length === 0 ? (
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.secondary">
            暂无事件触发的影响记录。
          </Typography>
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
          <List dense disablePadding>
            {eventImpactLogs.map((log, index) => (
              <React.Fragment key={`${log.timestamp}-${index}`}>
                <ListItem sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(log.timestamp).toLocaleTimeString()} - {log.room_name}
                    </Typography>
                    <Chip 
                      label={log.action_type} 
                      size="small" 
                      color={log.action_type === '事件触发' ? "error" : "success"} 
                      variant="outlined"
                    />
                  </Box>
                  <ListItemText 
                    primary={log.message} 
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                    secondary={log.impact} 
                    secondaryTypographyProps={{
                      variant: 'caption',
                      sx: { 
                        color: log.action_type === '事件触发' ? 'error.main' : 'success.main',
                        fontWeight: 'medium'
                      }
                    }}
                  />
                </ListItem>
                {index < eventImpactLogs.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}
    </Paper>
  );
};

export default EventImpactDisplay; 