import React, { useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  ScreenShare,
  StopScreenShare,
  PushPin,
  PushPinOutlined
} from '@mui/icons-material';

const TeacherVideoPanel = ({
  stream,
  isAudioEnabled = true,
  isVideoEnabled = true,
  isScreenSharing = false,
  teacherName = 'Teacher',
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  isPinned = false,
  onTogglePin,
  isLarge = false
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <Paper
      elevation={isPinned ? 8 : 3}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: 'black',
        borderRadius: 2,
        overflow: 'hidden',
        border: isPinned ? '3px solid' : 'none',
        borderColor: 'primary.main'
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: isVideoEnabled && !isScreenSharing ? 'block' : 'none'
        }}
      />

      {/* Screen Share Display */}
      {isScreenSharing && (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'grey.900'
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
          />
        </Box>
      )}

      {/* Video Off Placeholder */}
      {!isVideoEnabled && !isScreenSharing && (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'grey.800'
          }}
        >
          <Box
            sx={{
              width: isLarge ? 120 : 80,
              height: isLarge ? 120 : 80,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2
            }}
          >
            <Typography
              variant={isLarge ? 'h2' : 'h3'}
              sx={{ color: 'white', fontWeight: 'bold' }}
            >
              {teacherName.charAt(0).toUpperCase()}
            </Typography>
          </Box>
          <Typography variant={isLarge ? 'h6' : 'body1'} sx={{ color: 'white' }}>
            {teacherName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'grey.400', mt: 0.5 }}>
            Camera Off
          </Typography>
        </Box>
      )}

      {/* Top Bar - Name and Status */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          p: 1.5,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography
            variant="body2"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            {teacherName}
          </Typography>
          <Chip
            label="Teacher"
            size="small"
            color="primary"
            sx={{
              height: 20,
              fontSize: '0.7rem',
              fontWeight: 'bold'
            }}
          />
          {isScreenSharing && (
            <Chip
              label="Presenting"
              size="small"
              color="warning"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                fontWeight: 'bold'
              }}
            />
          )}
        </Box>

        {onTogglePin && (
          <Tooltip title={isPinned ? 'Unpin' : 'Pin'}>
            <IconButton
              onClick={onTogglePin}
              size="small"
              sx={{
                color: 'white',
                backgroundColor: 'rgba(0,0,0,0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.5)'
                }
              }}
            >
              {isPinned ? <PushPin fontSize="small" /> : <PushPinOutlined fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Bottom Bar - Controls */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          p: 1.5,
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
          display: 'flex',
          justifyContent: 'center',
          gap: 1
        }}
      >
        {/* Audio Control */}
        {onToggleAudio && (
          <Tooltip title={isAudioEnabled ? 'Mute' : 'Unmute'}>
            <IconButton
              onClick={onToggleAudio}
              size="small"
              sx={{
                color: 'white',
                backgroundColor: isAudioEnabled ? 'rgba(255,255,255,0.2)' : 'error.main',
                '&:hover': {
                  backgroundColor: isAudioEnabled ? 'rgba(255,255,255,0.3)' : 'error.dark'
                }
              }}
            >
              {isAudioEnabled ? <Mic fontSize="small" /> : <MicOff fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}

        {/* Video Control */}
        {onToggleVideo && (
          <Tooltip title={isVideoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}>
            <IconButton
              onClick={onToggleVideo}
              size="small"
              sx={{
                color: 'white',
                backgroundColor: isVideoEnabled ? 'rgba(255,255,255,0.2)' : 'error.main',
                '&:hover': {
                  backgroundColor: isVideoEnabled ? 'rgba(255,255,255,0.3)' : 'error.dark'
                }
              }}
            >
              {isVideoEnabled ? <Videocam fontSize="small" /> : <VideocamOff fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}

        {/* Screen Share Control */}
        {onToggleScreenShare && (
          <Tooltip title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}>
            <IconButton
              onClick={onToggleScreenShare}
              size="small"
              sx={{
                color: 'white',
                backgroundColor: isScreenSharing ? 'warning.main' : 'rgba(255,255,255,0.2)',
                '&:hover': {
                  backgroundColor: isScreenSharing ? 'warning.dark' : 'rgba(255,255,255,0.3)'
                }
              }}
            >
              {isScreenSharing ? <StopScreenShare fontSize="small" /> : <ScreenShare fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Audio Indicator */}
      {!isAudioEnabled && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: 'error.main',
            borderRadius: '50%',
            p: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <MicOff sx={{ fontSize: 16, color: 'white' }} />
        </Box>
      )}
    </Paper>
  );
};

export default TeacherVideoPanel;
