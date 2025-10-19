import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  InputAdornment
} from '@mui/material';
import {
  Send,
  EmojiEmotions,
  AttachFile,
  Close
} from '@mui/icons-material';
import { format } from 'date-fns';

const ChatPanel = ({
  visible = false,
  messages = [],
  currentUserId,
  currentUserName,
  onSendMessage,
  onClose,
  isTeacher = false
}) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage({
        text: message.trim(),
        timestamp: new Date(),
        senderId: currentUserId,
        senderName: currentUserName,
        type: 'text'
      });
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!visible) return null;

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        right: 16,
        top: 80,
        bottom: 100,
        width: 350,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        backgroundColor: 'background.paper'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: 'primary.main',
          color: 'white'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Chat
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </Box>

      {/* Messages List */}
      <List
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          backgroundColor: 'grey.50'
        }}
      >
        {messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
            <Typography variant="body2">No messages yet</Typography>
            <Typography variant="caption">Start the conversation!</Typography>
          </Box>
        ) : (
          messages.map((msg, index) => {
            const isOwnMessage = msg.senderId === currentUserId;
            const isTeacherMessage = msg.senderRole === 'teacher' || msg.isFromTeacher;

            return (
              <ListItem
                key={index}
                sx={{
                  flexDirection: 'column',
                  alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                  mb: 1,
                  p: 0
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: isOwnMessage ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    maxWidth: '85%',
                    gap: 1
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: isTeacherMessage ? 'primary.main' : 'secondary.main',
                      fontSize: '0.875rem'
                    }}
                  >
                    {msg.senderName?.charAt(0) || 'U'}
                  </Avatar>

                  <Box
                    sx={{
                      backgroundColor: isOwnMessage
                        ? 'primary.main'
                        : isTeacherMessage
                        ? 'secondary.light'
                        : 'white',
                      color: isOwnMessage || isTeacherMessage ? 'white' : 'text.primary',
                      borderRadius: 2,
                      p: 1.5,
                      boxShadow: 1
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 'bold',
                        display: 'block',
                        mb: 0.5,
                        opacity: 0.9
                      }}
                    >
                      {msg.senderName}
                      {isTeacherMessage && (
                        <Chip
                          label="Teacher"
                          size="small"
                          sx={{ ml: 1, height: 16, fontSize: '0.65rem' }}
                        />
                      )}
                    </Typography>

                    <Typography variant="body2" sx={{ wordWrap: 'break-word' }}>
                      {msg.text || msg.message || msg.content}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        opacity: 0.7,
                        fontSize: '0.65rem'
                      }}
                    >
                      {msg.timestamp
                        ? format(new Date(msg.timestamp), 'HH:mm')
                        : ''}
                    </Typography>
                  </Box>
                </Box>
              </ListItem>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </List>

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          backgroundColor: 'background.paper'
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          variant="outlined"
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  color="primary"
                  size="small"
                >
                  <Send />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3
            }
          }}
        />
      </Box>
    </Paper>
  );
};

export default ChatPanel;
