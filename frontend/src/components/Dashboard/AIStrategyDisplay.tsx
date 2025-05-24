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

interface AIStrategyDisplayProps {
  agentLogs: AgentLog[];
}

const AIStrategyDisplay: React.FC<AIStrategyDisplayProps> = ({ agentLogs }) => {
  // Filter logs to only show strategy-related entries
  const strategyLogs = agentLogs.filter(
    (log) => log.action_type === '营销策略' || log.action_type === 'strategy'
  );

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        AI Strategy
      </Typography>
      {strategyLogs.length === 0 ? (
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.secondary">
            暂无营销策略建议。
          </Typography>
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <List dense disablePadding>
            {strategyLogs.map((log, index) => (
              <React.Fragment key={`${log.timestamp}-${index}`}>
                <ListItem sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(log.timestamp).toLocaleTimeString()} - {log.room_name}
                    </Typography>
                    {log.impact && (
                      <Chip 
                        label={log.impact} 
                        size="small" 
                        color="success" 
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                  <ListItemText 
                    primary={log.message}
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      sx: { fontWeight: 'medium', color: 'primary.main' }
                    }}
                  />
                </ListItem>
                {index < strategyLogs.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}
    </Paper>
  );
};

export default AIStrategyDisplay; 