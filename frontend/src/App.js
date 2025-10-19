import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';
import VideoCallRoom from './components/VideoCallRoom';
import JoinRoom from './components/JoinRoom';
import CreateRoom from './components/CreateRoom';
import { useVideoCall } from './contexts/VideoCallContext';

function App() {
  const { isConnected } = useVideoCall();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Routes>
        {/* Home/Landing Page */}
        <Route path="/" element={<HomePage />} />
        
        {/* Create Room */}
        <Route path="/create" element={<CreateRoom />} />
        
        {/* Join Room */}
        <Route path="/join" element={<JoinRoom />} />
        <Route path="/join/:roomId" element={<JoinRoom />} />
        
        {/* Video Call Room */}
        <Route path="/room/:roomId" element={<VideoCallRoom />} />
        
        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
}

// Simple Home Page Component
function HomePage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box textAlign="center">
        <Typography variant="h2" component="h1" gutterBottom>
          🎥 Video Call Module
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          High-quality video calls powered by WebRTC and Mediasoup SFU
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
          Support for 10,000+ concurrent participants with crystal clear audio and HD video
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            href="/create"
            sx={{ minWidth: 160 }}
          >
            Create Room
          </Button>
          <Button
            variant="outlined"
            size="large"
            href="/join"
            sx={{ minWidth: 160 }}
          >
            Join Room
          </Button>
        </Box>

        <Box sx={{ mt: 6, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            ✨ Features
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mt: 2 }}>
            <FeatureCard 
              icon="🎥" 
              title="HD Video" 
              description="Crystal clear 1080p video streaming"
            />
            <FeatureCard 
              icon="🎙️" 
              title="Clear Audio" 
              description="Noise suppression and echo cancellation"
            />
            <FeatureCard 
              icon="📱" 
              title="Multi-Device" 
              description="Works on desktop, mobile, and tablets"
            />
            <FeatureCard 
              icon="🌐" 
              title="Global Scale" 
              description="10,000+ concurrent participants"
            />
            <FeatureCard 
              icon="🔐" 
              title="Secure" 
              description="End-to-end encrypted connections"
            />
            <FeatureCard 
              icon="⚡" 
              title="Low Latency" 
              description="Real-time communication under 100ms"
            />
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="h4" component="div" sx={{ mb: 1 }}>
        {icon}
      </Typography>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Box>
  );
}

export default App;