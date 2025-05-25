import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Toolbar,
  Collapse,
  Badge,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Storefront as StorefrontIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  FlashOn as FlashOnIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const [openEvents, setOpenEvents] = useState(false);
  
  const { globalStats, liveRooms, formatCurrency } = useAppContext();
  
  const handleEventsClick = () => {
    setOpenEvents(!openEvents);
  };
  
  // Get the current path
  const currentPath = location.pathname;
  
  return (
    <>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <FlashOnIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            PulseCast
          </Typography>
        </Box>
      </Toolbar>
      
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          总销售额
        </Typography>
        <Typography variant="h5" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
          {formatCurrency(globalStats.total_sales)}
        </Typography>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              总利润
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.success.main }}>
              {formatCurrency(globalStats.total_profit)}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              直播间
            </Typography>
            <Typography variant="body1">
              <Badge 
                badgeContent={globalStats.active_rooms} 
                color="primary"
                sx={{ '& .MuiBadge-badge': { fontSize: '0.8rem', height: '20px', minWidth: '20px' } }}
              >
                <span>活跃</span>
              </Badge>
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            库存健康度
          </Typography>
          <Chip
            size="small"
            label={
              globalStats.inventory_health === 'green'
                ? '良好'
                : globalStats.inventory_health === 'yellow'
                ? '一般'
                : '告急'
            }
            sx={{
              bgcolor:
                globalStats.inventory_health === 'green'
                  ? theme.palette.success.main
                  : globalStats.inventory_health === 'yellow'
                  ? theme.palette.warning.main
                  : theme.palette.error.main,
              color: '#fff',
              fontWeight: 'bold',
            }}
          />
        </Box>
      </Box>
      
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', my: 1 }} />
      
      <List sx={{ px: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/"
            selected={currentPath === '/'}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(0, 160, 252, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 160, 252, 0.2)',
                },
              },
            }}
          >
            <ListItemIcon>
              <DashboardIcon color={currentPath === '/' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="控制中心" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/live-rooms"
            selected={currentPath === '/live-rooms'}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(0, 160, 252, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 160, 252, 0.2)',
                },
              },
            }}
          >
            <ListItemIcon>
              <StorefrontIcon color={currentPath === '/live-rooms' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="直播间" />
            <Chip
              size="small"
              label={liveRooms.length}
              sx={{ bgcolor: theme.palette.primary.main, color: '#fff' }}
            />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/analytics"
            selected={currentPath === '/analytics'}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(0, 160, 252, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 160, 252, 0.2)',
                },
              },
            }}
          >
            <ListItemIcon>
              <TrendingUpIcon color={currentPath === '/analytics' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="数据分析" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/inventory"
            selected={currentPath === '/inventory'}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(0, 160, 252, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 160, 252, 0.2)',
                },
              },
            }}
          >
            <ListItemIcon>
              <InventoryIcon color={currentPath === '/inventory' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="库存管理" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleEventsClick}
            sx={{
              borderRadius: 1,
              mb: 0.5,
            }}
          >
            <ListItemIcon>
              <FlashOnIcon color={openEvents ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="事件触发器" />
            {openEvents ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        
        <Collapse in={openEvents} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/events/positive"
                selected={currentPath === '/events/positive'}
                sx={{
                  pl: 4,
                  borderRadius: 1,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(0, 160, 252, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 160, 252, 0.2)',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <FlashOnIcon color={currentPath === '/events/positive' ? 'success' : 'inherit'} fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="正面事件" />
              </ListItemButton>
            </ListItem>
            
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/events/negative"
                selected={currentPath === '/events/negative'}
                sx={{
                  pl: 4,
                  borderRadius: 1,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(0, 160, 252, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 160, 252, 0.2)',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <WarningIcon color={currentPath === '/events/negative' ? 'error' : 'inherit'} fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="负面事件" />
              </ListItemButton>
            </ListItem>
          </List>
        </Collapse>
      </List>
      
      <Box sx={{ flexGrow: 1 }} />
      
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mt: 2 }} />
      
      <List sx={{ px: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/notifications"
            selected={currentPath === '/notifications'}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(0, 160, 252, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 160, 252, 0.2)',
                },
              },
            }}
          >
            <ListItemIcon>
              <NotificationsIcon color={currentPath === '/notifications' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="通知" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/settings"
            selected={currentPath === '/settings'}
            sx={{
              borderRadius: 1,
              '&.Mui-selected': {
                backgroundColor: 'rgba(0, 160, 252, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 160, 252, 0.2)',
                },
              },
            }}
          >
            <ListItemIcon>
              <SettingsIcon color={currentPath === '/settings' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="设置" />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );
};

export default Sidebar; 