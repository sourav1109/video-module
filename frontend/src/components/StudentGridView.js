import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Grid,
  Pagination,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Mic,
  MicOff,
  VideocamOff,
  PanTool,
  PushPin,
  PushPinOutlined
} from '@mui/icons-material';

const STUDENTS_PER_PAGE = 12; // 3x4 grid

const StudentVideoTile = ({
  student,
  onPin,
  isPinned = false
}) => {
  const videoRef = React.useRef(null);

  React.useEffect(() => {
    if (videoRef.current && student.stream) {
      videoRef.current.srcObject = student.stream;
    }
  }, [student.stream]);

  return (
    <Paper
      elevation={isPinned ? 6 : 2}
      sx={{
        position: 'relative',
        width: '100%',
        paddingTop: '75%', // 4:3 aspect ratio
        backgroundColor: 'grey.900',
        borderRadius: 1,
        overflow: 'hidden',
        border: isPinned ? '2px solid' : 'none',
        borderColor: 'primary.main',
        transition: 'all 0.2s'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
        {/* Video Element */}
        {student.isVideoEnabled && student.stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          /* Video Off Placeholder */
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
                width: 50,
                height: 50,
                borderRadius: '50%',
                backgroundColor: 'secondary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1
              }}
            >
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                {student.name?.charAt(0).toUpperCase() || 'S'}
              </Typography>
            </Box>
            <VideocamOff sx={{ color: 'grey.500', fontSize: 20 }} />
          </Box>
        )}

        {/* Name Overlay */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 0.75,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'white',
              fontWeight: 'medium',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1
            }}
          >
            {student.name || 'Student'}
          </Typography>

          {/* Audio Status */}
          {!student.isAudioEnabled && (
            <Box
              sx={{
                backgroundColor: 'error.main',
                borderRadius: '50%',
                p: 0.3,
                display: 'flex',
                alignItems: 'center',
                ml: 0.5
              }}
            >
              <MicOff sx={{ fontSize: 12, color: 'white' }} />
            </Box>
          )}
        </Box>

        {/* Hand Raised Indicator */}
        {student.isHandRaised && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: 'warning.main',
              borderRadius: 1,
              px: 0.75,
              py: 0.25,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            <PanTool sx={{ fontSize: 14, color: 'white' }} />
            <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.65rem' }}>
              Hand Raised
            </Typography>
          </Box>
        )}

        {/* Pin Button */}
        {onPin && (
          <Tooltip title={isPinned ? 'Unpin' : 'Pin Student'}>
            <IconButton
              onClick={() => onPin(student)}
              size="small"
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                color: 'white',
                backgroundColor: 'rgba(0,0,0,0.4)',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.6)'
                },
                opacity: 0.7,
                '&:hover': {
                  opacity: 1
                }
              }}
            >
              {isPinned ? <PushPin sx={{ fontSize: 16 }} /> : <PushPinOutlined sx={{ fontSize: 16 }} />}
            </IconButton>
          </Tooltip>
        )}

        {/* Speaking Indicator */}
        {student.isSpeaking && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              border: '3px solid',
              borderColor: 'success.main',
              borderRadius: 1,
              pointerEvents: 'none',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}
          />
        )}
      </Box>
    </Paper>
  );
};

const StudentGridView = ({
  students = [],
  onPinStudent,
  pinnedStudentId,
  showHandRaisedFirst = true
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Sort students: hand raised first, then by name
  const sortedStudents = useMemo(() => {
    let sorted = [...students];
    if (showHandRaisedFirst) {
      sorted.sort((a, b) => {
        if (a.isHandRaised && !b.isHandRaised) return -1;
        if (!a.isHandRaised && b.isHandRaised) return 1;
        return (a.name || '').localeCompare(b.name || '');
      });
    }
    return sorted;
  }, [students, showHandRaisedFirst]);

  // Pagination
  const totalPages = Math.ceil(sortedStudents.length / STUDENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * STUDENTS_PER_PAGE;
  const endIndex = startIndex + STUDENTS_PER_PAGE;
  const currentStudents = sortedStudents.slice(startIndex, endIndex);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  // Statistics
  const stats = useMemo(() => {
    const handRaised = students.filter(s => s.isHandRaised).length;
    const videoOn = students.filter(s => s.isVideoEnabled).length;
    const audioOn = students.filter(s => s.isAudioEnabled).length;
    return { handRaised, videoOn, audioOn };
  }, [students]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 2
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Students ({students.length})
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {stats.handRaised > 0 && (
            <Chip
              icon={<PanTool />}
              label={`${stats.handRaised} Hand${stats.handRaised > 1 ? 's' : ''} Raised`}
              color="warning"
              size="small"
            />
          )}
          <Chip
            icon={<Mic />}
            label={`${stats.audioOn} Audio`}
            size="small"
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Grid View */}
      <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
        {currentStudents.length === 0 ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary'
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              No students yet
            </Typography>
            <Typography variant="body2">
              Students will appear here when they join the class
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {currentStudents.map((student) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={student.id || student.socketId}>
                <StudentVideoTile
                  student={student}
                  onPin={onPinStudent}
                  isPinned={pinnedStudentId === student.id || pinnedStudentId === student.socketId}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 'auto' }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Global Styles for Speaking Animation */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
    </Box>
  );
};

export default StudentGridView;
