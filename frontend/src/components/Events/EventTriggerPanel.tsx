import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  FlashOn as FlashOnIcon,
  Warning as WarningIcon,
  Bolt as BoltIcon,
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';
import { EventTrigger } from '../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`event-tabpanel-${index}`}
      aria-labelledby={`event-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const EventTriggerPanel: React.FC = () => {
  const theme = useTheme();
  const { events, liveRooms, triggerEvent } = useAppContext();
  
  const [tabValue, setTabValue] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<EventTrigger | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filter events by type
  const positiveEvents = events.filter(event => event.type === 'positive');
  const negativeEvents = events.filter(event => event.type === 'negative');
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleEventClick = (event: EventTrigger) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };
  
  const handleRoomChange = (event: SelectChangeEvent<string>) => {
    setSelectedRoomId(event.target.value);
  };
  
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedEvent(null);
    setSelectedRoomId('');
    setError(null);
    setSuccess(null);
  };
  
  const handleTriggerEvent = async () => {
    if (!selectedEvent) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await triggerEvent(selectedEvent.id, selectedRoomId || undefined);
      setSuccess(`成功触发事件: ${selectedEvent.name}`);
      setTimeout(() => {
        handleDialogClose();
      }, 1500);
    } catch (err) {
      setError('触发事件失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{
          '& .MuiTabs-indicator': {
            backgroundColor: tabValue === 0 ? theme.palette.success.main : theme.palette.error.main,
          },
        }}
      >
        <Tab
          icon={<FlashOnIcon />}
          label="正面事件"
          sx={{
            color: tabValue === 0 ? theme.palette.success.main : 'inherit',
          }}
        />
        <Tab
          icon={<WarningIcon />}
          label="负面事件"
          sx={{
            color: tabValue === 1 ? theme.palette.error.main : 'inherit',
          }}
        />
      </Tabs>
      
      <TabPanel value={tabValue} index={0}>
        <List disablePadding>
          {positiveEvents.map((event) => (
            <ListItem disablePadding key={event.id}>
              <ListItemButton onClick={() => handleEventClick(event)}>
                <FlashOnIcon sx={{ mr: 1, color: theme.palette.success.main }} />
                <ListItemText
                  primary={event.name}
                  secondary={event.description}
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <List disablePadding>
          {negativeEvents.map((event) => (
            <ListItem disablePadding key={event.id}>
              <ListItemButton onClick={() => handleEventClick(event)}>
                <WarningIcon sx={{ mr: 1, color: theme.palette.error.main }} />
                <ListItemText
                  primary={event.name}
                  secondary={event.description}
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </TabPanel>
      
      {/* Event Trigger Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: theme.palette.background.paper,
            backgroundImage: 'none',
          },
        }}
      >
        {selectedEvent && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BoltIcon
                  sx={{
                    mr: 1,
                    color:
                      selectedEvent.type === 'positive'
                        ? theme.palette.success.main
                        : theme.palette.error.main,
                  }}
                />
                <Typography variant="h6">触发事件: {selectedEvent.name}</Typography>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {selectedEvent.description}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  事件效果:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.entries(selectedEvent.effects).map(([key, value]) => {
                    if (key === 'duration') return null;
                    
                    let displayValue: string;
                    if (Array.isArray(value)) {
                      displayValue = `${value[0]} ~ ${value[1]}`;
                    } else if (typeof value === 'number') {
                      displayValue = value.toString();
                    } else {
                      displayValue = JSON.stringify(value);
                    }
                    
                    return (
                      <Chip
                        key={key}
                        label={`${key}: ${displayValue}`}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.05)',
                        }}
                      />
                    );
                  })}
                  
                  {selectedEvent.effects.duration && (
                    <Chip
                      label={`持续时间: ${selectedEvent.effects.duration / 60} 分钟`}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                      }}
                    />
                  )}
                </Box>
              </Box>
              
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="room-select-label">选择直播间</InputLabel>
                <Select
                  labelId="room-select-label"
                  value={selectedRoomId}
                  onChange={handleRoomChange}
                  label="选择直播间"
                >
                  <MenuItem value="">
                    <em>随机选择</em>
                  </MenuItem>
                  {liveRooms.map((room) => (
                    <MenuItem key={room.id} value={room.id}>
                      {room.name} ({room.host_name})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {success}
                </Alert>
              )}
            </DialogContent>
            
            <DialogActions>
              <Button onClick={handleDialogClose} disabled={loading}>
                取消
              </Button>
              <Button
                onClick={handleTriggerEvent}
                variant="contained"
                color={selectedEvent.type === 'positive' ? 'success' : 'error'}
                startIcon={loading ? <CircularProgress size={16} /> : <BoltIcon />}
                disabled={loading}
              >
                {loading ? '触发中...' : '触发事件'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export default EventTriggerPanel; 