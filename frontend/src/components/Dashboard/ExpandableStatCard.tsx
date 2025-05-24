import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  IconButton,
  Collapse,
  useTheme,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

interface ExpandableStatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  avatarBgColor: string;
  avatarColor: string;
  valueColor?: string;
  trend?: React.ReactNode;
  calculationDetails?: React.ReactNode;
}

const ExpandableStatCard: React.FC<ExpandableStatCardProps> = ({
  title,
  value,
  icon,
  avatarBgColor,
  avatarColor,
  valueColor,
  trend,
  calculationDetails,
}) => {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();

  return (
    <Card
      sx={{
        flex: 1,
        minWidth: 0,
        position: 'relative',
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        '&:hover': {
          boxShadow: '0 6px 30px rgba(0,0,0,0.1)',
        },
        transition: 'box-shadow 0.3s ease-in-out',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: avatarBgColor,
              color: avatarColor,
              width: 40,
              height: 40,
              mr: 2,
            }}
          >
            {icon}
          </Avatar>
          <Typography variant="subtitle1" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', mb: trend ? 1 : 0 }}>
          <Typography
            variant="h4"
            component="div"
            sx={{
              fontWeight: 'bold',
              color: valueColor || 'text.primary',
            }}
          >
            {value}
          </Typography>
        </Box>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            {trend}
          </Box>
        )}
        {calculationDetails && (
          <>
            <IconButton
              onClick={() => setExpanded(!expanded)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.3s',
              }}
              size="small"
            >
              <ExpandMoreIcon />
            </IconButton>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <Box sx={{ mt: 2, borderTop: `1px solid ${theme.palette.divider}`, pt: 2 }}>
                {calculationDetails}
              </Box>
            </Collapse>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpandableStatCard; 