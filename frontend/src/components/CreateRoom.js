import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { Add, VideoCall, Lock, Public } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

function CreateRoom() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    roomName: '',
    hostName: '',
    description: '',
    isPrivate: false,
    maxParticipants: 50,
    features: {
      chat: true,
      screenShare: true,
      recording: false,
      whiteboard: false,
      breakoutRooms: false
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature]
      }
    }));
  };

  const generateRoomId = () => {
    return uuidv4().substring(0, 8).toUpperCase();
  };

  const handleCreateRoom = async () => {
    if (!formData.roomName.trim()) {
      toast.error('Please enter a room name');
      return;
    }
    
    if (!formData.hostName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setIsLoading(true);
    
    try {
      const roomId = generateRoomId();
      
      // Here you would typically make an API call to create the room
      // For now, we'll just navigate directly
      
      toast.success(`Room "${formData.roomName}" created successfully!`);
      
      // Navigate to the room as host
      navigate(`/room/${roomId}`, {
        state: {
          userName: formData.hostName,
          userRole: 'host',
          roomConfig: {
            name: formData.roomName,
            description: formData.description,
            isPrivate: formData.isPrivate,
            maxParticipants: formData.maxParticipants,
            features: formData.features
          },
          mediaSettings: {
            videoEnabled: true,
            audioEnabled: true
          }
        }
      });
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room');
    } finally {
      setIsLoading(false);
    }
  };

  const featureOptions = [
    { 
      key: 'chat', 
      label: 'Chat', 
      description: 'Text messaging during calls',
      icon: '💬'
    },
    { 
      key: 'screenShare', 
      label: 'Screen Share', 
      description: 'Share your screen with participants',
      icon: '🖥️'
    },
    { 
      key: 'recording', 
      label: 'Recording', 
      description: 'Record the video call',
      icon: '🎥'
    },
    { 
      key: 'whiteboard', 
      label: 'Whiteboard', 
      description: 'Collaborative drawing board',
      icon: '🎨'
    },
    { 
      key: 'breakoutRooms', 
      label: 'Breakout Rooms', 
      description: 'Split participants into smaller groups',
      icon: '👥'
    }
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" textAlign="center" gutterBottom>
          Create Video Call Room
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          {/* Basic Room Info */}
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VideoCall /> Room Details
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Room Name"
                value={formData.roomName}
                onChange={(e) => handleInputChange('roomName', e.target.value)}
                placeholder="e.g., Team Meeting, Study Group"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Your Name (Host)"
                value={formData.hostName}
                onChange={(e) => handleInputChange('hostName', e.target.value)}
                placeholder="Enter your name"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description (Optional)"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the purpose of this room..."
              />
            </Grid>
          </Grid>

          {/* Room Settings */}
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Lock /> Room Settings
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPrivate}
                    onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {formData.isPrivate ? <Lock fontSize="small" /> : <Public fontSize="small" />}
                    {formData.isPrivate ? 'Private Room' : 'Public Room'}
                  </Box>
                }
              />
              <Typography variant="caption" color="text.secondary" display="block">
                {formData.isPrivate ? 'Only people with the room ID can join' : 'Anyone can discover and join this room'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Max Participants</InputLabel>
                <Select
                  value={formData.maxParticipants}
                  onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                  label="Max Participants"
                >
                  <MenuItem value={10}>10 participants</MenuItem>
                  <MenuItem value={25}>25 participants</MenuItem>
                  <MenuItem value={50}>50 participants</MenuItem>
                  <MenuItem value={100}>100 participants</MenuItem>
                  <MenuItem value={500}>500 participants</MenuItem>
                  <MenuItem value={1000}>1000+ participants</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Features */}
          <Typography variant="h6" gutterBottom>
            Room Features
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {featureOptions.map((feature) => (
              <Grid item xs={12} sm={6} md={4} key={feature.key}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    cursor: 'pointer',
                    borderColor: formData.features[feature.key] ? 'primary.main' : 'divider',
                    bgcolor: formData.features[feature.key] ? 'primary.50' : 'transparent'
                  }}
                  onClick={() => handleFeatureToggle(feature.key)}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <span style={{ fontSize: '1.2em' }}>{feature.icon}</span>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {feature.label}
                      </Typography>
                      <Switch
                        size="small"
                        checked={formData.features[feature.key]}
                        onChange={() => handleFeatureToggle(feature.key)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Room Summary */}
          <Card variant="outlined" sx={{ mb: 4, bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Room Summary
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip 
                  icon={formData.isPrivate ? <Lock /> : <Public />} 
                  label={formData.isPrivate ? 'Private' : 'Public'} 
                  size="small" 
                />
                <Chip 
                  label={`Max ${formData.maxParticipants} participants`} 
                  size="small" 
                />
                {Object.entries(formData.features)
                  .filter(([_, enabled]) => enabled)
                  .map(([feature, _]) => (
                    <Chip 
                      key={feature}
                      label={featureOptions.find(f => f.key === feature)?.label}
                      size="small"
                      variant="outlined"
                    />
                  ))
                }
              </Box>
              <Typography variant="body2" color="text.secondary">
                Room ID will be generated automatically when you create the room
              </Typography>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={handleCreateRoom}
              disabled={isLoading}
              startIcon={<Add />}
              sx={{ minWidth: 160 }}
            >
              {isLoading ? 'Creating...' : 'Create Room'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default CreateRoom;