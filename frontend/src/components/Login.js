import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Tab,
  Tabs
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  School,
  VideoCall
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '../contexts/UserRoleContext';

// Get API URL from environment or use localhost as fallback
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const { login: contextLogin } = useUserRole();
  const [activeTab, setActiveTab] = useState(0); // 0: Login, 1: Register
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login Form State
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    role: 'student' // student or teacher
  });

  // Register Form State
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    phoneNumber: '',
    department: ''
  });

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate fields
      if (!loginData.email || !loginData.password) {
        throw new Error('Please fill in all fields');
      }

      // Call login API
      const response = await fetch(`${API_URL}/api/video-call/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data using context (with proper validation)
      contextLogin(data.user, data.token);

      // Call success callback
      if (onLoginSuccess) {
        onLoginSuccess(data.user, data.token);
      }

      console.log('✅ Login successful:', data.user.email, 'Role:', data.user.role);

      // Redirect based on role
      if (data.user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }

    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate fields
      if (!registerData.name || !registerData.email || !registerData.password) {
        throw new Error('Please fill in all required fields');
      }

      if (registerData.password !== registerData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (registerData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Call register API
      const response = await fetch(`${API_URL}/api/video-call/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
          role: registerData.role,
          phoneNumber: registerData.phoneNumber,
          department: registerData.department
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess('Registration successful! Please login.');
      setTimeout(() => {
        setActiveTab(0); // Switch to login tab
        setLoginData({ ...loginData, email: registerData.email });
      }, 2000);

    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login - Register and login demo account
  const handleDemoLogin = async (role) => {
    setLoading(true);
    setError('');
    
    try {
      // Create demo account credentials
      const demoEmail = `demo-${role}-${Date.now()}@sgt-lms.com`;
      const demoPassword = 'demo123456';
      const demoName = role === 'teacher' ? 'Demo Teacher' : 'Demo Student';

      // Register demo account
      console.log('📝 Registering demo account:', demoEmail);
      const registerResponse = await fetch(`${API_URL}/api/video-call/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: demoName,
          email: demoEmail,
          password: demoPassword,
          role: role
        }),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(registerData.message || 'Demo account creation failed');
      }

      console.log('✅ Demo account created, logging in...');

      // Login with demo account
      const loginResponse = await fetch(`${API_URL}/api/video-call/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: demoEmail,
          password: demoPassword
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.message || 'Demo login failed');
      }

      // Store with proper validation
      contextLogin(loginData.user, loginData.token);

      if (onLoginSuccess) {
        onLoginSuccess(loginData.user, loginData.token);
      }

      console.log('✅ Demo login successful!');
      navigate(role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard');

    } catch (err) {
      console.error('❌ Demo login error:', err);
      setError(err.message || 'Demo login failed. Please try manual registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Logo & Title */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <VideoCall sx={{ fontSize: 64, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
              SGT-LMS Live Class
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enterprise Video Conferencing for Education
            </Typography>
          </Box>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => {
              setActiveTab(newValue);
              setError('');
              setSuccess('');
            }}
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>

          {/* Error/Success Messages */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {/* Login Form */}
          {activeTab === 0 && (
            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
                required
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
                required
              />

              <TextField
                fullWidth
                select
                label="Login As"
                value={loginData.role}
                onChange={(e) => setLoginData({ ...loginData, role: e.target.value })}
                SelectProps={{
                  native: true,
                }}
                sx={{ mb: 3 }}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </TextField>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mb: 2, py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Login'}
              </Button>

              <Divider sx={{ my: 2 }}>OR</Divider>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleDemoLogin('teacher')}
                  startIcon={<School />}
                >
                  Demo Teacher
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleDemoLogin('student')}
                  startIcon={<Person />}
                >
                  Demo Student
                </Button>
              </Box>
            </form>
          )}

          {/* Register Form */}
          {activeTab === 1 && (
            <form onSubmit={handleRegister}>
              <TextField
                fullWidth
                label="Full Name"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
                required
              />

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
                required
              />

              <TextField
                fullWidth
                label="Phone Number (Optional)"
                value={registerData.phoneNumber}
                onChange={(e) => setRegisterData({ ...registerData, phoneNumber: e.target.value })}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Department (Optional)"
                value={registerData.department}
                onChange={(e) => setRegisterData({ ...registerData, department: e.target.value })}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
                required
              />

              <TextField
                fullWidth
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                sx={{ mb: 2 }}
                required
              />

              <TextField
                fullWidth
                select
                label="Register As"
                value={registerData.role}
                onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                SelectProps={{
                  native: true,
                }}
                sx={{ mb: 3 }}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </TextField>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Account'}
              </Button>
            </form>
          )}

          {/* Footer */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              © 2025 SGT-LMS. Supports 10,000+ concurrent users
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
