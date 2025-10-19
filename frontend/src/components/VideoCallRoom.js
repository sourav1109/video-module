﻿import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserRole } from '../contexts/UserRoleContext';
import axios from 'axios';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Tabs,
  Tab,
  Divider,
  AppBar,
  Toolbar,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  Tooltip,
  Alert,
  Snackbar,
  ButtonGroup,
  Stack,
  Grid
} from '@mui/material';

// Icons
import {
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
  ScreenShare,
  StopScreenShare,
  Delete,
  UploadFile,
  AttachFile,
  Poll,
  School,
  ExitToApp,
  People,
  Chat,
  Create,
  Brush,
  Clear,
  LinearScale,
  RadioButtonUnchecked,
  Crop169,
  Undo,
  Redo,
  FiberManualRecord,
  Stop,
  Send,
  MenuBook,
  Assignment,
  Quiz,
  PanTool as RaiseHandIcon,
  Close,
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight,
  ExpandLess,
  ExpandMore,
  Circle,
  PushPin,
  AspectRatio,
  GridView
} from '@mui/icons-material';

import { styled } from '@mui/material/styles';
import ScalableWebRTCManager from '../utils/ScalableWebRTCManager';
import AdvancedWhiteboard from './whiteboard/AdvancedWhiteboard';

// Styled Components following SGT LMS design
const MainContainer = styled(Box)(({ theme }) => ({
  height: '100vh',
  width: '100vw',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#0a0e13',
  position: 'fixed',
  top: 0,
  left: 0,
  overflow: 'hidden',
  zIndex: 9999,
  // Add CSS animations for better UX
  '& @keyframes pulse': {
    '0%': { opacity: 1 },
    '50%': { opacity: 0.7 },
    '100%': { opacity: 1 }
  },
  '& @keyframes pinGlow': {
    '0%': { boxShadow: '0 0 8px rgba(59, 130, 246, 0.4)' },
    '50%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' },
    '100%': { boxShadow: '0 0 8px rgba(59, 130, 246, 0.4)' }
  },
  '& @keyframes slideIn': {
    '0%': { transform: 'translateY(10px)', opacity: 0 },
    '100%': { transform: 'translateY(0)', opacity: 1 }
  }
}));

const HeaderBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'rgba(15, 23, 42, 0.95)',
  color: '#ffffff',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  zIndex: 1100
}));

const ContentGrid = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'row',
  padding: theme.spacing(1),
  height: 'calc(100vh - 64px - 80px)', // Account for header and control bar
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: 'transparent',
  gap: theme.spacing(1)
}));

const SidePanel = styled(Card)(({ theme, collapsed }) => ({
  height: '100%',
  display: collapsed ? 'none' : 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  width: '320px',
  minWidth: '320px',
  maxWidth: '320px',
  transition: 'all 0.3s ease',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: theme.spacing(2),
  backgroundColor: 'rgba(15, 23, 42, 0.98)',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 12px 48px rgba(0, 0, 0, 0.4)',
  zIndex: 10
}));

const MainVideoArea = styled(Card)(({ theme }) => ({
  flex: 1,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: theme.spacing(2),
  backgroundColor: 'rgba(15, 23, 42, 0.8)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  position: 'relative'
}));

const ControlBar = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 24,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(1.5, 4),
  borderRadius: theme.spacing(5),
  backgroundColor: 'rgba(10, 14, 19, 0.95)',
  backdropFilter: 'blur(24px)',
  boxShadow: '0 12px 48px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  zIndex: 2000,
  minHeight: '64px',
  maxWidth: '600px'
}));

const VideoContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  backgroundColor: '#0f172a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
}));

const WhiteboardCanvas = styled('canvas')(({ theme }) => ({
  width: '100%',
  height: '100%',
  cursor: 'crosshair',
  backgroundColor: '#ffffff',
  borderRadius: theme.spacing(1)
}));

const SgtLmsLiveClass = ({ token, user, classId: propClassId }) => {
  const navigate = useNavigate();
  const { classId: paramClassId } = useParams();
  const classId = propClassId || paramClassId;
  
  // Early validation
  if (!classId) {
    console.warn('âš ï¸ CodeTantraLiveClass: No classId provided');
  }
  
  // Use role context for authentication and multi-role support
  const { 
    user: contextUser, 
    activeRole, 
    availableRoles, 
    hasRole, 
    canAccessRole, 
    getRoleInfo, 
    isMultiRole,
    switchRole,
    getCurrentRoleAssignment
  } = useUserRole();

  // Panel States
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState(0);

  // User & Role States with Multi-Role Support
  const currentUser = user || contextUser;
  const [isTeacher, setIsTeacher] = useState(activeRole === 'teacher');
  const [isInstructor, setIsInstructor] = useState(['teacher', 'admin', 'hod', 'dean'].includes(activeRole));
  const [canModerate, setCanModerate] = useState(['admin', 'hod', 'dean'].includes(activeRole));
  const [hasFullAccess, setHasFullAccess] = useState(['admin', 'dean'].includes(activeRole));
  const [participants, setParticipants] = useState([
    // Will be populated from real backend data
  ]);
  const participantsRef = useRef([]);

  // Update participants ref when state changes
  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  // Update role-based permissions when activeRole changes
  useEffect(() => {
    setIsTeacher(activeRole === 'teacher');
    setIsInstructor(['teacher', 'admin', 'hod', 'dean'].includes(activeRole));
    setCanModerate(['admin', 'hod', 'dean'].includes(activeRole));
    setHasFullAccess(['admin', 'dean'].includes(activeRole));
  }, [activeRole]);

  // Media Control States - Initialize based on class settings and role
  const [micEnabled, setMicEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [allowStudentMic, setAllowStudentMic] = useState(false);
  const [allowStudentCamera, setAllowStudentCamera] = useState(false);
  
  // Materials Panel States
  const [materialTab, setMaterialTab] = useState(0);
  const [classFiles, setClassFiles] = useState([]);
  const [activePolls, setActivePolls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [handRaised, setHandRaised] = useState(false);

  // Content States
  const [contentType, setContentType] = useState('video'); // video, whiteboard, screen
  const [hasPermission, setHasPermission] = useState(isTeacher);
  
  // Class Data State
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Whiteboard States
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingTool, setDrawingTool] = useState('pen');
  const [drawingColor, setDrawingColor] = useState('#000000');
  const [drawingWidth, setDrawingWidth] = useState(2);

  // Video References
  const localVideoRef = useRef(null);
  const remoteVideosRef = useRef(new Map());

  // Video Pin States
  const [pinnedVideo, setPinnedVideo] = useState(null); // { userId, name, videoRef, isLocal }
  const [videoLayout, setVideoLayout] = useState('grid'); // 'grid', 'pinned'

  // Individual Student Permissions
  const [studentPermissions, setStudentPermissions] = useState({}); // { userId: { camera: boolean, mic: boolean } }
  
  // Communication States
  const [chatMessages, setChatMessages] = useState([
    // Will be populated from real backend data via Socket.IO
  ]);
  
  // Input States
  const [chatInput, setChatInput] = useState('');
  const [questionInput, setQuestionInput] = useState('');

  // Permission Request State
  const [permissionRequests, setPermissionRequests] = useState([]); // For teachers to see student requests

  const [questions, setQuestions] = useState([
    // Will be populated from real backend data
  ]);

  const [materials] = useState([
    { id: 1, name: 'Chapter 5 - React Hooks.pdf', sharedAt: new Date(Date.now() - 600000) },
    { id: 2, name: 'Assignment 3.docx', sharedAt: new Date(Date.now() - 400000) },
    { id: 3, name: 'Code Examples.zip', sharedAt: new Date(Date.now() - 200000) }
  ]);

  // WebRTC States
  const webrtcManager = useRef(null);
  const socket = useRef(null);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [localStream, setLocalStream] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Utility Functions
  const addNotification = useCallback((message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [...prev, notification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);

  // Camera state management - ensure video stream stays connected
  useEffect(() => {
    const maintainVideoStream = async () => {
      if (cameraEnabled && localVideoRef.current && webrtcManager.current) {
        try {
          // Check if video element has a stream
          if (!localVideoRef.current.srcObject) {
            console.log('[VIDEO] Re-establishing local video stream connection');
            
            // Get the current local stream from WebRTC manager
            const localStream = webrtcManager.current.localStream;
            if (localStream && localStream.getVideoTracks().length > 0) {
              localVideoRef.current.srcObject = localStream;
              localVideoRef.current.muted = true;
              await localVideoRef.current.play();
              console.log('[SUCCESS] Local video stream re-established');
            }
          }
        } catch (error) {
          console.warn('[VIDEO] Failed to maintain video stream:', error);
        }
      }
    };

    // Run immediately and then with a small delay to handle async operations
    maintainVideoStream();
    const timeoutId = setTimeout(maintainVideoStream, 500);
    
    return () => clearTimeout(timeoutId);
  }, [cameraEnabled]); // Re-run when camera state changes

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Video Stream Functions
  const attachVideoStream = (videoElement, stream) => {
    if (videoElement && stream) {
      videoElement.srcObject = stream;
      videoElement.play().catch(console.error);
    }
  };

  const detachVideoStream = (videoElement) => {
    if (videoElement) {
      videoElement.srcObject = null;
    }
  };

  // Pin Video Functions
  const pinVideo = (userId, name, videoRef, isLocal = false) => {
    console.log('"Œ Pinning video:', { userId, name, isLocal, role: activeRole });
    
    // Check if same video is already pinned
    if (pinnedVideo && pinnedVideo.userId === userId) {
      toast.info(`${name}'s video is already in focus`);
      return;
    }
    
    setPinnedVideo({ userId, name, videoRef, isLocal });
    setVideoLayout('pinned');
    
    // Emit pin event to all participants
    if (socket.current) {
      socket.current.emit('video-pinned', {
        classId,
        pinnedUserId: userId,
        pinnedUserName: name,
        pinnedBy: currentUser?.id || currentUser?._id,
        pinnedByName: currentUser?.name || 'Unknown',
        pinnedByRole: activeRole
      });
    }
    
    const roleEmoji = activeRole === 'teacher' ? '👨‍🏫' : activeRole === 'hod' ? '👔' : '👨‍💼';
    toast.success(`${roleEmoji} ${isLocal ? 'Your video' : name + "'s video"} is now in focus`);
  };

  const unpinVideo = () => {
    console.log('"Œ Unpinning video');
    
    const previousPin = pinnedVideo?.name;
    setPinnedVideo(null);
    setVideoLayout('grid');
    
    // Emit unpin event to all participants
    if (socket.current) {
      socket.current.emit('video-unpinned', {
        classId,
        unpinnedBy: currentUser?.id || currentUser?._id,
        unpinnedByName: currentUser?.name || 'Unknown',
        unpinnedByRole: activeRole
      });
    }
    
    const roleEmoji = activeRole === 'teacher' ? '👨‍🏫' : activeRole === 'hod' ? '👔' : '👨‍💼';
    toast.info(`${roleEmoji} Returned to grid view${previousPin ? ` (${previousPin})` : ''}`);
  };

  const toggleVideoLayout = () => {
    if (videoLayout === 'grid') {
      // Auto-pin local video if available
      if (localVideoRef.current && cameraEnabled) {
        pinVideo(
          currentUser?.id || currentUser?._id, 
          currentUser?.name || 'You', 
          localVideoRef.current, 
          true
        );
      }
    } else {
      unpinVideo();
    }
  };

  // Student Permission Management Functions
  const grantStudentPermission = (studentId, permissionType) => {
    if (!isInstructor && !canModerate) {
      toast.error('Only teachers can grant permissions');
      return;
    }

    console.log('🎯 Granting permission:', { studentId, permissionType, classId });

    setStudentPermissions(prev => {
      const updated = {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [permissionType]: true
        }
      };
      console.log(' Teacher updated permissions locally:', updated);
      return updated;
    });

    // Emit to backend
    if (socket.current) {
      socket.current.emit('grant-student-permission', {
        studentId,
        permissionType,
        classId,
        grantedBy: currentUser?.id || currentUser?._id
      });
      console.log('"¤ Emitted grant-student-permission:', { studentId, permissionType });
    }

    const student = participants.find(p => p.id === studentId);
    toast.success(`Granted ${permissionType} permission to ${student?.name || 'student'}`);
  };

  const revokeStudentPermission = (studentId, permissionType) => {
    if (!isInstructor && !canModerate) {
      toast.error('Only teachers can revoke permissions');
      return;
    }

    setStudentPermissions(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [permissionType]: false
      }
    }));

    // Emit to backend
    if (socket.current) {
      socket.current.emit('revoke-student-permission', {
        studentId,
        permissionType,
        classId,
        revokedBy: currentUser?.id || currentUser?._id
      });
    }

    const student = participants.find(p => p.id === studentId);
    toast.success(`Revoked ${permissionType} permission from ${student?.name || 'student'}`);
  };

  // Check if current user has specific permission
  const hasIndividualPermission = (permissionType) => {
    const userId = currentUser?.id || currentUser?._id;
    const userIdStr = userId?.toString();
    
    if (!userId) {
      console.warn('š¨ No user ID available for permission check');
      return false;
    }
    
    // Check both original ID and string version for compatibility
    const hasPermission = studentPermissions[userId]?.[permissionType] || 
                         studentPermissions[userIdStr]?.[permissionType] || 
                         false;
    
    // Always log for debugging permissions
    console.log('" Permission check for ${permissionType}:', {
      userId,
      userIdStr,
      currentUser: currentUser?.name,
      hasPermission,
      isTeacher: isInstructor,
      permissionKeys: Object.keys(studentPermissions),
      userPermissions: studentPermissions[userId] || studentPermissions[userIdStr]
    });
    
    return hasPermission;
  };

  // Simple permission check - no request system needed
  const canUseMedia = (permissionType) => {
    // Teachers and moderators always have access
    if (isInstructor || canModerate) {
      return true;
    }
    
    // Students need individual permission from teacher
    const hasPermission = hasIndividualPermission(permissionType);
    
    console.log(`✅ canUseMedia(${permissionType}):`, {
      isInstructor,
      canModerate,
      hasPermission,
      currentUserId: currentUser?.id || currentUser?._id,
      studentPermissions: studentPermissions
    });
    
    return hasPermission;
  };

  // Real Backend Integration with Scalable Services
  useEffect(() => {
    const initializeRealTimeClass = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

        // 1. Fetch class data from backend
        const classResponse = await axios.get(`${API_URL}/api/video-call/${classId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const classData = classResponse.data.class || classResponse.data;
        setClassData(classData);

        // Set class permissions based on class settings
        const isCurrentUserInstructor = ['teacher', 'admin', 'hod', 'dean'].includes(activeRole);
        setAllowStudentMic(classData.allowStudentMic || false);
        setAllowStudentCamera(classData.allowStudentCamera || false);
        
        // Set initial media states based on role and class settings
        if (isCurrentUserInstructor) {
          setMicEnabled(true);
          setCameraEnabled(true);
        } else {
          // Students get mic/camera based on class settings
          setMicEnabled(classData.allowStudentMic || false);
          setCameraEnabled(classData.allowStudentCamera || false);
        }

        console.log('"Š Class media permissions:', {
          role: activeRole,
          isInstructor: isCurrentUserInstructor,
          allowStudentMic: classData.allowStudentMic,
          allowStudentCamera: classData.allowStudentCamera,
          micEnabled: isCurrentUserInstructor || classData.allowStudentMic,
          cameraEnabled: isCurrentUserInstructor || classData.allowStudentCamera
        });

        // 2. Fetch participants - Commented out, will use Socket.IO real-time updates
        // const participantsResponse = await axios.get(`${API_URL}/api/video-call/${classId}/participants`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // setParticipants(participantsResponse.data.participants || []);
        setParticipants([]);

        // 3. Fetch chat history - Commented out, will use Socket.IO real-time updates
        // const messagesResponse = await axios.get(`${API_URL}/api/video-call/${classId}/messages`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // setChatMessages(messagesResponse.data.messages || []);
        setChatMessages([]);

        // 4. Initialize Socket.IO for real-time features
        socket.current = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
          auth: { 
            token,
            classId,
            userId: currentUser?.id || currentUser?._id,
            userRole: activeRole || 'student',
            name: currentUser?.name
          },
          transports: ['websocket', 'polling']
        });

        // Socket event listeners for real-time updates
        socket.current.on('connect', () => {
          console.log('🔥 SIGNALING DEBUG: Socket.IO connected to backend');
          console.log('✅ Connected to scalable backend');
          console.log('†" User info sent to backend:', {
            id: currentUser?.id,
            _id: currentUser?._id,
            name: currentUser?.name,
            role: activeRole,
            sentUserId: currentUser?.id || currentUser?._id
          });
          setConnectionState('connected');
          toast.success('Connected to live class!');
        });

        socket.current.on('disconnect', () => {
          console.log('âŒ Disconnected from backend');
          setConnectionState('disconnected');
          toast.warning('Connection lost, attempting to reconnect...');
        });

        socket.current.on('participant-joined', (participant) => {
          setParticipants(prev => {
            const exists = prev.find(p => p.id === participant.id);
            if (!exists) {
              toast.info(`${participant.name} joined the class`);
              return [...prev, { ...participant, isOnline: true }];
            }
            return prev;
          });
        });

        socket.current.on('participant-left', (participantId) => {
          setParticipants(prev => {
            const participant = prev.find(p => p.id === participantId);
            if (participant) {
              toast.info(`${participant.name} left the class`);
            }
            // Mark as offline instead of removing completely
            return prev.map(p => p.id === participantId ? { ...p, isOnline: false } : p);
          });
        });

        socket.current.on('participants-updated', (data) => {
          console.log('👥 Participants list updated:', data.participants);
          const updatedParticipants = (data.participants || []).map(p => ({ ...p, isOnline: true }));
          setParticipants(updatedParticipants);
        });

        socket.current.on('video-pinned', (data) => {
          console.log('"Œ Video pinned by another user:', data);
          const roleEmoji = activeRole === 'teacher' ? '👨‍🏫' : activeRole === 'hod' ? '👔' : '👨‍💼';
          toast.info(`${roleEmoji} ${data.pinnedByName || 'Someone'} focused on ${data.pinnedUserName}'s video`);
        });

        socket.current.on('video-unpinned', (data) => {
          console.log('"Œ Video unpinned by another user:', data);
          const roleEmoji = activeRole === 'teacher' ? '👨‍🏫' : activeRole === 'hod' ? '👔' : '👨‍💼';
          toast.info(`${roleEmoji} ${data.unpinnedByName || 'Someone'} returned to grid view`);
        });

        socket.current.on('chat-message', (message) => {
          console.log('💬 Chat message received:', message);
          setChatMessages(prev => [...prev, {
            id: message.id,
            message: message.text,  // Backend uses 'text', frontend displays as 'message'
            sender: message.senderName,
            senderId: message.senderId,
            senderRole: message.senderRole,
            timestamp: new Date(message.timestamp),
            isPrivate: message.isPrivate
          }]);
        });

        socket.current.on('hand-raised', ({ userId, raised, userName }) => {
          setParticipants(prev => prev.map(p => 
            p.id === userId ? { ...p, handRaised: raised } : p
          ));
          if (raised && isTeacher) {
            toast.info(`${userName} raised their hand`);
          }
        });

        socket.current.on('media-state-changed', ({ userId, micEnabled, cameraEnabled }) => {
          setParticipants(prev => prev.map(p => 
            p.id === userId ? { ...p, micEnabled, cameraEnabled } : p
          ));
        });

        // Student Permission Events
        socket.current.on('permission-granted', ({ studentId, permissionType, grantedBy, allPermissions }) => {
          console.log('"¡ Permission granted event received:', { 
            studentId, 
            permissionType, 
            grantedBy,
            allPermissions 
          });
          
          const currentUserId = (currentUser?.id || currentUser?._id)?.toString();
          const receivedStudentId = studentId?.toString();
          
          console.log('"Š Current user info:', { 
            id: currentUser?.id, 
            _id: currentUser?._id, 
            name: currentUser?.name,
            currentUserId,
            receivedStudentId
          });
          
          // Update permissions state with full sync if available
          setStudentPermissions(prev => {
            let updated;
            
            if (allPermissions) {
              // Full permissions sync from backend
              updated = { ...allPermissions };
              console.log('"„ Full permissions sync:', updated);
            } else {
              // Single permission update
              updated = {
                ...prev,
                [receivedStudentId]: {
                  ...prev[receivedStudentId],
                  [permissionType]: true
                }
              };
              console.log('"„ Single permission update:', updated);
            }
            
            return updated;
          });

          console.log('†" ID comparison:', { 
            receivedStudentId, 
            currentUserId, 
            matches: receivedStudentId === currentUserId 
          });
          
          if (receivedStudentId === currentUserId) {
            toast.success(`You have been granted ${permissionType} permission!`);
            addNotification(`${permissionType} permission granted`, 'success');
          } else if (isInstructor || canModerate) {
            const student = participants.find(p => p.id?.toString() === receivedStudentId);
            toast.info(`${student?.name || 'Student'} was granted ${permissionType} permission`);
          }
        });

        socket.current.on('permission-revoked', ({ studentId, permissionType, revokedBy, allPermissions }) => {
          const currentUserId = (currentUser?.id || currentUser?._id)?.toString();
          const receivedStudentId = studentId?.toString();
          
          console.log('"¡ Permission revoked event received:', { 
            receivedStudentId, 
            permissionType, 
            revokedBy,
            currentUserId,
            allPermissions 
          });
          
          // Update permissions state
          setStudentPermissions(prev => {
            if (allPermissions) {
              return { ...allPermissions };
            } else {
              return {
                ...prev,
                [receivedStudentId]: {
                  ...prev[receivedStudentId],
                  [permissionType]: false
                }
              };
            }
          });

          if (receivedStudentId === currentUserId) {
            toast.warning(`Your ${permissionType} permission has been revoked`);
            addNotification(`${permissionType} permission revoked`, 'warning');
            
            // Force disable the media if it's currently enabled
            if (permissionType === 'camera' && cameraEnabled) {
              toggleCamera();
            } else if (permissionType === 'mic' && micEnabled) {
              toggleMicrophone();
            }
          } else if (isInstructor || canModerate) {
            const student = participants.find(p => p.id?.toString() === receivedStudentId);
            toast.info(`${student?.name || 'Student'}'s ${permissionType} permission was revoked`);
          }
        });

        // Direct permission control - no request system needed

        socket.current.on('question-asked', (question) => {
          setQuestions(prev => [...prev, {
            ...question,
            timestamp: new Date(question.timestamp)
          }]);
          if (isTeacher) {
            toast.info(`New question from ${question.askedBy}`);
          }
        });

        socket.current.on('screen-share-started', ({ userId, userName }) => {
          if (userId !== (user?.id || user?._id)) {
            toast.info(`${userName} started screen sharing`);
            setContentType('screen');
          }
        });

        socket.current.on('screen-share-stopped', ({ userId, userName }) => {
          if (userId !== (user?.id || user?._id)) {
            toast.info(`${userName} stopped screen sharing`);
            setContentType('video');
          }
        });

        // 5. Initialize WebRTC after Socket.IO connection with class permissions
        await initWebRTC(isCurrentUserInstructor, classData.allowStudentMic, classData.allowStudentCamera);
        
        // 6. Join the class room
        const joinData = {
          classId,
          userId: currentUser?.id || currentUser?._id,
          userRole: activeRole || 'student',
          name: currentUser?.name
        };
        
        console.log('🚪 Joining class with data:', joinData);
        socket.current.emit('joinClass', joinData, (response) => {
          console.log('🎯 JoinClass response:', response);
          if (response?.error) {
            console.error('âŒ Failed to join class:', response.error);
            toast.error(`Failed to join class: ${response.error}`);
            setConnectionState('error');
          } else if (response?.success) {
            // Initialize permissions from backend
            if (response.permissions) {
              console.log('" Received permissions from backend:', response.permissions);
              setStudentPermissions(response.permissions);
            }
            console.log('✅ Successfully joined class');
            toast.success('Joined class successfully!');
          }
        });
        
        // 7. Request current participants list
        setTimeout(() => {
          if (socket.current) {
            socket.current.emit('request-participants', { classId });
          }
        }, 1000);

        // 8. Add current user to participants if not already present
        const currentUserParticipant = {
          id: currentUser?.id || currentUser?._id,
          name: currentUser?.name,
          role: activeRole,
          isOnline: true,
          joinedAt: new Date()
        };
        
        setParticipants(prev => {
          const exists = prev.find(p => p.id === currentUserParticipant.id);
          if (!exists) {
            return [...prev, currentUserParticipant];
          }
          return prev.map(p => p.id === currentUserParticipant.id ? { ...p, isOnline: true } : p);
        });

      } catch (error) {
        console.error('Failed to initialize real-time class:', error);
        
        // More specific error handling
        if (error.response?.status === 404) {
          toast.error('Live class not found');
          setTimeout(() => navigate('/student/live-classes'), 2000);
        } else if (error.response?.status === 403) {
          toast.error('You do not have permission to join this class');
          setTimeout(() => navigate('/student/live-classes'), 2000);
        } else {
          toast.error('Failed to connect to live class. Please try again.');
        }
        
        setConnectionState('failed');
      } finally {
        setLoading(false);
      }
    };

    const initWebRTC = async (isCurrentUserInstructor, allowStudentMic, allowStudentCamera) => {
      try {
        console.log('š€ Initializing WebRTC for scalable live class...');
        console.log('"Š Parameters received:', {
          isCurrentUserInstructor,
          allowStudentMic,
          allowStudentCamera,
          activeRole,
          currentUser: currentUser?.name || currentUser?.username,
          classId
        });
        setLoading(true);
        
        // Get JWT token for authentication
        const token = localStorage.getItem('token');
        
        // Create WebRTC manager instance
        webrtcManager.current = new ScalableWebRTCManager();
        
        // CRITICAL: Setup callbacks BEFORE connecting - required for consuming existing producers
        webrtcManager.current.onRemoteStream = (peerId, stream, kind) => {
          console.log('🎥 DEBUG: REMOTE STREAM CALLBACK TRIGGERED');
          console.log('📺 Received remote stream:', { peerId, kind, hasStream: !!stream, streamId: stream?.id });
          console.log('🎥 Stream details:', {
            active: stream?.active,
            id: stream?.id,
            tracks: stream?.getTracks()?.length,
            videoTracks: stream?.getVideoTracks()?.length,
            audioTracks: stream?.getAudioTracks()?.length
          });
          
          // BROWSER: Log video tag assignment for debugging
          console.log('🖥️ BROWSER DEBUG: About to assign stream to video element');
          console.log('🖥️ Current video.srcObject before assignment:', localVideoRef.current?.srcObject);
          console.log('📺 Current participants:', participantsRef.current?.map(p => ({ id: p.id, name: p.name })) || []);
          
          // CRITICAL DEBUG: Check participant matching
          const peerIdStr = String(peerId);
          const currentParticipants = participantsRef.current || [];
          console.log('🔍 PARTICIPANT MATCHING DEBUG:', {
            peerIdStr,
            participantCount: currentParticipants.length,
            participantIds: currentParticipants.map(p => String(p.id)),
            participantDetails: currentParticipants.map(p => ({ id: String(p.id), name: p.name, role: p.role }))
          });
          
          if (stream && peerId) {
            // Update participant with stream (convert IDs to strings for comparison)
            setParticipants(prev => {
              const peerIdStr = String(peerId);
              
              // Check if participant exists
              const existingParticipant = prev.find(p => String(p.id) === peerIdStr);
              
              if (!existingParticipant) {
                console.warn(`⚠️ Participant ${peerIdStr} not found in participants list, creating temporary participant`);
                console.log('🔍 Available participants:', prev.map(p => ({ id: String(p.id), name: p.name })));
                
                // Create temporary participant for the stream
                const tempParticipant = {
                  id: peerId,
                  name: `User ${peerIdStr.slice(-4)}`, // Use last 4 digits for display
                  role: 'unknown',
                  stream: stream,
                  hasVideo: kind === 'video',
                  hasAudio: kind === 'audio',
                  isTemporary: true
                };
                
                console.log('✅ Created temporary participant for stream:', tempParticipant);
                return [...prev, tempParticipant];
              }
              
              // Update existing participant
              const updated = prev.map(p => {
                const participantIdStr = String(p.id);
                if (participantIdStr === peerIdStr) {
                  console.log(`✅ Attaching ${kind} stream to participant ${p.name}`);
                  // Combine multiple streams from same peer
                  const existingStream = p.stream;
                  let combinedStream;
                  
                  if (existingStream && kind === 'audio') {
                    // Add audio track to existing video stream
                    combinedStream = existingStream;
                    stream.getAudioTracks().forEach(track => {
                      combinedStream.addTrack(track);
                    });
                  } else if (existingStream && kind === 'video') {
                    // Add video track to existing audio stream  
                    combinedStream = existingStream;
                    stream.getVideoTracks().forEach(track => {
                      combinedStream.addTrack(track);
                    });
                  } else {
                    // New stream
                    combinedStream = stream;
                  }
                  
                  return { 
                    ...p, 
                    stream: combinedStream, 
                    hasVideo: kind === 'video' || p.hasVideo || combinedStream.getVideoTracks().length > 0, 
                    hasAudio: kind === 'audio' || p.hasAudio || combinedStream.getAudioTracks().length > 0
                  };
                }
                return p;
              });
              console.log('📺 Updated participants:', updated.map(p => ({ id: p.id, name: p.name, hasStream: !!p.stream, hasVideo: p.hasVideo, hasAudio: p.hasAudio })));
              return updated;
            });
            
            // Notify user about incoming stream using current participants
            const peerIdStr = String(peerId);
            const participant = participantsRef.current.find(p => String(p.id) === peerIdStr);
            if (participant) {
              const roleEmoji = participant.role === 'teacher' ? '👨‍🏫' : '👨‍💼';
              toast.success(`${roleEmoji} Receiving ${participant.name}'s ${kind} stream`);
            } else {
              toast.success(`📹 Receiving ${kind} stream from peer ${peerId}`);
            }
          } else {
            // Stream closed
            console.log('📺 Stream closed for peer:', peerId);
            const peerIdStr = String(peerId);
            setParticipants(prev => prev.map(p => {
              if (String(p.id) === peerIdStr) {
                return { ...p, stream: null, hasVideo: false, hasAudio: false };
              }
              return p;
            }));
          }
        };

        webrtcManager.current.onLocalStream = (stream) => {
          console.log('📹 Local stream ready:', { hasStream: !!stream });
          setLocalStream(stream);
        };

        webrtcManager.current.onUserJoined = (userData) => {
          console.log('👤 User joined via WebRTC:', userData);
          setParticipants(prev => {
            const exists = prev.find(p => p.id === userData.userId);
            if (!exists) {
              return [...prev, { 
                id: userData.userId, 
                name: userData.userName || 'User',
                role: userData.userRole,
                isOnline: true,
                joinedAt: new Date()
              }];
            }
            return prev;
          });
        };

        webrtcManager.current.onUserLeft = (userData) => {
          console.log('👋 User left via WebRTC:', userData);
          setParticipants(prev => prev.map(p => 
            p.id === userData.userId ? { ...p, isOnline: false, stream: null } : p
          ));
        };
        
        console.log('Connection parameters:', {
          serverUrl: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000',
          classId,
          userId: currentUser?.id || currentUser?._id,
          userName: currentUser?.name || currentUser?.username,
          userRole: activeRole
        });
        
        // CRITICAL FIX: Call connect() method to establish full WebRTC connection
        // This handles: Socket.IO connection, joinClass, device loading, transport creation
        await webrtcManager.current.connect({
          serverUrl: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000',
          classId: classId,
          userId: currentUser?.id || currentUser?._id,
          userName: currentUser?.name || currentUser?.username,
          userRole: activeRole,
          token: token
        });
        
        console.log('WebRTC Manager connected successfully:', {
          isConnected: webrtcManager.current.isConnected,
          hasTransports: !!(webrtcManager.current.sendTransport && webrtcManager.current.recvTransport),
          _joinedClass: webrtcManager.current._joinedClass
        });
        
        // Get the local stream that was initialized during connect()
        const stream = webrtcManager.current.localStream;
        console.log('🎥 Local stream obtained from WebRTC manager:', !!stream);
        
        if (stream) {
          console.log('🎥 Media stream details:', {
            video: stream.getVideoTracks().length > 0,
            audio: stream.getAudioTracks().length > 0,
            userRole: activeRole
          });
          
          // Connect to local video element
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.muted = true; // Prevent feedback
            try {
              await localVideoRef.current.play();
              console.log('✅ Local video playing');
            } catch (playError) {
              console.log('⚠️ Video autoplay blocked, user interaction required');
            }
          }
          
          // Set initial media states based on permissions
          let initialVideoEnabled = false;
          let initialAudioEnabled = false;
          
          if (isCurrentUserInstructor) {
            // Instructors start with media enabled
            initialVideoEnabled = stream.getVideoTracks().length > 0;
            initialAudioEnabled = stream.getAudioTracks().length > 0;
          } else {
            // Students start with media based on class permissions
            initialVideoEnabled = allowStudentCamera && stream.getVideoTracks().length > 0;
            initialAudioEnabled = allowStudentMic && stream.getAudioTracks().length > 0;
          }
          
          // Apply initial states to WebRTC manager
          if (!initialVideoEnabled && stream.getVideoTracks().length > 0) {
            stream.getVideoTracks()[0].enabled = false;
          }
          if (!initialAudioEnabled && stream.getAudioTracks().length > 0) {
            stream.getAudioTracks()[0].enabled = false;
          }
          
          setCameraEnabled(initialVideoEnabled);
          setMicEnabled(initialAudioEnabled);
          setLocalStream(stream);
          
          console.log('🎯 Media controls initialized:', { 
            initialVideoEnabled, 
            initialAudioEnabled, 
            role: activeRole,
            isInstructor: isCurrentUserInstructor,
            allowStudentMic,
            allowStudentCamera
          });
        }

        // Callbacks already set up before connect() call

        // WebRTC is already fully initialized through connect() method above
        // No need for duplicate mediasoup setup - connect() handles everything
        console.log('✅ WebRTC initialization completed via connect() method');
        
        console.log('✅ WebRTC initialized successfully');
        toast.success('Media ready for live class!');
        
        // Expose for debugging
        window.webrtcManager = webrtcManager.current;
        window.classId = classId;
        window.participants = participants;
        
        // Add debug functions
        window.debugVideoStreaming = {
          checkStatus: () => {
            const manager = webrtcManager.current;
            console.log('🔍 WebRTC Status:', {
              webrtcManager: !!manager,
              socket: manager?.socket ? manager.socket.connected : false,
              device: manager?.device ? manager.device.loaded : false,
              sendTransport: !!manager?.sendTransport,
              recvTransport: !!manager?.recvTransport,
              producers: Array.from(manager?.producers?.entries() || []),
              consumers: Array.from(manager?.consumers?.entries() || []),
              producerToPeer: Array.from(manager?.producerToPeer?.entries() || [])
            });
          },
          forceConsumeExisting: async () => {
            const manager = webrtcManager.current;
            if (!manager?.socket) {
              console.error('❌ No WebRTC socket available');
              return;
            }
            manager.socket.emit('requestExistingProducers', { classId }, async (response) => {
              console.log('🎯 Manual existing producers request:', response);
              if (response?.existingProducers) {
                for (const producer of response.existingProducers) {
                  try {
                    console.log('🔥 Manually consuming:', producer);
                    await webrtcManager.current.consume(producer.producerId);
                  } catch (error) {
                    console.error('❌ Manual consume failed:', producer.producerId, error);
                  }
                }
              }
            });
          }
        };
        
      } catch (error) {
        console.error('âŒ WebRTC initialization failed:', error);
        toast.error(`Media access failed: ${error.message}. You can still participate in chat.`);
      } finally {
        setLoading(false);
      }
    };

    if (classId && user) {
      initializeRealTimeClass();
    } else if (!classId) {
      console.warn('âš ï¸ No classId provided, redirecting to class list...');
      setTimeout(() => navigate('/student/live-classes'), 100);
    }

    return () => {
      if (socket.current) {
        socket.current.emit('leaveClass', { classId, userId: user?.id || user?._id });
        socket.current.disconnect();
      }
      if (webrtcManager.current) {
        webrtcManager.current.disconnect();
      }
    };
  }, [classId, user, isTeacher]);

  // Media Control Functions
  const toggleMicrophone = async () => {
    try {
      const newEnabled = !micEnabled;
      console.log(`✅ Toggling microphone: ${micEnabled} -> ${newEnabled}`);
      console.log('🎤 WebRTC Manager available:', !!webrtcManager.current);
      console.log('🎤 Current user role:', activeRole);
      
      // Use the canUseMedia function for consistent permission checking
      if (!canUseMedia('mic')) {
        addNotification('Microphone access not permitted. Ask teacher for permission.', 'warning');
        toast.warning('Ž¤ Microphone access not permitted. Ask teacher for permission.');
        return;
      }
      
      // Always update the state first for immediate UI feedback
      setMicEnabled(newEnabled);
      
      if (webrtcManager.current) {
        try {
          const success = await webrtcManager.current.toggleMicrophone();
          console.log('Ž¤ Toggle microphone result:', success);
          
          if (success === false) {
            // Revert state if WebRTC failed
            setMicEnabled(micEnabled);
            addNotification('Failed to toggle microphone', 'error');
            toast.error('Ž¤ Failed to toggle microphone');
            return;
          }
        } catch (webrtcError) {
          console.warn('Ž¤ WebRTC microphone toggle failed, but continuing with state update:', webrtcError);
          // Don't revert state - allow UI-only toggle for now
        }
      } else {
        console.log('Ž¤ WebRTC not initialized, using UI-only toggle');
        // Allow UI-only toggle when WebRTC is not available
      }
      
      // Always emit state change to other participants
      if (socket.current) {
        socket.current.emit('media-state-changed', { 
          userId: currentUser?.id || currentUser?._id,
          micEnabled: newEnabled,
          cameraEnabled: cameraEnabled,
          classId 
        });
      }
      
      addNotification(`🎤 Microphone ${newEnabled ? 'enabled' : 'disabled'}`, 'success');
      toast.success(`🎤 Microphone ${newEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('âŒ Microphone toggle failed:', error);
      addNotification(`Microphone toggle failed: ${error.message}`, 'error');
      toast.error(`Microphone toggle failed: ${error.message}`);
    }
  };

  const toggleCamera = async () => {
    try {
      const newEnabled = !cameraEnabled;
      console.log(`"¹ Toggling camera: ${cameraEnabled} -> ${newEnabled}`);
      console.log('"¹ WebRTC Manager available:', !!webrtcManager.current);
      console.log('"¹ Current user role:', activeRole);
      
      // Use the canUseMedia function for consistent permission checking
      if (!canUseMedia('camera')) {
        addNotification('Camera access not permitted. Ask teacher for permission.', 'warning');
        toast.warning('"¹ Camera access not permitted. Ask teacher for permission.');
        return;
      }
      
      if (webrtcManager.current && webrtcManager.current.localStream) {
        try {
          // Get current stream and video track
          const stream = webrtcManager.current.localStream;
          const videoTrack = stream.getVideoTracks()[0];
          
          if (videoTrack) {
            // Toggle the video track state
            videoTrack.enabled = newEnabled;
            webrtcManager.current.cameraEnabled = newEnabled;
            
            console.log('📹 Video track enabled set to:', videoTrack.enabled);
            
            if (newEnabled) {
              // Enabling camera - ensure local video element shows the stream
              if (localVideoRef.current) {
                // Set the stream if not already set
                if (localVideoRef.current.srcObject !== stream) {
                  localVideoRef.current.srcObject = stream;
                  localVideoRef.current.muted = true; // Prevent audio feedback
                }
                
                try {
                  await localVideoRef.current.play();
                  console.log('✅ Local video playing successfully');
                  toast.success('📹 Camera turned on - you can see yourself!');
                } catch (playError) {
                  console.warn('⚠️ Auto-play blocked, trying manual play:', playError);
                  // User interaction might be required
                  setTimeout(() => {
                    if (localVideoRef.current) {
                      localVideoRef.current.play().catch(e => 
                        console.warn('⚠️ Manual play failed:', e)
                      );
                    }
                  }, 100);
                  toast.info('📹 Camera ready - click video area to start');
                }
                
                // Update local stream state to trigger re-renders
                setLocalStream(stream);
              }
              
              // If using mediasoup, produce the video track
              if (webrtcManager.current.sendTransport && webrtcManager.current.produceTrack) {
                try {
                  await webrtcManager.current.produceTrack('video', videoTrack);
                  console.log('✅ Video track produced to mediasoup server');
                  
                  // Update local stream reference if track was refreshed
                  const updatedStream = webrtcManager.current.localStream;
                  if (updatedStream && updatedStream !== stream) {
                    console.log('🔄 Local stream was updated during track production, refreshing UI');
                    setLocalStream(updatedStream);
                    if (localVideoRef.current) {
                      localVideoRef.current.srcObject = updatedStream;
                    }
                  }
                } catch (produceError) {
                  console.warn('⚠️ Failed to produce video track:', produceError);
                  // Try to re-establish connection if produce failed
                  try {
                    console.log('[VIDEO] Re-establishing local video stream connection');
                    const freshStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                    const freshVideoTrack = freshStream.getVideoTracks()[0];
                    
                    if (freshVideoTrack) {
                      // Replace track in WebRTC manager's local stream
                      if (webrtcManager.current.localStream) {
                        const oldVideoTracks = webrtcManager.current.localStream.getVideoTracks();
                        oldVideoTracks.forEach(track => {
                          webrtcManager.current.localStream.removeTrack(track);
                          track.stop();
                        });
                        webrtcManager.current.localStream.addTrack(freshVideoTrack);
                      }
                      
                      // Try producing again with fresh track
                      await webrtcManager.current.produceTrack('video', freshVideoTrack);
                      console.log('[SUCCESS] Local video stream re-established and produced');
                      
                      // Update UI
                      setLocalStream(webrtcManager.current.localStream);
                      if (localVideoRef.current) {
                        localVideoRef.current.srcObject = webrtcManager.current.localStream;
                      }
                    }
                  } catch (recoveryError) {
                    console.error('[ERROR] Failed to recover video stream:', recoveryError);
                    toast.error('Failed to enable camera');
                    setCameraEnabled(false);
                    return;
                  }
                }
              }
              
            } else {
              // Disabling camera - just disable the track
              console.log('📹 Camera disabled');
              toast.info('📹 Camera turned off');
              
              // Pause any existing producer
              const videoProducer = webrtcManager.current.producers?.get('video');
              if (videoProducer) {
                try {
                  await videoProducer.pause();
                  console.log('📹 Video producer paused');
                } catch (pauseError) {
                  console.warn('⚠️ Failed to pause video producer:', pauseError);
                }
              }
            }
            
            // Update UI state
            setCameraEnabled(newEnabled);
          } else {
            console.warn('⚠️ No video track available');
            toast.warning('No camera access available');
            setCameraEnabled(false);
          }
        } catch (webrtcError) {
          console.warn('⚠️ WebRTC camera toggle failed:', webrtcError);
          // Update state anyway for UI consistency
          setCameraEnabled(newEnabled);
        }
      } else {
        console.log('📹 WebRTC not initialized or no local stream, using UI-only toggle');
        // Update state for UI-only toggle
        setCameraEnabled(newEnabled);
      }
      
      // Always emit state change to other participants
      if (socket.current) {
        socket.current.emit('media-state-changed', { 
          userId: currentUser?.id || currentUser?._id,
          micEnabled: micEnabled,
          cameraEnabled: newEnabled,
          classId 
        });
      }
      
      addNotification(`📹 Camera ${newEnabled ? 'enabled' : 'disabled'}`, 'success');
      toast.success(`📹 Camera ${newEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('âŒ Camera toggle failed:', error);
      addNotification(`Camera toggle failed: ${error.message}`, 'error');
      toast.error(`Camera toggle failed: ${error.message}`);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        await webrtcManager.current.stopScreenShare();
        setIsScreenSharing(false);
        setContentType('video');
        addNotification('Screen sharing stopped', 'info');
      } else {
        await webrtcManager.current.startScreenShare();
        setIsScreenSharing(true);
        setContentType('screen');
        addNotification('Screen sharing started', 'info');
      }
    } catch (error) {
      addNotification('Failed to toggle screen share', 'error');
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    addNotification(isRecording ? 'Recording stopped' : 'Recording started', 'success');
  };



  // Communication Functions with Real Socket.IO
  const sendMessage = () => {
    if (chatInput.trim() && socket.current) {
      const message = {
        classId,
        text: chatInput.trim(),
        recipient: 'all'  // Send to everyone by default
      };
      
      console.log('💬 Sending chat message:', message);
      socket.current.emit('chatMessage', message);
      setChatInput('');
    }
  };

  const sendQuestion = () => {
    if (questionInput.trim() && socket.current) {
      const question = {
        classId,
        question: questionInput.trim(),
        askedBy: user?.name || 'Anonymous',
        askedById: user?.id || user?._id,
        timestamp: new Date().toISOString()
      };
      socket.current.emit('ask-question', question);
      setQuestionInput('');
      toast.success('Question sent to teacher!');
    }
  };

  // Materials Panel Functions
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(
          '/api/live-classes/${classId}/upload-file',
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              console.log(`Upload progress: ${progress}%`);
            }
          }
        );

        if (response.data.success) {
          setClassFiles(prev => [...prev, response.data.file]);
          toast.success(`${file.name} uploaded successfully`);
          
          // Emit to other participants
          if (socket.current) {
            socket.current.emit('file-uploaded', {
              classId,
              file: response.data.file,
              uploader: currentUser?.name
            });
          }
        }
      }
    } catch (error) {
      console.error('File upload failed:', error);
      toast.error('File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileDownload = (file) => {
    // Create download link
    const link = document.createElement('a');
    link.href = file.path || file.url;
    link.download = file.name;
    link.click();
  };

  const handleDeleteFile = async (fileId) => {
    if (!canModerate) return;
    
    try {
      await axios.delete('/api/live-classes/${classId}/files/${fileId}');
      setClassFiles(prev => prev.filter(f => f.id !== fileId));
      toast.success('File deleted');
    } catch (error) {
      console.error('Delete file failed:', error);
      toast.error('Failed to delete file');
    }
  };

  const createQuickPoll = () => {
    const question = prompt('Enter poll question:');
    if (!question) return;
    
    const options = [];
    for (let i = 1; i <= 4; i++) {
      const option = prompt('Enter option ${i} (or leave blank if done):');
      if (!option) break;
      options.push(option);
    }
    
    if (options.length < 2) {
      toast.error('Poll needs at least 2 options');
      return;
    }
    
    const poll = {
      id: Date.now(),
      question,
      options: options.map(opt => ({ text: opt, votes: 0 })),
      isActive: true,
      responses: [],
      createdAt: new Date()
    };
    
    setActivePolls(prev => [...prev, poll]);
    
    // Emit to participants
    if (socket.current) {
      socket.current.emit('poll-created', {
        classId,
        poll,
        creator: currentUser?.name
      });
    }
    
    toast.success('Poll created!');
  };

  const handlePollResponse = async (pollId, optionIndex) => {
    try {
      const response = await axios.post(
        '/api/live-classes/${classId}/polls/${pollId}/respond',
        { optionIndex }
      );
      
      if (response.data.success) {
        // Update local poll state
        setActivePolls(prev => prev.map(poll => {
          if (poll.id === pollId) {
            return {
              ...poll,
              userResponse: optionIndex,
              options: poll.options.map((opt, idx) => 
                idx === optionIndex ? { ...opt, votes: opt.votes + 1 } : opt
              )
            };
          }
          return poll;
        }));
        
        toast.success('Response recorded!');
      }
    } catch (error) {
      console.error('Poll response failed:', error);
      toast.error('Failed to record response');
    }
  };

  const toggleHandRaise = () => {
    const newState = !handRaised;
    setHandRaised(newState);
    if (socket.current) {
      socket.current.emit('raise-hand', {
        classId,
        userId: user?.id || user?._id,
        userName: user?.name,
        raised: newState
      });
    }
  };

  const toggleRightPanelCollapse = () => {
    setRightPanelCollapsed(!rightPanelCollapsed);
  };

  // Moderation Functions (Multi-Role Support)
  const handleDeleteMessage = (messageId) => {
    if (canModerate && socket.current) {
      socket.current.emit('delete-message', {
        classId,
        messageId,
        moderatorId: currentUser?.id || currentUser?._id,
        moderatorRole: activeRole
      });
      
      // Optimistically remove from local state
      setChatMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast.success('Message deleted');
    }
  };

  const handleMuteParticipant = (participantId) => {
    if (canModerate && socket.current) {
      socket.current.emit('mute-participant', {
        classId,
        participantId,
        moderatorId: currentUser?.id || currentUser?._id,
        moderatorRole: activeRole
      });
      toast.success('Participant muted');
    }
  };

  const handleKickParticipant = (participantId) => {
    if (hasFullAccess && socket.current) {
      socket.current.emit('kick-participant', {
        classId,
        participantId,
        moderatorId: currentUser?.id || currentUser?._id,
        moderatorRole: activeRole
      });
      toast.success('Participant removed');
    }
  };



  // Exit Function
  const handleExit = () => {
    const confirmExit = window.confirm('Are you sure you want to leave the live class?');
    if (confirmExit) {
      if (webrtcManager.current) {
        webrtcManager.current.disconnect();
      }
      navigate('/teacher/live-classes');
    }
  };

  // Render Video Content based on SGT LMS design
  const renderVideoContent = () => {
    if (contentType === 'whiteboard') {
      return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Minimal Whiteboard Component */}
          <AdvancedWhiteboard
            socket={socket.current}
            user={user || contextUser}
            classId={classId}
            isTeacher={isTeacher}
            onStateChange={(change) => {
              console.log('Whiteboard state change:', change);
            }}
            initialData={null}
          />
        </Box>
      );
    }

    // Pinned Video Layout
    if (videoLayout === 'pinned' && pinnedVideo) {
      return (
        <VideoContainer>
          {/* Main Pinned Video */}
          <Box sx={{ 
            height: '100%', 
            width: '100%',
            position: 'relative',
            backgroundColor: '#1e293b',
            border: '3px solid #ffc107',
            borderRadius: 2
          }}>
            {pinnedVideo.isLocal && cameraEnabled ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted={true}
                onClick={async (e) => {
                  // Manual play if autoplay was blocked
                  try {
                    await e.target.play();
                    console.log('✅ Manual pinned video play successful');
                  } catch (err) {
                    console.warn('⚠️ Manual pinned video play failed:', err);
                  }
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              />
            ) : (() => {
              // Find participant stream for pinned user
              const pinnedParticipant = participants.find(p => p.id === pinnedVideo.userId);
              if (pinnedParticipant && pinnedParticipant.stream) {
                return (
                  <video
                    autoPlay
                    playsInline
                    ref={(el) => {
                      if (el && pinnedParticipant.stream) {
                        console.log('🔥 BROWSER DEBUG: Assigning stream to pinned video element');
                        console.log('🖥️ Video element details:', {
                          hasElement: !!el,
                          hasStream: !!pinnedParticipant.stream,
                          streamActive: pinnedParticipant.stream?.active,
                          streamId: pinnedParticipant.stream?.id,
                          participantName: pinnedParticipant.name
                        });
                        el.srcObject = pinnedParticipant.stream;
                        console.log('🖥️ video.srcObject assigned:', el.srcObject);
                        el.play().then(() => {
                          console.log('✅ BROWSER DEBUG: Pinned video playing successfully');
                        }).catch((err) => {
                          console.error('❌ BROWSER DEBUG: Pinned video play failed:', err);
                        });
                      }
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                );
              }
              return null;
            })() || (
              // Enhanced placeholder for video
              <Box sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: pinnedVideo.isLocal 
                  ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '8px'
              }}>
                <Avatar sx={{ 
                  width: 200, 
                  height: 200, 
                  fontSize: '4rem',
                  mb: 3,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  border: '4px solid rgba(255,255,255,0.3)'
                }}>
                  {pinnedVideo.name[0]}
                </Avatar>
                <Typography variant='h4' gutterBottom fontWeight='bold'>
                  {pinnedVideo.name}
                </Typography>
                <Typography variant='h6' sx={{ opacity: 0.9, mb: 1 }}>
                  "¹ {pinnedVideo.isLocal ? 'Camera Off' : 'Video Focus View'}
                </Typography>
                {pinnedVideo.isLocal && (
                  <Button 
                    variant='contained' 
                    color='warning'
                    startIcon={<Videocam />}
                    onClick={toggleCamera}
                    sx={{ mt: 2 }}
                  >
                    Turn On Camera
                  </Button>
                )}
              </Box>
            )}
            
            {/* Pinned Video Info */}
            <Box sx={{ 
              position: 'absolute', 
              bottom: 16, 
              left: 16,
              backgroundColor: 'rgba(0,0,0,0.8)',
              borderRadius: 1,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <PushPin sx={{ color: 'gold', fontSize: 16 }} />
              <Typography variant='caption' color='white'>
                {pinnedVideo.name} {pinnedVideo.isLocal && '(You)'}
              </Typography>
            </Box>
            
            {/* Unpin Button */}
            <Box sx={{ 
              position: 'absolute', 
              top: 16, 
              right: 16 
            }}>
              <IconButton
                onClick={unpinVideo}
                sx={{
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' }
                }}
              >
                <Close />
              </IconButton>
            </Box>
            
            {/* Thumbnail Videos */}
            <Box sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              display: 'flex',
              gap: 1,
              flexDirection: 'column',
              maxHeight: 'calc(100% - 100px)',
              overflowY: 'auto'
            }}>
              {/* Local video thumbnail (if not pinned) */}
              {!pinnedVideo.isLocal && cameraEnabled && (
                <Box 
                  sx={{ 
                    width: 120, 
                    height: 90, 
                    borderRadius: 1, 
                    overflow: 'hidden',
                    border: '2px solid rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onClick={() => pinVideo(
                    currentUser?.id || currentUser?._id, 
                    currentUser?.name || 'You', 
                    localVideoRef.current, 
                    true
                  )}
                >
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted={true}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <Box sx={{
                    position: 'absolute',
                    bottom: 4,
                    left: 4,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    borderRadius: 0.5,
                    px: 0.5,
                    py: 0.25
                  }}>
                    <Typography variant='caption' color='white' fontSize={10}>
                      You
                    </Typography>
                  </Box>
                </Box>
              )}
              
              {/* Other participant thumbnails */}
              {participants
                .filter(p => p.id !== pinnedVideo.userId && p.isOnline && p.id !== (currentUser?.id || currentUser?._id))
                .slice(0, 4)
                .map((participant) => (
                <Box 
                  key={participant.id}
                  sx={{ 
                    width: 120, 
                    height: 90, 
                    borderRadius: 1, 
                    backgroundColor: '#374151',
                    overflow: 'hidden',
                    border: '2px solid rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onClick={() => {
                    pinVideo(participant.id, participant.name, null, false);
                  }}
                >
                  {participant.stream ? (
                    <video
                      ref={(el) => {
                        if (el && participant.stream) {
                          el.srcObject = participant.stream;
                        }
                      }}
                      autoPlay
                      playsInline
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <Box sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Avatar sx={{ width: 40, height: 40 }}>
                        {participant.name[0]}
                      </Avatar>
                    </Box>
                  )}
                  <Box sx={{
                    position: 'absolute',
                    bottom: 4,
                    left: 4,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    borderRadius: 0.5,
                    px: 0.5,
                    py: 0.25
                  }}>
                    <Typography variant='caption' color='white' fontSize={10}>
                      {participant.name}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </VideoContainer>
      );
    }

    // Multi-User Video Layout
    return (
      <VideoContainer>
        {isScreenSharing ? (
          // Screen Share View with video overlays
          <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
            {/* Main Screen Share Area */}
            <Box sx={{ 
              height: '100%', 
              width: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Box textAlign='center'>
                <Box sx={{ 
                  width: 128, 
                  height: 128, 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  borderRadius: 2, 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}>
                  <Typography variant='h2'>"Š</Typography>
                </Box>
                <Typography variant='h6'>Screen Sharing Active</Typography>
                <Typography variant='body2' sx={{ opacity: 0.8 }}>
                  Presenting slides...
                </Typography>
              </Box>
            </Box>
            
            {/* Video Overlays for Screen Share */}
            <Box sx={{ 
              position: 'absolute', 
              top: 16, 
              right: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}>
              {/* Your Video (Always shown) */}
              <Box sx={{ 
                width: 160, 
                height: 120,
                backgroundColor: '#1e293b',
                borderRadius: 1,
                border: '2px solid white',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer'
              }}
              onClick={() => pinVideo(
                currentUser?.id || currentUser?._id, 
                currentUser?.name || 'You', 
                localVideoRef.current, 
                true
              )}>
                {cameraEnabled ? (
                  <video
                    ref={(el) => {
                      localVideoRef.current = el;
                      if (el && localStream) {
                        console.log('🔥 BROWSER DEBUG: Assigning local stream to video element');
                        console.log('🖥️ Local video details:', {
                          hasElement: !!el,
                          hasLocalStream: !!localStream,
                          streamActive: localStream?.active,
                          streamId: localStream?.id,
                          trackCount: localStream?.getTracks()?.length
                        });
                        el.srcObject = localStream;
                        console.log('🖥️ Local video.srcObject assigned:', el.srcObject);
                      }
                    }}
                    autoPlay
                    playsInline
                    muted={true}
                    onClick={async (e) => {
                      // Manual play if autoplay was blocked
                      e.stopPropagation();
                      try {
                        await e.target.play();
                        console.log('✅ Manual video play successful');
                      } catch (err) {
                        console.warn('⚠️ Manual video play failed:', err);
                      }
                    }}
                    onLoadedMetadata={() => {
                      console.log('🔥 BROWSER DEBUG: Local video metadata loaded - video should be visible');
                      console.log('📹 Local video metadata loaded');
                    }}
                    onError={(e) => {
                      console.error('🔥 BROWSER DEBUG: Local video error - video will not display');
                      console.error('📹 Local video error:', e);
                    }}
                    onPlay={() => {
                      console.log('🔥 BROWSER DEBUG: Local video started playing');
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      cursor: 'pointer'
                    }}
                  />
                ) : (
                  <Box sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {(user?.name || 'U')[0]}
                    </Avatar>
                  </Box>
                )}
                
                  {/* Pin Icon */}
                  <Tooltip title={'Focus on your video'} placement='left'>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        pinVideo(
                          currentUser?.id || currentUser?._id, 
                          currentUser?.name || 'You', 
                          localVideoRef.current, 
                          true
                        );
                      }}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        backgroundColor: pinnedVideo?.isLocal 
                          ? 'rgba(255, 193, 7, 0.9)' 
                          : 'rgba(0,0,0,0.7)',
                        color: pinnedVideo?.isLocal 
                          ? '#000' 
                          : 'white',
                        width: 20,
                        height: 20,
                        '&:hover': { 
                          backgroundColor: pinnedVideo?.isLocal 
                            ? 'rgba(255, 193, 7, 1)' 
                            : 'rgba(0,0,0,0.8)',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                      size='small'
                    >
                      <PushPin sx={{ 
                        fontSize: 12,
                        transform: pinnedVideo?.isLocal 
                          ? 'rotate(45deg)' 
                          : 'rotate(0deg)',
                        transition: 'transform 0.2s ease-in-out'
                      }} />
                    </IconButton>
                  </Tooltip>                <Typography variant='caption' sx={{
                  position: 'absolute',
                  bottom: 4,
                  left: 4,
                  color: 'white',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  px: 0.5,
                  borderRadius: 0.5
                }}>
                  You
                </Typography>
              </Box>
              
              {/* Other participants' videos */}
              {participants.filter(p => p.id !== (currentUser?.id || currentUser?._id)).map((participant) => (
                <Box key={participant.id} sx={{ 
                  width: 160, 
                  height: 120,
                  backgroundColor: '#1e293b',
                  borderRadius: 1,
                  border: '2px solid white',
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  pinVideo(participant.id, participant.name, null, false);
                }}>
                  {participant.stream ? (
                    <video
                      ref={(el) => {
                        if (el && participant.stream) {
                          console.log('🔥 BROWSER DEBUG: Assigning remote stream to participant video');
                          console.log('🖥️ Remote video details:', {
                            participantName: participant.name,
                            participantId: participant.id,
                            hasElement: !!el,
                            hasStream: !!participant.stream,
                            streamActive: participant.stream?.active,
                            streamId: participant.stream?.id,
                            trackCount: participant.stream?.getTracks()?.length
                          });
                          el.srcObject = participant.stream;
                          console.log('🖥️ Remote video.srcObject assigned for', participant.name, ':', el.srcObject);
                        }
                      }}
                      autoPlay
                      playsInline
                      onLoadedMetadata={() => {
                        console.log('🔥 BROWSER DEBUG: Remote video metadata loaded for', participant.name);
                      }}
                      onError={(e) => {
                        console.error('🔥 BROWSER DEBUG: Remote video error for', participant.name, ':', e);
                      }}
                      onPlay={() => {
                        console.log('🔥 BROWSER DEBUG: Remote video started playing for', participant.name);
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <Box sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {(participant.name || 'P')[0]}
                      </Avatar>
                    </Box>
                  )}
                  
                  {/* Pin Icon */}
                  <Tooltip title={`Focus on ${participant.name}'s video`} placement='left'>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        pinVideo(participant.id, participant.name, null, false);
                      }}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        backgroundColor: pinnedVideo?.userId === participant.id 
                          ? 'rgba(255, 193, 7, 0.9)' 
                          : 'rgba(0,0,0,0.7)',
                        color: pinnedVideo?.userId === participant.id 
                          ? '#000' 
                          : 'white',
                        width: 20,
                        height: 20,
                        '&:hover': { 
                          backgroundColor: pinnedVideo?.userId === participant.id 
                            ? 'rgba(255, 193, 7, 1)' 
                            : 'rgba(0,0,0,0.8)',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                      size='small'
                    >
                      <PushPin sx={{ 
                        fontSize: 12,
                        transform: pinnedVideo?.userId === participant.id 
                          ? 'rotate(45deg)' 
                          : 'rotate(0deg)',
                        transition: 'transform 0.2s ease-in-out'
                      }} />
                    </IconButton>
                  </Tooltip>
                  
                  <Typography variant='caption' sx={{
                    position: 'absolute',
                    bottom: 4,
                    left: 4,
                    color: 'white',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    px: 0.5,
                    borderRadius: 0.5
                  }}>
                    {participant.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        ) : (
          // Regular Multi-User Video View
          <Box sx={{ 
            height: '100%', 
            width: '100%',
            display: 'flex',
            position: 'relative'
          }}>
            {/* Main Video Area */}
            <Box sx={{ 
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#1e293b',
              position: 'relative'
            }}>
              {/* Your Video Stream */}
              {cameraEnabled ? (
                <Box sx={{ 
                  position: 'relative', 
                  width: '100%', 
                  height: '100%',
                  border: isInstructor ? '3px solid #f59e0b' : '2px solid #3b82f6',
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted={true}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  
                  {/* Enhanced Video Label */}
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: 8, 
                    left: 8,
                    backgroundColor: isInstructor ? 'rgba(245, 158, 11, 0.9)' : 'rgba(59, 130, 246, 0.9)',
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Box sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 'success.main',
                      animation: 'pulse 2s infinite'
                    }} />
                    <Typography variant='caption' color='white' fontWeight='bold'>
                      {user?.name || (isInstructor ? 'Teacher' : 'Student')} (You)
                    </Typography>
                  </Box>
                  
                  {/* Enhanced Pin Button */}
                  <Tooltip title={pinnedVideo?.userId === (currentUser?.id || currentUser?._id) ? 'Unfocus video' : 'Focus on this video'} placement='left'>
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8 
                    }}>
                      <IconButton
                        onClick={() => {
                          if (pinnedVideo?.userId === (currentUser?.id || currentUser?._id)) {
                            unpinVideo();
                          } else {
                            pinVideo(
                              currentUser?.id || currentUser?._id, 
                              currentUser?.name || 'You', 
                              localVideoRef.current, 
                              true
                            );
                          }
                        }}
                        sx={{
                          backgroundColor: pinnedVideo?.userId === (currentUser?.id || currentUser?._id) 
                            ? 'rgba(255, 193, 7, 0.95)' 
                            : 'rgba(0,0,0,0.8)',
                          color: pinnedVideo?.userId === (currentUser?.id || currentUser?._id) 
                            ? '#000' 
                            : 'white',
                          '&:hover': { 
                            backgroundColor: pinnedVideo?.userId === (currentUser?.id || currentUser?._id) 
                              ? 'rgba(255, 193, 7, 1)' 
                              : 'rgba(0,0,0,0.9)',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.2s ease-in-out',
                          border: pinnedVideo?.userId === (currentUser?.id || currentUser?._id) 
                            ? '2px solid #ffc107' 
                            : '2px solid rgba(255,255,255,0.3)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                        }}
                        size='small'
                      >
                        <PushPin sx={{ 
                          transform: pinnedVideo?.userId === (currentUser?.id || currentUser?._id) 
                            ? 'rotate(45deg)' 
                            : 'rotate(0deg)',
                          transition: 'transform 0.2s ease-in-out',
                          fontSize: 18
                        }} />
                      </IconButton>
                    </Box>
                  </Tooltip>
                </Box>
              ) : (
                <Box sx={{
                  textAlign: 'center', 
                  color: 'white',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isInstructor 
                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                    : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  position: 'relative',
                  border: isInstructor ? '3px solid #f59e0b' : '2px solid #3b82f6',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                  <Avatar sx={{ 
                    width: 120, 
                    height: 120, 
                    mx: 'auto', 
                    mb: 2,
                    border: '4px solid rgba(255,255,255,0.4)',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    fontSize: '3rem'
                  }}>
                    {(user?.name || (isInstructor ? 'Teacher' : 'Student'))[0]}
                  </Avatar>
                  <Typography variant='h6' fontWeight='bold' gutterBottom>
                    {user?.name || (isInstructor ? 'Teacher' : 'Student')}
                  </Typography>
                  <Chip 
                    icon={<VideocamOff />}
                    label='Camera Off' 
                    sx={{ 
                      bgcolor: 'rgba(0,0,0,0.3)', 
                      color: 'white',
                      mb: 2
                    }} 
                  />
                  {canUseMedia('camera') && (
                    <Button 
                      variant='contained' 
                      color='warning'
                      startIcon={<Videocam />}
                      onClick={toggleCamera}
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                      }}
                    >
                      Turn On Camera
                    </Button>
                  )}
                  
                  {/* Pin Button for Camera Off State */}
                  <Tooltip title='Focus on this participant' placement='left'>
                    <IconButton
                      onClick={() => pinVideo(
                        currentUser?.id || currentUser?._id, 
                        currentUser?.name || 'You', 
                        null, 
                        true
                      )}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        '&:hover': { 
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                      size='small'
                    >
                      <PushPin sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>
            
            {/* Side Panel for Other Participants */}
            {participants.length > 1 && (
              <Box sx={{ 
                width: 200,
                backgroundColor: 'rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                p: 1,
                maxHeight: '100%',
                overflowY: 'auto'
              }}>
                {participants
                  .filter(p => p.id !== (currentUser?.id || currentUser?._id))
                  .map((participant) => (
                  <Box key={participant.id} sx={{ 
                    height: 150,
                    backgroundColor: '#1e293b',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    position: 'relative',
                    border: participant.role === 'teacher' ? '2px solid #f59e0b' : '1px solid #374151',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#374151'
                    }
                  }}
                  onClick={() => {
                    // Pin the participant's video
                    pinVideo(participant.id, participant.name, null, false);
                  }}>
                    {/* Participant video or placeholder */}
                    {participant.stream ? (
                      <video
                        ref={(el) => {
                          if (el && participant.stream) {
                            el.srcObject = participant.stream;
                          }
                        }}
                        autoPlay
                        playsInline
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          position: 'absolute',
                          top: 0,
                          left: 0
                        }}
                      />
                    ) : (
                      <Box textAlign='center'>
                        <Avatar sx={{ 
                          width: 40, 
                          height: 40, 
                          mx: 'auto', 
                          mb: 1,
                          bgcolor: participant.role === 'teacher' ? 'warning.main' : 'primary.main'
                        }}>
                          <Typography variant='h6'>
                            {(participant.name || 'P')[0]}
                          </Typography>
                        </Avatar>
                        <Typography variant='caption' display='block'>
                          {participant.name}
                        </Typography>
                        <Typography variant='caption' display='block' sx={{ opacity: 0.7 }}>
                          {participant.role}
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Pin Button */}
                    <Tooltip title={`Focus on ${participant.name}'s video`} placement='right'>
                      <Box sx={{ 
                        position: 'absolute', 
                        top: 4, 
                        left: 4 
                      }}>
                        <IconButton
                          size='small'
                          onClick={(e) => {
                            e.stopPropagation();
                            // In a real WebRTC implementation, you'd have proper video refs
                            toast.info(`Pin ${participant.name}'s video (WebRTC integration needed)`);
                          }}
                          sx={{
                            backgroundColor: pinnedVideo?.userId === participant.id 
                              ? 'rgba(255, 193, 7, 0.9)' 
                              : 'rgba(0,0,0,0.7)',
                            color: pinnedVideo?.userId === participant.id 
                              ? '#000' 
                              : 'white',
                            width: 20,
                            height: 20,
                            '&:hover': { 
                              backgroundColor: pinnedVideo?.userId === participant.id 
                                ? 'rgba(255, 193, 7, 1)' 
                                : 'rgba(0,0,0,0.8)',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease-in-out',
                            border: pinnedVideo?.userId === participant.id 
                              ? '1px solid #ffc107' 
                              : 'none'
                          }}
                        >
                          <PushPin sx={{ 
                            fontSize: 12,
                            transform: pinnedVideo?.userId === participant.id 
                              ? 'rotate(45deg)' 
                              : 'rotate(0deg)',
                            transition: 'transform 0.2s ease-in-out'
                          }} />
                        </IconButton>
                      </Box>
                    </Tooltip>
                    
                    {/* Status Indicator */}
                    <Box sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: participant.isOnline ? 'success.main' : 'grey.500'
                    }} />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
        
        {/* Status Indicators */}
        <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
          <Stack direction='row' spacing={1}>
            {isRecording && (
              <Chip
                icon={<Circle sx={{ fontSize: 12, color: 'red' }} />}
                label='RECORDING'
                size='small'
                sx={{ 
                  backgroundColor: 'rgba(220, 38, 38, 0.9)', 
                  color: 'white',
                  animation: 'pulse 2s infinite'
                }}
              />
            )}
            <Chip
              label={connectionState.toUpperCase()}
              size='small'
              color={connectionState === 'connected' ? 'success' : 'warning'}
              sx={{ backgroundColor: 'rgba(0,0,0,0.7)', color: 'white' }}
            />
            {/* Enhanced Pinned Video Indicator */}
            {pinnedVideo && videoLayout === 'pinned' && (
              <Tooltip title='Click to return to grid view' placement='bottom'>
                <Chip
                  icon={<PushPin sx={{ fontSize: 14, color: '#000' }} />}
                  label={`🎯 FOCUS: ${pinnedVideo.name}${pinnedVideo.isLocal ? ' (YOU)' : ''}`}
                  size='medium'
                  sx={{ 
                    backgroundColor: 'rgba(255, 193, 7, 0.95)', 
                    color: '#000',
                    fontWeight: 'bold',
                    border: '2px solid #ffc107',
                    animation: 'pinGlow 2s infinite',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 193, 7, 1)',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)'
                  }}
                  onClick={unpinVideo}
                  clickable
                />
              </Tooltip>
            )}
          </Stack>
        </Box>
        
        {/* Enhanced Layout Controls - Top Right */}
        <Box sx={{ position: 'absolute', top: 80, right: 20, zIndex: 1200 }}>
          <Stack direction='row' spacing={2} alignItems='flex-start'>
            {/* Quick Pin Menu for Teachers/Moderators */}
            {(isInstructor || canModerate) && participants.length > 1 && (
              <Tooltip title='Quick Pin Menu (Teachers)' placement='bottom'>
                <Paper sx={{ 
                  p: 1.5, 
                  backgroundColor: 'rgba(0,0,0,0.9)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 2,
                  minWidth: 240,
                  backdropFilter: 'blur(10px)'
                }}>
                  <Typography variant='caption' color='white' display='block' sx={{ mb: 1.5, opacity: 0.9, fontWeight: 'bold' }}>
                    📌 Quick Focus Control
                  </Typography>
                  <Stack direction='column' spacing={1}>
                    {participants
                      .filter(p => p.id !== (currentUser?.id || currentUser?._id))
                      .slice(0, 3)
                      .map((participant) => (
                      <Button
                        key={participant.id}
                        size='small'
                        fullWidth
                        variant={pinnedVideo?.userId === participant.id ? 'contained' : 'outlined'}
                        startIcon={participant.role === 'teacher' ? '' : ''}
                        onClick={() => {
                          if (pinnedVideo?.userId === participant.id) {
                            unpinVideo();
                          } else {
                            pinVideo(participant.id, participant.name, null, false);
                          }
                        }}
                        sx={{
                          justifyContent: 'flex-start',
                          fontSize: '0.75rem',
                          color: pinnedVideo?.userId === participant.id ? '#000' : 'white',
                          backgroundColor: pinnedVideo?.userId === participant.id ? '#ffc107' : 'transparent',
                          borderColor: participant.role === 'teacher' ? '#f59e0b' : 'rgba(255,255,255,0.4)',
                          '&:hover': {
                            backgroundColor: pinnedVideo?.userId === participant.id 
                              ? '#ffb300' 
                              : 'rgba(255,255,255,0.1)',
                            transform: 'translateY(-1px)'
                          },
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        {participant.name}
                      </Button>
                    ))}
                  </Stack>
                </Paper>
              </Tooltip>
            )}
            
            <Tooltip title={videoLayout === 'grid' ? 'Switch to Focus View' : 'Switch to Grid View'} placement='bottom'>
              <Box sx={{ position: 'relative' }}>
                <IconButton
                  onClick={toggleVideoLayout}
                  sx={{
                    backgroundColor: videoLayout === 'pinned' 
                      ? 'rgba(255, 193, 7, 0.95)' 
                      : 'rgba(0,0,0,0.9)',
                    color: videoLayout === 'pinned' ? '#000' : 'white',
                    width: 64,
                    height: 64,
                    '&:hover': { 
                      backgroundColor: videoLayout === 'pinned' 
                        ? 'rgba(255, 193, 7, 1)' 
                        : 'rgba(0,0,0,1)',
                      transform: 'scale(1.08)'
                    },
                    transition: 'all 0.2s ease-in-out',
                    border: videoLayout === 'pinned' 
                      ? '3px solid #ffc107' 
                      : '2px solid rgba(255,255,255,0.3)',
                    boxShadow: videoLayout === 'pinned'
                      ? '0 0 20px rgba(255, 193, 7, 0.4)'
                      : '0 6px 16px rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {videoLayout === 'grid' ? <AspectRatio sx={{ fontSize: 32 }} /> : <GridView sx={{ fontSize: 32 }} />}
                </IconButton>
                {pinnedVideo && (
                  <Box sx={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    backgroundColor: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white',
                    animation: 'pulse 2s infinite'
                  }}>
                    <PushPin sx={{ fontSize: 14, color: 'white' }} />
                  </Box>
                )}
              </Box>
            </Tooltip>
            
            {/* Debug Info Button */}
            <IconButton
              onClick={() => {
                console.log('" DEBUG INFO:', {
                  currentUser: { 
                    id: currentUser?.id, 
                    _id: currentUser?._id, 
                    name: currentUser?.name 
                  },
                  permissions: {
                    studentPermissions,
                    hasIndividualMicPermission: hasIndividualPermission('mic'),
                    hasIndividualCameraPermission: hasIndividualPermission('camera'),
                    canUseMic: canUseMedia('mic'),
                    canUseCamera: canUseMedia('camera')
                  },
                  mediaState: {
                    micEnabled,
                    cameraEnabled,
                    webrtcManagerExists: !!webrtcManager.current
                  },
                  participants: participants.map(p => ({ id: p.id, name: p.name, role: p.role })),
                  roles: {
                    isInstructor,
                    canModerate,
                    activeRole
                  },
                  pinnedVideo: pinnedVideo ? {
                    userId: pinnedVideo.userId,
                    name: pinnedVideo.name,
                    isLocal: pinnedVideo.isLocal,
                    hasVideoRef: !!pinnedVideo.videoRef
                  } : null
                });
                
                toast.info('Debug info logged to console - check media controls');
              }}
              sx={{
                backgroundColor: 'rgba(255,165,0,0.7)',
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(255,165,0,0.8)' }
              }}
              title='Debug Permission State'
            >
              ›
            </IconButton>
            
            {/* Test Grant Permission Button (for teachers only) */}
            {(isInstructor || canModerate) && (
              <IconButton
                onClick={() => {
                  const students = participants.filter(p => p.role === 'student' && p.id !== (currentUser?.id || currentUser?._id));
                  if (students.length > 0) {
                    const student = students[0];
                    grantStudentPermission(student.id, 'mic');
                    grantStudentPermission(student.id, 'camera');
                    toast.success(`Granted all permissions to ${student.name}`);
                  } else {
                    toast.info('No students found to grant permissions to');
                  }
                }}
                sx={{
                  backgroundColor: 'rgba(76,175,80,0.7)',
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(76,175,80,0.8)' }
                }}
                title='Grant All Permissions to First Student'
              >
                Ž
              </IconButton>
            )}
          </Stack>
        </Box>
      </VideoContainer>
    );
  };

  // Render Participants Panel
  const renderParticipantsPanel = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant='h6' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <People fontSize='small' />
            Students ({participants.length - 1})
          </Typography>
          <IconButton 
            size='small' 
            onClick={() => setLeftPanelCollapsed(true)}
            sx={{ color: 'text.secondary' }}
          >
            <ChevronLeft />
          </IconButton>
        </Box>
        
        {/* Quick Permission Actions for Teachers */}
        {(isInstructor || canModerate) && (
          <Box sx={{ mt: 1 }}>
            <Typography variant='caption' color='text.secondary' sx={{ mb: 1, display: 'block' }}>
              Quick Actions:
            </Typography>
            <Stack direction='row' spacing={1}>
              <Button
                size='small'
                variant='outlined'
                startIcon={<Videocam />}
                onClick={() => {
                  participants
                    .filter(p => p.role === 'student' && p.id !== (currentUser?.id || currentUser?._id))
                    .forEach(student => grantStudentPermission(student.id, 'camera'));
                }}
                sx={{ fontSize: '0.7rem' }}
              >
                Grant All Cameras
              </Button>
              <Button
                size='small'
                variant='outlined'
                startIcon={<Mic />}
                onClick={() => {
                  participants
                    .filter(p => p.role === 'student' && p.id !== (currentUser?.id || currentUser?._id))
                    .forEach(student => grantStudentPermission(student.id, 'mic'));
                }}
                sx={{ fontSize: '0.7rem' }}
              >
                Grant All Mics
              </Button>
            </Stack>
            <Stack direction='row' spacing={1} sx={{ mt: 0.5 }}>
              <Button
                size='small'
                variant='text'
                color='error'
                onClick={() => {
                  participants
                    .filter(p => p.role === 'student' && p.id !== (currentUser?.id || currentUser?._id))
                    .forEach(student => {
                      revokeStudentPermission(student.id, 'camera');
                      revokeStudentPermission(student.id, 'mic');
                    });
                }}
                sx={{ fontSize: '0.65rem' }}
              >
                Revoke All Permissions
              </Button>
            </Stack>
          </Box>
        )}

        {/* Direct Permission Control Info */}
        {(isInstructor || canModerate) && (
          <Box sx={{ mt: 1 }}>
            <Typography variant='caption' color='info.main' sx={{ mb: 1, display: 'block' }}>
              💡 Click camera/mic icons next to student names to grant permissions
            </Typography>
          </Box>
        )}
      </CardContent>
      
      <Divider />
      
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List dense>
          {participants.map((participant) => (
            <ListItem key={participant.id}>
              <ListItemIcon>
                <Badge
                  color={participant.isOnline ? 'success' : 'error'}
                  variant='dot'
                  overlap='circular'
                >
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32,
                      backgroundColor: participant.role ? getRoleInfo(participant.role).color : 'grey.500'
                    }}
                  >
                    {participant.name[0]}
                  </Avatar>
                </Badge>
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    <Typography variant='body2' sx={{ flex: 1 }}>
                      {participant.name}
                    </Typography>
                    {participant.role && (
                      <Chip 
                        icon={<span style={{ fontSize: '0.7rem' }}>{getRoleInfo(participant.role).icon}</span>}
                        label={getRoleInfo(participant.role).name} 
                        size='small' 
                        sx={{
                          backgroundColor: getRoleInfo(participant.role).color,
                          color: 'white',
                          fontSize: '0.7rem'
                        }}
                      />
                    )}
                    {participant.handRaised && (
                      <Chip 
                        icon={<span>âœ‹</span>}
                        label='Hand Raised' 
                        size='small' 
                        color='warning'
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                    
                    {/* Individual Permission Status for Students */}
                    {participant.role === 'student' && (isInstructor || canModerate) && (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {studentPermissions[participant.id]?.camera && (
                          <Chip 
                            icon={<Videocam sx={{ fontSize: 12 }} />}
                            label='Cam' 
                            size='small' 
                            color='success'
                            sx={{ fontSize: '0.6rem', height: 16 }}
                          />
                        )}
                        {studentPermissions[participant.id]?.mic && (
                          <Chip 
                            icon={<Mic sx={{ fontSize: 12 }} />}
                            label='Mic' 
                            size='small' 
                            color='success'
                            sx={{ fontSize: '0.6rem', height: 16 }}
                          />
                        )}
                      </Box>
                    )}
                  </Box>
                }
                secondary={participant.isOnline ? 'Online' : 'Offline'}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {participant.handRaised && (
                  <Tooltip title='Hand raised'>
                    <RaiseHandIcon color='warning' fontSize='small' />
                  </Tooltip>
                )}
                
                {/* Media Status - No tooltips needed for status indicators */}
                <Box component='span' sx={{ display: 'inline-flex' }}>
                  <IconButton size='small' disabled>
                    {participant.micEnabled ? 
                      <Mic fontSize='small' color='primary' /> : 
                      <MicOff fontSize='small' color='disabled' />
                    }
                  </IconButton>
                </Box>
                <Box component='span' sx={{ display: 'inline-flex' }}>
                  <IconButton size='small' disabled>
                    {participant.cameraEnabled ? 
                      <Videocam fontSize='small' color='primary' /> : 
                      <VideocamOff fontSize='small' color='disabled' />
                    }
                  </IconButton>
                </Box>
                
                {/* Student Permission Controls - Show only for teachers/moderators and only for students */}
                {(isInstructor || canModerate) && participant.id !== (currentUser?.id || currentUser?._id) && participant.role === 'student' && (
                  <>
                    {/* Camera Permission Toggle */}
                    <Tooltip title={studentPermissions[participant.id]?.camera ? 'Revoke camera permission' : 'Grant camera permission'}>
                      <IconButton 
                        size='small' 
                        onClick={() => {
                          if (studentPermissions[participant.id]?.camera) {
                            revokeStudentPermission(participant.id, 'camera');
                          } else {
                            grantStudentPermission(participant.id, 'camera');
                          }
                        }}
                        color={studentPermissions[participant.id]?.camera ? 'success' : 'default'}
                        sx={{
                          border: studentPermissions[participant.id]?.camera ? '1px solid green' : '1px solid grey',
                          backgroundColor: studentPermissions[participant.id]?.camera ? 'rgba(76, 175, 80, 0.1)' : 'transparent'
                        }}
                      >
                        <Videocam fontSize='small' />
                      </IconButton>
                    </Tooltip>
                    
                    {/* Microphone Permission Toggle */}
                    <Tooltip title={studentPermissions[participant.id]?.mic ? 'Revoke mic permission' : 'Grant mic permission'}>
                      <IconButton 
                        size='small' 
                        onClick={() => {
                          if (studentPermissions[participant.id]?.mic) {
                            revokeStudentPermission(participant.id, 'mic');
                          } else {
                            grantStudentPermission(participant.id, 'mic');
                          }
                        }}
                        color={studentPermissions[participant.id]?.mic ? 'success' : 'default'}
                        sx={{
                          border: studentPermissions[participant.id]?.mic ? '1px solid green' : '1px solid grey',
                          backgroundColor: studentPermissions[participant.id]?.mic ? 'rgba(76, 175, 80, 0.1)' : 'transparent'
                        }}
                      >
                        <Mic fontSize='small' />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
                
                {/* Moderation Controls - Show only for moderators and not for self */}
                {canModerate && participant.id !== (currentUser?.id || currentUser?._id) && participant.role !== 'admin' && (
                  <>
                    <Tooltip title='Mute participant'>
                      <IconButton 
                        size='small' 
                        onClick={() => handleMuteParticipant(participant.id)}
                        color='warning'
                      >
                        <MicOff fontSize='small' />
                      </IconButton>
                    </Tooltip>
                    {hasFullAccess && (
                      <Tooltip title='Remove participant'>
                        <IconButton 
                          size='small' 
                          onClick={() => handleKickParticipant(participant.id)}
                          color='error'
                        >
                          <Delete fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    )}
                  </>
                )}
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );

  // Render Chat Panel
  const renderChatPanel = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {chatMessages.map((msg) => (
          <Box key={msg.id} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Avatar 
                sx={{ 
                  width: 24, 
                  height: 24, 
                  fontSize: '0.75rem',
                  bgcolor: msg.senderRole ? getRoleInfo(msg.senderRole).color : 'grey.500'
                }}
              >
                {msg.sender[0]}
              </Avatar>
              <Typography variant='caption' fontWeight='bold'>
                {msg.sender}
              </Typography>
              {/* Multi-Role Badge Display */}
              {msg.senderRole && (
                <Chip 
                  icon={<span style={{ fontSize: '0.7rem' }}>{getRoleInfo(msg.senderRole).icon}</span>}
                  label={getRoleInfo(msg.senderRole).name} 
                  size='small' 
                  sx={{ 
                    height: 16, 
                    fontSize: '0.6rem',
                    backgroundColor: getRoleInfo(msg.senderRole).color,
                    color: 'white'
                  }} 
                />
              )}
              <Typography variant='caption' color='text.secondary'>
                {formatTime(msg.timestamp)}
              </Typography>
              {/* Moderation Controls for Admins/HODs */}
              {canModerate && msg.senderRole !== 'admin' && msg.senderId !== currentUser?.id && (
                <IconButton 
                  size='small' 
                  onClick={() => handleDeleteMessage(msg.id)}
                  sx={{ ml: 'auto', opacity: 0.7, '&:hover': { opacity: 1 } }}
                >
                  <Delete fontSize='small' />
                </IconButton>
              )}
            </Box>
            <Typography variant='body2' sx={{ ml: 4, color: 'text.primary' }}>
              {msg.message}
            </Typography>
          </Box>
        ))}
      </Box>
      
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size='small'
            fullWidth
            placeholder='Type a message...'
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          <IconButton 
            color='primary' 
            onClick={sendMessage}
            sx={{ 
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': { backgroundColor: 'primary.dark' }
            }}
          >
            <Send />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  // Render Q&A Panel
  const renderQAPanel = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {!isTeacher && (
        <>
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size='small'
                fullWidth
                placeholder='Ask a question...'
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendQuestion()}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
              <IconButton 
                color='primary' 
                onClick={sendQuestion}
                sx={{ 
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': { backgroundColor: 'primary.dark' }
                }}
              >
                <Send />
              </IconButton>
            </Box>
          </Box>
          <Divider />
        </>
      )}
      
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {questions.map((q) => (
          <Card key={q.id} sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant='subtitle2' color='primary'>
                  {q.student}
                </Typography>
                <Chip
                  label={q.answered ? 'Answered' : 'Pending'}
                  size='small'
                  color={q.answered ? 'success' : 'warning'}
                />
              </Box>
              <Typography variant='body2' sx={{ mb: 1 }}>
                {q.question}
              </Typography>
              {q.answered && q.answer && (
                <Box sx={{ 
                  backgroundColor: 'grey.50', 
                  p: 1, 
                  borderRadius: 1,
                  borderLeft: '3px solid',
                  borderColor: 'primary.main'
                }}>
                  <Typography variant='caption' color='primary' fontWeight='bold'>
                    Answer:
                  </Typography>
                  <Typography variant='body2'>
                    {q.answer}
                  </Typography>
                </Box>
              )}
              <Typography variant='caption' color='text.secondary'>
                {formatTime(q.timestamp)}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );

  // Render Materials Panel
  const renderMaterialsPanel = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant='h6' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MenuBook fontSize='small' />
            Class Materials & Activities
          </Typography>
          
          {isInstructor && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <input
                type='file'
                id='file-upload'
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                multiple
                accept='.pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.png,.mp4,.mp3'
              />
              <label htmlFor='file-upload'>
                <Button
                  variant='contained'
                  component='span'
                  size='small'
                  startIcon={<UploadFile />}
                >
                  Upload File
                </Button>
              </label>
              
              <Button
                variant='outlined'
                size='small'
                startIcon={<Poll />}
                onClick={createQuickPoll}
              >
                Quick Poll
              </Button>
            </Box>
          )}
        </Box>
        
        <Tabs 
          value={materialTab} 
          onChange={(e, v) => setMaterialTab(v)}
          variant='fullWidth'
          sx={{ minHeight: 36 }}
        >
          <Tab label='Files' sx={{ minHeight: 36, py: 1 }} />
          <Tab label='Polls' sx={{ minHeight: 36, py: 1 }} />
          <Tab label='Quizzes' sx={{ minHeight: 36, py: 1 }} />
        </Tabs>
      </Box>
      
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {materialTab === 0 && (
          <Box>
            {classFiles.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <MenuBook sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                <Typography>No files uploaded yet</Typography>
                {isInstructor && (
                  <Typography variant='caption'>Upload files to share with students</Typography>
                )}
              </Box>
            ) : (
              classFiles.map((file) => (
                <Card 
                  key={file.id || file.name} 
                  sx={{ 
                    mb: 2, 
                    p: 2, 
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'grey.50' },
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                  onClick={() => handleFileDownload(file)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <AttachFile />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant='body2' fontWeight='medium'>
                        {file.name}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {file.size && `${(file.size / 1024 / 1024).toFixed(1)} MB • `}
                        Uploaded {file.uploadedAt ? formatTime(file.uploadedAt) : 'just now'}
                      </Typography>
                    </Box>
                    {canModerate && (
                      <IconButton 
                        size='small' 
                        onClick={(e) => { e.stopPropagation(); handleDeleteFile(file.id); }}
                        color='error'
                      >
                        <Delete fontSize='small' />
                      </IconButton>
                    )}
                  </Box>
                </Card>
              ))
            )}
          </Box>
        )}
        
        {materialTab === 1 && (
          <Box>
            {activePolls.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <Poll sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                <Typography>No active polls</Typography>
                {isInstructor && (
                  <Typography variant='caption'>Create polls to engage students</Typography>
                )}
              </Box>
            ) : (
              activePolls.map((poll) => (
                <Card key={poll.id} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant='h6' sx={{ mb: 2 }}>{poll.question}</Typography>
                  
                  {poll.options.map((option, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Button
                        fullWidth
                        variant={poll.userResponse === index ? 'contained' : 'outlined'}
                        onClick={() => handlePollResponse(poll.id, index)}
                        disabled={poll.userResponse !== undefined}
                        sx={{ justifyContent: 'flex-start', mb: 1 }}
                      >
                        {option.text} {isInstructor && '(${option.votes} votes)'}
                      </Button>
                    </Box>
                  ))}
                  
                  <Typography variant='caption' color='text.secondary'>
                    {poll.isActive ? `${poll.responses?.length || 0} responses` : 'Poll ended'}
                  </Typography>
                </Card>
              ))
            )}
          </Box>
        )}
        
        {materialTab === 2 && (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <School sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography>Interactive Quizzes</Typography>
            <Typography variant='caption'>Coming soon - Real-time quiz functionality</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      {/* Global CSS Override to hide parent sidebars */}
      <style>
        {`
          body { overflow: hidden !important; }
          .MuiBox-root:has([data-testid='live-class-container']) {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 9999 !important;
          }
        `}
      </style>
      
      <MainContainer data-testid='live-class-container'>
        {/* Header */}
        <HeaderBar position='static' elevation={0}>
        <Toolbar>
          <Typography variant='h6' sx={{ flexGrow: 1, color: 'inherit' }}>
            SGT LMS Live Class
          </Typography>
          
          <Stack direction='row' spacing={2} alignItems='center'>
            {/* Multi-Role Switcher */}
            {isMultiRole && (
              <FormControl size='small' sx={{ minWidth: 120 }}>
                <InputLabel sx={{ color: 'inherit' }}>Role</InputLabel>
                <Select
                  value={activeRole}
                  onChange={(e) => switchRole(e.target.value)}
                  label='Role'
                  sx={{ 
                    color: 'inherit',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'inherit'
                    }
                  }}
                >
                  {availableRoles.map((role) => {
                    const roleInfo = getRoleInfo(role);
                    return (
                      <MenuItem key={role} value={role}>
                        <Stack direction='row' spacing={1} alignItems='center'>
                          <span>{roleInfo.icon}</span>
                          <span>{roleInfo.name}</span>
                        </Stack>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            )}
            
            {/* Current Role Badge */}
            <Chip 
              icon={<span>{getRoleInfo(activeRole).icon}</span>}
              label={getRoleInfo(activeRole).name}
              size='small'
              sx={{ 
                backgroundColor: getRoleInfo(activeRole).color,
                color: 'white',
                fontWeight: 'bold'
              }}
            />
            
            <Chip 
              label={`${participants.length} participants`}
              size='small'
              sx={{ backgroundColor: 'grey.100' }}
            />
            
            <Button
              variant='outlined'
              startIcon={<ExitToApp />}
              onClick={handleExit}
              sx={{ color: 'inherit', borderColor: 'divider' }}
            >
              Leave Class
            </Button>
          </Stack>
        </Toolbar>
      </HeaderBar>

      {/* Main Content Grid */}
      <ContentGrid
        sx={{
          display: 'flex',
          flexDirection: 'row',
          position: 'relative'
        }}
      >
        {/* Full Width Main Video Area */}
        <MainVideoArea sx={{ flex: 1, position: 'relative' }}>
          <CardContent sx={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <ToggleButtonGroup
                value={contentType}
                exclusive
                onChange={(e, value) => value && setContentType(value)}
                size='small'
              >
                <ToggleButton value='video'>
                  <Videocam fontSize='small' />
                </ToggleButton>
                <ToggleButton value='whiteboard'>
                  <School fontSize='small' />
                </ToggleButton>
                {['teacher', 'admin', 'hod', 'dean'].includes(activeRole) && (
                  <ToggleButton value='screen'>
                    <ScreenShare fontSize='small' />
                  </ToggleButton>
                )}
              </ToggleButtonGroup>
              
              {/* Floating Participants Toggle */}
              <Box sx={{
                position: 'absolute',
                top: -10,
                right: 10,
                zIndex: 1000
              }}>
                <Tooltip title={leftPanelCollapsed ? 'Show Participants' : 'Hide Participants'}>
                  <IconButton 
                    onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
                    size='small'
                    sx={{ 
                      bgcolor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.9)'
                      }
                    }}
                  >
                    {leftPanelCollapsed ? <People /> : <Close />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <Box sx={{ flex: 1, position: 'relative' }}>
              {renderVideoContent()}
              
              {/* Floating Participants Panel */}
              {!leftPanelCollapsed && (
                <Box sx={{
                  position: 'absolute',
                  top: 50,
                  left: 16,
                  width: 320,
                  maxHeight: 'calc(100vh - 250px)',
                  zIndex: 1000,
                  bgcolor: 'rgba(255,255,255,0.98)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  animation: 'slideIn 0.3s ease-out'
                }}>
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant='h6' sx={{ color: '#1e293b', fontWeight: 'bold' }}>
                        Participants ({participants.length})
                      </Typography>
                      <IconButton 
                        size='small' 
                        onClick={() => setLeftPanelCollapsed(true)}
                        sx={{ color: '#64748b' }}
                      >
                        <Close fontSize='small' />
                      </IconButton>
                    </Box>
                    {renderParticipantsPanel()}
                  </Box>
                </Box>
              )}
            </Box>
          </CardContent>
        </MainVideoArea>

        {/* Right Panel - Chat/Q&A/Materials (Floating) */}
        {!rightPanelCollapsed && (
          <Box sx={{
            position: 'absolute',
            top: 80,
            right: 16,
            width: 380,
            height: 'calc(100% - 100px)',
            zIndex: 1000,
            bgcolor: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
            border: '1px solid rgba(0,0,0,0.1)',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pr: 1,
                bgcolor: 'rgba(30, 41, 59, 0.05)'
              }}>
                <Tabs
                  value={rightPanelTab}
                  onChange={(e, value) => setRightPanelTab(value)}
                  variant='fullWidth'
                  sx={{ minHeight: 48, flex: 1 }}
                >
                  <Tab icon={<Chat fontSize='small' />} label='Chat' />
                  <Tab icon={<Assignment fontSize='small' />} label='Q&A' />
                  <Tab icon={<MenuBook fontSize='small' />} label='Files' />
                </Tabs>
                <Tooltip title='Hide Panel'>
                  <IconButton 
                    size='small' 
                    onClick={toggleRightPanelCollapse}
                    sx={{ ml: 1, color: '#64748b' }}
                  >
                    <Close />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                {rightPanelTab === 0 && renderChatPanel()}
                {rightPanelTab === 1 && renderQAPanel()}
                {rightPanelTab === 2 && renderMaterialsPanel()}
              </Box>
            </Box>
          </Box>
        )}

        {/* Floating Chat Toggle Button */}
        {rightPanelCollapsed && (
          <Box sx={{ 
            position: 'absolute', 
            top: 20, 
            right: 100,
            zIndex: 1100
          }}>
            <Tooltip title='Show Chat & Materials' placement='left'>
              <IconButton 
                onClick={toggleRightPanelCollapse}
                sx={{ 
                  width: 56,
                  height: 56,
                  bgcolor: 'rgba(0,0,0,0.8)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.9)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Chat sx={{ fontSize: 28 }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </ContentGrid>

      {/* Professional Control Bar */}
      <ControlBar>
        {/* Center - Main Controls */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 1.5,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 3,
          padding: '8px 12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {/* Audio Control Group */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={micEnabled ? 'Mute microphone' : 'Unmute microphone'}>
              <IconButton
                onClick={toggleMicrophone}
                sx={{
                  width: 44,
                  height: 44,
                  backgroundColor: micEnabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: micEnabled ? '#22c55e' : '#ef4444',
                  border: `1px solid ${micEnabled ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  '&:hover': { 
                    backgroundColor: micEnabled ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {micEnabled ? <Mic /> : <MicOff />}
              </IconButton>
            </Tooltip>
          </Box>
          
          {/* Video Control Group */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}>
              <IconButton
                onClick={toggleCamera}
                sx={{
                  width: 44,
                  height: 44,
                  backgroundColor: cameraEnabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: cameraEnabled ? '#22c55e' : '#ef4444',
                  border: `1px solid ${cameraEnabled ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  '&:hover': { 
                    backgroundColor: cameraEnabled ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {cameraEnabled ? <Videocam /> : <VideocamOff />}
              </IconButton>
            </Tooltip>
          </Box>
          
          {/* Screen Share Control - Only for teachers/admins */}
          {['teacher', 'admin', 'hod', 'dean'].includes(activeRole) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
              <Tooltip title={isScreenSharing ? 'Stop screen sharing' : 'Share screen'}>
                <IconButton
                  onClick={toggleScreenShare}
                  sx={{
                    width: 44,
                    height: 44,
                    backgroundColor: isScreenSharing ? 'rgba(59, 130, 246, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                    color: isScreenSharing ? '#3b82f6' : '#64748b',
                    border: `1px solid ${isScreenSharing ? 'rgba(59, 130, 246, 0.3)' : 'rgba(100, 116, 139, 0.3)'}`,
                    '&:hover': { 
                      backgroundColor: isScreenSharing ? 'rgba(59, 130, 246, 0.3)' : 'rgba(100, 116, 139, 0.3)',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isScreenSharing ? <StopScreenShare /> : <ScreenShare />}
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
        
        
        {/* Right Side - Additional Controls */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 3,
          padding: '8px 12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {/* Participants Count */}
          <Chip
            icon={<People sx={{ fontSize: 16 }} />}
            label={`${participants.length}`}
            size='small'
            sx={{ 
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: '#60a5fa',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              fontWeight: 600,
              minWidth: '60px',
              '& .MuiChip-icon': {
                color: '#60a5fa'
              }
            }}
          />
          
          {/* Exit Button */}
          <Tooltip title='Leave Class'>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{
                width: 44,
                height: 44,
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                '&:hover': { 
                  backgroundColor: 'rgba(239, 68, 68, 0.3)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <ExitToApp />
            </IconButton>
          </Tooltip>
        </Box>
      </ControlBar>

      {/* Floating Status Indicators */}
      {(isRecording || pinnedVideo) && (
        <Box sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          zIndex: 1500
        }}>
          {isRecording && (
            <Chip
              icon={<FiberManualRecord sx={{ fontSize: 14, animation: 'pulse 1.5s infinite' }} />}
              label='Recording'
              size='small'
              sx={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.9)',
                color: 'white',
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
            />
          )}
          
          {pinnedVideo && (
            <Chip
              icon={<PushPin sx={{ fontSize: 14 }} />}
              label={`Focusing: ${pinnedVideo.name}`}
              size='small'
              sx={{ 
                backgroundColor: 'rgba(59, 130, 246, 0.9)',
                color: 'white',
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            />
          )}
        </Box>
      )}

      {/* Notifications */}
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ mt: 8, zIndex: 2100 }}
        >
          <Alert 
            severity={notification.type} 
            onClose={() => {
              setNotifications(prev => prev.filter(n => n.id !== notification.id));
            }}
            sx={{ 
              minWidth: 300,
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              color: 'white'
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </MainContainer>
    </>
  );
};

export default SgtLmsLiveClass;







