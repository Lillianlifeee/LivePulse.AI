import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  TrendingUpOutlined as SalesIcon,
  WarningAmberOutlined as WarningIcon,
  Inventory2Outlined as InventoryIcon,
  PeopleAltOutlined as SentimentIcon,
  CampaignOutlined as MarketingIcon,
  ErrorOutlineOutlined as ErrorIcon,
} from '@mui/icons-material';

import { AgentLog } from '../../types'; 

interface ValueBinProps {
  agentLogs: AgentLog[];
}

// 预定义的所有分类
const PREDEFINED_CATEGORIES = [
  {
    type: "销售预测",
    icon: <SalesIcon fontSize="small" color="success" />,
    color: "success",
  },
  {
    type: "库存预警",
    icon: <WarningIcon fontSize="small" color="warning" />,
    color: "warning",
  },
  {
    type: "仓储管理",
    icon: <InventoryIcon fontSize="small" color="primary" />,
    color: "primary",
  },
  {
    type: "舆情分析",
    icon: <SentimentIcon fontSize="small" color="secondary" />,
    color: "secondary",
  },
  {
    type: "营销策略",
    icon: <MarketingIcon fontSize="small" color="info" />,
    color: "info",
  },
  {
    type: "异常流量",
    icon: <ErrorIcon fontSize="small" color="error" />,
    color: "error",
  },
] as const;

const ValueBin: React.FC<ValueBinProps> = ({ agentLogs }) => {
  const [expandedAccordions, setExpandedAccordions] = useState<Set<string>>(new Set());

  const handleAccordionChange = (actionType: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordions(prev => {
      const newSet = new Set(prev);
      if (isExpanded) {
        newSet.add(actionType);
      } else {
        newSet.delete(actionType);
      }
      return newSet;
    });
  };

  // 对日志按类型进行分类
  const categorizedLogs = useMemo(() => {
    const categories: Record<string, AgentLog[]> = {};
    
    // 初始化所有预定义分类
    PREDEFINED_CATEGORIES.forEach(category => {
      categories[category.type] = [];
    });
    
    // 将日志添加到对应分类中
    for (const log of agentLogs) {
      const typeKey = log.action_type;
      if (categories[typeKey]) {
        categories[typeKey].push(log);
      }
    }
    
    // 对每个分类中的日志按时间排序
    for (const typeKey in categories) {
      categories[typeKey].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    
    return categories;
  }, [agentLogs]);

  return (
    <Paper sx={{ p: 2, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ mb: 2, flexShrink: 0 }}>
        价值仓 (日志分类汇总)
      </Typography>
      <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
        <Stack direction="column" spacing={1.5} useFlexGap>
          {PREDEFINED_CATEGORIES.map(({ type, icon, color }) => {
            const logsForType = categorizedLogs[type] || [];

            return (
              <Accordion 
                key={type}
                expanded={expandedAccordions.has(type)}
                onChange={handleAccordionChange(type)}
                sx={{ 
                  boxShadow: 'none', 
                  border: '1px solid rgba(0,0,0,0.12)', 
                  '&:before': { display: 'none' },
                  bgcolor: logsForType.length === 0 ? 'rgba(0,0,0,0.02)' : 'inherit'
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`${type}-content`}
                  id={`${type}-header`}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                    {React.cloneElement(icon, { sx: { mr: 1 } } as any)}
                    <Typography sx={{ flexShrink: 0, mr: 1, fontSize: '0.9rem', fontWeight: 'medium' }}>
                      {type}
                    </Typography>
                    <Tooltip title={`包含 ${logsForType.length} 条日志`}>
                      <Chip 
                        label={logsForType.length} 
                        size="small" 
                        color={color as any}
                        sx={{ opacity: logsForType.length === 0 ? 0.5 : 1 }}
                      />
                    </Tooltip>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p:0, borderTop: '1px solid rgba(0,0,0,0.12)' }}>
                  <List dense sx={{ maxHeight: 250, overflow: 'auto', width: '100%', bgcolor: 'background.paper', p:0 }}>
                    {logsForType.length > 0 ? (
                      logsForType.map((log, index) => (
                        <ListItem key={`${log.timestamp}-${index}`} divider>
                          <ListItemText
                            primary={log.message}
                            secondary={`${new Date(log.timestamp).toLocaleString()} ${log.room_name ? `(${log.room_name})` : ''} ${log.impact ? `- Impact: ${log.impact}` : ''}`}
                            primaryTypographyProps={{ fontSize: '0.85rem' }}
                            secondaryTypographyProps={{ fontSize: '0.75rem', color: 'text.secondary' }}
                          />
                        </ListItem>
                      ))
                    ) : (
                      <ListItem>
                        <ListItemText 
                          primary={`暂无${type}记录`} 
                          primaryTypographyProps={{ 
                            color: 'text.secondary',
                            fontSize: '0.85rem',
                            fontStyle: 'italic'
                          }}
                        />
                      </ListItem>
                    )}
                  </List>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Stack>
      </Box>
    </Paper>
  );
};

export default ValueBin; 