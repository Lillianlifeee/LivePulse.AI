import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Avatar,
  useTheme,
  CardActionArea,
} from '@mui/material';
import {
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  ShoppingCart as ShoppingCartIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { LiveRoom } from '../../types';
import { useAppContext } from '../../context/AppContext';

interface LiveRoomCardProps {
  room: LiveRoom;
  onClick: () => void;
}

const LiveRoomCard: React.FC<LiveRoomCardProps> = ({ room, onClick }) => {
  const theme = useTheme();
  const { formatCurrency, formatNumber, formatPercent } = useAppContext();
  
  // Determine health status color
  const healthColor = room.health_status === 'green' 
    ? theme.palette.success.main 
    : room.health_status === 'yellow'
    ? theme.palette.warning.main
    : theme.palette.error.main;
  
  // Calculate mini chart data (just for display, not real data)
  const miniChartData = [0.3, 0.5, 0.4, 0.7, 0.6, 0.8, 0.9, 0.7];
  
  return (
    <Card 
      sx={{ 
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0, 160, 252, 0.2)',
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          bgcolor: healthColor,
          borderTopLeftRadius: theme.shape.borderRadius,
          borderBottomLeftRadius: theme.shape.borderRadius,
        }}
      />
      
      <CardActionArea onClick={onClick}>
        <CardContent sx={{ pl: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {room.name}
            </Typography>
            
            <Chip
              size="small"
              label={
                room.health_status === 'green'
                  ? '健康'
                  : room.health_status === 'yellow'
                  ? '一般'
                  : '告急'
              }
              sx={{
                bgcolor: `${healthColor}20`,
                color: healthColor,
                fontWeight: 'bold',
                borderRadius: '4px',
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar
              sx={{
                width: 24,
                height: 24,
                bgcolor: `${theme.palette.primary.main}20`,
                color: theme.palette.primary.main,
                mr: 1,
                fontSize: '0.75rem',
              }}
            >
              <PersonIcon fontSize="small" />
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              {room.host_name}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <VisibilityIcon sx={{ fontSize: '1rem', color: 'text.secondary', mr: 0.5 }} />
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {formatNumber(room.viewers)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ShoppingCartIcon sx={{ fontSize: '1rem', color: 'text.secondary', mr: 0.5 }} />
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(room.sales)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: '1rem', color: 'text.secondary', mr: 0.5 }} />
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {formatPercent(room.conversion_rate)}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              转化率
            </Typography>
            <LinearProgress
              variant="determinate"
              value={room.conversion_rate * 100 * 5} // Multiply by 5 to make it more visible
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: `${theme.palette.primary.main}20`,
                '& .MuiLinearProgress-bar': {
                  bgcolor: theme.palette.primary.main,
                  borderRadius: 3,
                },
              }}
            />
          </Box>
          
          {/* Mini chart (simplified representation) */}
          <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '20px', mt: 1 }}>
            {miniChartData.map((value, index) => (
              <Box
                key={index}
                sx={{
                  height: `${value * 100}%`,
                  width: '4px',
                  bgcolor: theme.palette.primary.main,
                  mx: 0.5,
                  borderRadius: '2px',
                  opacity: 0.7 + index * 0.05,
                }}
              />
            ))}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default LiveRoomCard; 