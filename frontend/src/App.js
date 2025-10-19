import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';
import VideoCallRoom from './components/VideoCallRoom';
import JoinRoom from './components/JoinRoom';
import CreateRoom from './components/CreateRoom';
import Login from './components/Login';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import { useVideoCall } from './contexts/VideoCallContext';
import { initAuthCleanup, getValidToken } from './utils/authUtils';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = getValidToken();
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/login" replace />;
    }
    return children;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return <Navigate to="/login" replace />;
  }
};

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Clean up any invalid tokens on app start
    console.log('🚀 Initializing app...');
    initAuthCleanup();
    
    // Check if user is already logged in
    const savedToken = getValidToken();
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        console.log('✅ User session restored');
      } catch (error) {
        console.error('❌ Error loading user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      console.log('ℹ️ No valid session found');
    }
  }, []);

  const handleLoginSuccess = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Routes>
        {/* Login Route */}
        <Route 
          path="/login" 
          element={
            user ? (
              <Navigate to={user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          } 
        />

        {/* Teacher Routes */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute allowedRoles={['teacher', 'admin', 'hod', 'dean']}>
              <TeacherDashboard token={token} user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* Teacher Live Class Room */}
        <Route
          path="/teacher/live-class/:classId"
          element={
            <ProtectedRoute allowedRoles={['teacher', 'admin', 'hod', 'dean']}>
              <VideoCallRoom token={token} user={user} />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard token={token} user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        
        {/* Home/Landing Page */}
        <Route path="/home" element={<HomePage />} />
        
        {/* Create Room */}
        <Route 
          path="/create" 
          element={
            <ProtectedRoute allowedRoles={['teacher', 'admin', 'hod', 'dean']}>
              <CreateRoom token={token} user={user} />
            </ProtectedRoute>
          } 
        />
        
        {/* Join Room */}
        <Route path="/join" element={<JoinRoom />} />
        <Route path="/join/:roomId" element={<JoinRoom />} />
        
        {/* Video Call Room */}
        <Route 
          path="/room/:roomId" 
          element={
            <ProtectedRoute allowedRoles={['teacher', 'student', 'admin', 'hod', 'dean']}>
              <VideoCallRoom token={token} user={user} />
            </ProtectedRoute>
          } 
        />
        
        {/* Default Route - redirect to login or dashboard */}
        <Route 
          path="/" 
          element={
            user ? (
              <Navigate to={user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* Redirect unknown routes */}
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