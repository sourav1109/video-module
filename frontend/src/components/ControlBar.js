import React from 'react';
import { IconButton, Tooltip, Box, Badge } from '@mui/material';
import {
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  ScreenShare,
  StopScreenShare,
  Chat,
  People,
  CallEnd,
  MoreVert,
  FiberManualRecord,
  Stop as StopIcon,
  PanTool,
  Settings
} from '@mui/icons-material';

const ControlBar = ({
  isAudioEnabled = true,
  isVideoEnabled = true,
  isScreenSharing = false,
  isRecording = false,
  isHandRaised = false,
  unreadMessages = 0,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleRecording,
  onToggleChat,
  onToggleParticipants,
  onToggleHandRaise,
  onEndCall,
  onSettings,
  isTeacher = false
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 1,
        padding: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: 2,
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Microphone Toggle */}
      <Tooltip title={isAudioEnabled ? 'Mute Microphone' : 'Unmute Microphone'}>
        <IconButton
          onClick={onToggleAudio}
          sx={{
            backgroundColor: isAudioEnabled ? 'rgba(255,255,255,0.1)' : 'error.main',
            color: 'white',
            '&:hover': {
              backgroundColor: isAudioEnabled ? 'rgba(255,255,255,0.2)' : 'error.dark',
            },
          }}
        >
          {isAudioEnabled ? <Mic /> : <MicOff />}
        </IconButton>
      </Tooltip>

      {/* Video Toggle */}
      <Tooltip title={isVideoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}>
        <IconButton
          onClick={onToggleVideo}
          sx={{
            backgroundColor: isVideoEnabled ? 'rgba(255,255,255,0.1)' : 'error.main',
            color: 'white',
            '&:hover': {
              backgroundColor: isVideoEnabled ? 'rgba(255,255,255,0.2)' : 'error.dark',
            },
          }}
        >
          {isVideoEnabled ? <Videocam /> : <VideocamOff />}
        </IconButton>
      </Tooltip>

      {/* Screen Share Toggle (Teacher/Admin only or if permitted) */}
      {isTeacher && (
        <Tooltip title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}>
          <IconButton
            onClick={onToggleScreenShare}
            sx={{
              backgroundColor: isScreenSharing ? 'primary.main' : 'rgba(255,255,255,0.1)',
              color: 'white',
              '&:hover': {
                backgroundColor: isScreenSharing ? 'primary.dark' : 'rgba(255,255,255,0.2)',
              },
            }}
          >
            {isScreenSharing ? <StopScreenShare /> : <ScreenShare />}
          </IconButton>
        </Tooltip>
      )}

      {/* Recording Toggle (Teacher only) */}
      {isTeacher && (
        <Tooltip title={isRecording ? 'Stop Recording' : 'Start Recording'}>
          <IconButton
            onClick={onToggleRecording}
            sx={{
              backgroundColor: isRecording ? 'error.main' : 'rgba(255,255,255,0.1)',
              color: 'white',
              '&:hover': {
                backgroundColor: isRecording ? 'error.dark' : 'rgba(255,255,255,0.2)',
              },
            }}
          >
            {isRecording ? <StopIcon /> : <FiberManualRecord />}
          </IconButton>
        </Tooltip>
      )}

      {/* Raise Hand (Students) */}
      {!isTeacher && (
        <Tooltip title={isHandRaised ? 'Lower Hand' : 'Raise Hand'}>
          <IconButton
            onClick={onToggleHandRaise}
            sx={{
              backgroundColor: isHandRaised ? 'warning.main' : 'rgba(255,255,255,0.1)',
              color: 'white',
              '&:hover': {
                backgroundColor: isHandRaised ? 'warning.dark' : 'rgba(255,255,255,0.2)',
              },
            }}
          >
            <PanTool />
          </IconButton>
        </Tooltip>
      )}

      {/* Chat Toggle */}
      <Tooltip title="Toggle Chat">
        <IconButton
          onClick={onToggleChat}
          sx={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.2)',
            },
          }}
        >
          <Badge badgeContent={unreadMessages} color="error">
            <Chat />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Participants Toggle */}
      <Tooltip title="Toggle Participants">
        <IconButton
          onClick={onToggleParticipants}
          sx={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.2)',
            },
          }}
        >
          <People />
        </IconButton>
      </Tooltip>

      {/* Settings */}
      {onSettings && (
        <Tooltip title="Settings">
          <IconButton
            onClick={onSettings}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)',
              },
            }}
          >
            <Settings />
          </IconButton>
        </Tooltip>
      )}

      {/* End Call */}
      <Tooltip title="End Call">
        <IconButton
          onClick={onEndCall}
          sx={{
            backgroundColor: 'error.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'error.dark',
            },
          }}
        >
          <CallEnd />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ControlBar;
