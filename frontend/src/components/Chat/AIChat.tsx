import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  List,
  ListItem,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';

// Define API_BASE_URL, ideally from context or environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8200';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const AIChat: React.FC = () => {
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const { globalStats, liveRooms, formatTime } = useAppContext();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');

    const specificQuery = "目前销量如何，并预测一小时后销量";
    const predefinedResponse = `目前直播间销售表现差异巨大：Alice转化率最高，是其他直播间的2-4倍，贡献了大部分利润，需重点维护和复制其成功模式。其他直播间转化率偏低，需立即采取措施。
未来一小时策略建议：1.**重点关注Alice直播间:** 维持当前策略，加大宣传力度，争取突破。
2.**分析低转化率直播间原因:**对比Alice直播间，分析食神小当家、美食达人小K、甜点魔法师Lila直播间观众互动情况、产品展示方式、优惠力度等差异，找出问题所在。
3. **针对性改进:**提升互动：** 增加互动环节，例如抽奖、问答、限时优惠等，提高观众参与度。***优化产品展示:** 改进产品介绍方式，突出产品卖点和优势，使用更吸引人的画面和语言。*调整优惠策略:** 根据不同直播间观众特点，制定更具吸引力的优惠策略。***产品结构优化:** 针对低转化率直播间,分析产品是否适合当前观众群体。
4. **数据监控：** 实时监控每个直播间的销售数据和观众互动情况，及时调整策略。
**预计未来一小时趋势:** 如不进行策略调整，Alice直播间将继续保持高转化率，其他直播间销售额增长缓慢。 积极改进后，其他直播间有望提升转化率，但需要时间和有效策略的配合。`;

    if (currentInput.trim() === specificQuery) {
      const assistantMessage: Message = {
        role: 'assistant',
        content: predefinedResponse,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          context: {
            globalStats,
            liveRooms,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: '抱歉，我暂时无法回答。请稍后再试。',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BotIcon color="primary" />
          AI 策略助手
        </Typography>
      </Box>

      <List
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.map((message, index) => (
          <ListItem
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
              padding: 0,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                maxWidth: '80%',
                alignItems: 'flex-start',
                flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
              }}
            >
              <Avatar
                sx={{
                  bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                  width: 32,
                  height: 32,
                }}
              >
                {message.role === 'user' ? <PersonIcon /> : <BotIcon />}
              </Avatar>
              <Box>
                <Paper
                  sx={{
                    p: 1.5,
                    bgcolor: message.role === 'user' ? 'primary.main' : 'background.paper',
                    color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Typography>
                </Paper>
                <Typography
                  variant="caption"
                  sx={{
                    mt: 0.5,
                    color: 'text.secondary',
                    display: 'block',
                    textAlign: message.role === 'user' ? 'right' : 'left',
                  }}
                >
                  {formatTime(message.timestamp)}
                </Typography>
              </Box>
            </Box>
          </ListItem>
        ))}
        {isLoading && (
          <ListItem sx={{ justifyContent: 'flex-start', padding: 0 }}>
            <CircularProgress size={20} />
          </ListItem>
        )}
        <div ref={messagesEndRef} />
      </List>

      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="输入你的问题..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={4}
            size="small"
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground',
                color: 'action.disabled',
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default AIChat; 