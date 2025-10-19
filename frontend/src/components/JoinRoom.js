import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Avatar,
  Card,
  CardContent
} from '@mui/material';
import { VideocamOff, Videocam, MicOff, Mic } from '@mui/icons-material';
import { toast } from 'react-toastify';

function JoinRoom() {
  const navigate = useNavigate();
  const { roomId: urlRoomId } = useParams();
  
  const [formData, setFormData] = useState({
    roomId: urlRoomId || '',
    userName: '',
    userRole: 'participant'
  });
  
  const [mediaPreview, setMediaPreview] = useState({
    stream: null,
    videoEnabled: true,
    audioEnabled: true
  });

  const [isLoading, setIsLoading] = useState(false);

  // Initialize media preview
  React.useEffect(() => {
    initializeMediaPreview();
    return () => {
      if (mediaPreview.stream) {
        mediaPreview.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeMediaPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setMediaPreview(prev => ({ ...prev, stream }));
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Could not access camera/microphone');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleVideo = () => {
    if (mediaPreview.stream) {
      const videoTrack = mediaPreview.stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !mediaPreview.videoEnabled;
        setMediaPreview(prev => ({ ...prev, videoEnabled: !prev.videoEnabled }));
      }
    }
  };

  const toggleAudio = () => {
    if (mediaPreview.stream) {
      const audioTrack = mediaPreview.stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !mediaPreview.audioEnabled;
        setMediaPreview(prev => ({ ...prev, audioEnabled: !prev.audioEnabled }));
      }
    }
  };

  const handleJoinRoom = async () => {
    if (!formData.roomId.trim()) {
      toast.error('Please enter a room ID');
      return;
    }
    
    if (!formData.userName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setIsLoading(true);
    
    try {
      // Here you would typically validate the room exists
      // For now, we'll just navigate directly
      
      // Pass user data through navigation state
      navigate(`/room/${formData.roomId}`, {
        state: {
          userName: formData.userName,
          userRole: formData.userRole,
          mediaSettings: {
            videoEnabled: mediaPreview.videoEnabled,
            audioEnabled: mediaPreview.audioEnabled
          }
        }
      });
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error('Failed to join room');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" textAlign="center" gutterBottom>
          Join Video Call
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, mt: 4 }}>
          {/* Form Section */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Room Details
            </Typography>
            
            <TextField
              fullWidth
              label="Room ID"
              value={formData.roomId}
              onChange={(e) => handleInputChange('roomId', e.target.value)}
              placeholder="Enter room ID"
              sx={{ mb: 3 }}
            />
            
            <TextField
              fullWidth
              label="Your Name"
              value={formData.userName}
              onChange={(e) => handleInputChange('userName', e.target.value)}
              placeholder="Enter your name"
              sx={{ mb: 3 }}
            />
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.userRole}
                onChange={(e) => handleInputChange('userRole', e.target.value)}
                label="Role"
              >
                <MenuItem value="participant">Participant</MenuItem>
                <MenuItem value="host">Host</MenuItem>
                <MenuItem value="observer">Observer</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleJoinRoom}
              disabled={isLoading}
              sx={{ mt: 2 }}
            >
              {isLoading ? 'Joining...' : 'Join Room'}
            </Button>
          </Box>
          
          {/* Media Preview Section */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Media Preview
            </Typography>
            
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ 
                  position: 'relative',
                  width: '100%',
                  paddingTop: '56.25%', // 16:9 aspect ratio
                  bgcolor: 'grey.900',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}>
                  {mediaPreview.stream && mediaPreview.videoEnabled ? (
                    <video
                      ref={(video) => {
                        if (video && mediaPreview.stream) {
                          video.srcObject = mediaPreview.stream;
                        }
                      }}
                      autoPlay
                      muted
                      playsInline
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <Box sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                      color: 'white'
                    }}>
                      <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 1 }}>
                        {formData.userName.charAt(0).toUpperCase() || '?'}
                      </Avatar>
                      <Typography variant="body2">
                        {formData.userName || 'Your Name'}
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Media Controls Overlay */}
                  <Box sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 1
                  }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={toggleVideo}
                      color={mediaPreview.videoEnabled ? 'primary' : 'error'}
                      sx={{ minWidth: 'auto', p: 1 }}
                    >
                      {mediaPreview.videoEnabled ? <Videocam /> : <VideocamOff />}
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={toggleAudio}
                      color={mediaPreview.audioEnabled ? 'primary' : 'error'}
                      sx={{ minWidth: 'auto', p: 1 }}
                    >
                      {mediaPreview.audioEnabled ? <Mic /> : <MicOff />}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Check your camera and microphone before joining
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="text"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default JoinRoom;