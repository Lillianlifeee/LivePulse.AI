import React, { useEffect, useRef, useState } from 'react';
import { Box, useTheme } from '@mui/material';
import { LiveRoom } from '../../types';

interface DataPoint {
  x: number;
  y: number;
  value: number;
  color: string;
  size: number;
  opacity: number;
  speed: number;
}

interface DataStreamVisualizerProps {
  liveRooms: LiveRoom[];
}

const DataStreamVisualizer: React.FC<DataStreamVisualizerProps> = ({ liveRooms }) => {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<DataPoint[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const animationRef = useRef<number | null>(null);
  
  // Initialize canvas size and particles
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const container = canvas.parentElement;
        
        if (container) {
          const { width, height } = container.getBoundingClientRect();
          setCanvasSize({ width, height });
          canvas.width = width;
          canvas.height = height;
        }
      }
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Generate particles based on live room data
  useEffect(() => {
    if (canvasSize.width === 0 || canvasSize.height === 0) return;
    
    // Calculate total viewers and sales
    const totalViewers = liveRooms.reduce((sum, room) => sum + room.viewers, 0);
    const totalSales = liveRooms.reduce((sum, room) => sum + room.sales, 0);
    
    // Generate particles based on room data
    const newParticles: DataPoint[] = [];
    
    // Generate viewer particles
    liveRooms.forEach(room => {
      const particleCount = Math.min(50, Math.max(10, Math.floor(room.viewers / 200)));
      
      for (let i = 0; i < particleCount; i++) {
        const healthColor = room.health_status === 'green' 
          ? theme.palette.success.main 
          : room.health_status === 'yellow'
          ? theme.palette.warning.main
          : theme.palette.error.main;
        
        newParticles.push({
          x: Math.random() * canvasSize.width,
          y: Math.random() * canvasSize.height,
          value: room.viewers / totalViewers,
          color: theme.palette.primary.main,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.5 + 0.3,
          speed: Math.random() * 2 + 1,
        });
        
        // Add sales particles
        if (room.sales > 0 && i % 3 === 0) {
          newParticles.push({
            x: Math.random() * canvasSize.width,
            y: Math.random() * canvasSize.height,
            value: room.sales / totalSales,
            color: healthColor,
            size: Math.random() * 4 + 2,
            opacity: Math.random() * 0.7 + 0.3,
            speed: Math.random() * 3 + 2,
          });
        }
      }
    });
    
    setParticles(newParticles);
  }, [liveRooms, canvasSize, theme]);
  
  // Animate particles
  useEffect(() => {
    if (!canvasRef.current || particles.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw flowing lines
      ctx.beginPath();
      ctx.strokeStyle = `rgba(0, 160, 252, 0.1)`;
      ctx.lineWidth = 1;
      
      for (let i = 0; i < 5; i++) {
        const y = (canvas.height / 6) * (i + 1);
        ctx.moveTo(0, y);
        
        for (let x = 0; x < canvas.width; x += 20) {
          const amplitude = 5 + Math.random() * 5;
          const period = 100 + Math.random() * 50;
          const yOffset = amplitude * Math.sin((x + Date.now() * 0.05) / period);
          ctx.lineTo(x, y + yOffset);
        }
      }
      
      ctx.stroke();
      
      // Update and draw particles
      setParticles(prevParticles =>
        prevParticles.map(particle => {
          // Move particle from left to right
          particle.x += particle.speed;
          
          // Reset particle position when it goes off screen
          if (particle.x > canvas.width) {
            particle.x = 0;
            particle.y = Math.random() * canvas.height;
          }
          
          // Draw particle
          ctx.beginPath();
          ctx.fillStyle = `${particle.color}${Math.round(particle.opacity * 255).toString(16).padStart(2, '0')}`;
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw trail
          ctx.beginPath();
          ctx.strokeStyle = `${particle.color}20`;
          ctx.lineWidth = particle.size / 2;
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle.x - particle.speed * 10, particle.y);
          ctx.stroke();
          
          return particle;
        })
      );
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles]);
  
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 1,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </Box>
  );
};

export default DataStreamVisualizer; 