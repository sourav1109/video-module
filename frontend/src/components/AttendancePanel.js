import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  Divider,
  Button
} from '@mui/material';
import {
  Close,
  Search,
  Download,
  Circle,
  PersonOff
} from '@mui/icons-material';
import { format } from 'date-fns';

const AttendancePanel = ({
  visible = false,
  participants = [],
  onClose,
  isTeacher = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort participants
  const filteredParticipants = useMemo(() => {
    let filtered = participants.filter((p) =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort: Teacher first, then by join time
    return filtered.sort((a, b) => {
      if (a.role === 'teacher' && b.role !== 'teacher') return -1;
      if (a.role !== 'teacher' && b.role === 'teacher') return 1;
      return new Date(a.joinedAt) - new Date(b.joinedAt);
    });
  }, [participants, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const present = participants.filter(p => p.status === 'online' || p.isOnline).length;
    const total = participants.length;
    const teachers = participants.filter(p => p.role === 'teacher').length;
    const students = participants.filter(p => p.role === 'student').length;

    return { present, total, teachers, students };
  }, [participants]);

  const handleDownloadAttendance = () => {
    // Generate CSV
    const headers = ['Name', 'Email', 'Role', 'Joined At', 'Status', 'Duration'];
    const rows = participants.map(p => [
      p.name || 'Unknown',
      p.email || 'N/A',
      p.role || 'student',
      p.joinedAt ? format(new Date(p.joinedAt), 'yyyy-MM-dd HH:mm:ss') : 'N/A',
      p.status || (p.isOnline ? 'online' : 'offline'),
      p.duration || calculateDuration(p.joinedAt)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const calculateDuration = (joinedAt) => {
    if (!joinedAt) return 'N/A';
    const duration = Date.now() - new Date(joinedAt).getTime();
    const minutes = Math.floor(duration / 60000);
    return `${minutes} min`;
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
        width: 380,
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
          Participants ({stats.present}/{stats.total})
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </Box>

      {/* Statistics */}
      <Box sx={{ p: 2, backgroundColor: 'grey.50' }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={`${stats.teachers} Teacher${stats.teachers !== 1 ? 's' : ''}`}
            color="primary"
            size="small"
          />
          <Chip
            label={`${stats.students} Student${stats.students !== 1 ? 's' : ''}`}
            color="secondary"
            size="small"
          />
          <Chip
            label={`${stats.present} Online`}
            color="success"
            size="small"
          />
        </Box>

        {isTeacher && (
          <Button
            startIcon={<Download />}
            onClick={handleDownloadAttendance}
            size="small"
            variant="outlined"
            sx={{ mt: 1.5, width: '100%' }}
          >
            Download Attendance
          </Button>
        )}
      </Box>

      {/* Search */}
      <Box sx={{ p: 2, pt: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search participants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            )
          }}
        />
      </Box>

      {/* Participants List */}
      <List
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 0
        }}
      >
        {filteredParticipants.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
            <PersonOff sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
            <Typography variant="body2">
              {searchQuery ? 'No participants found' : 'No participants yet'}
            </Typography>
          </Box>
        ) : (
          filteredParticipants.map((participant, index) => {
            const isOnline = participant.status === 'online' || participant.isOnline;
            const isTeacherRole = participant.role === 'teacher';

            return (
              <React.Fragment key={participant.id || participant.socketId || index}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: isTeacherRole ? 'primary.main' : 'secondary.main'
                      }}
                    >
                      {participant.name?.charAt(0) || 'U'}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {participant.name || 'Unknown User'}
                        </Typography>
                        {isTeacherRole && (
                          <Chip
                            label="Teacher"
                            size="small"
                            color="primary"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          {participant.email || 'No email'}
                        </Typography>
                        {participant.joinedAt && (
                          <Typography variant="caption" color="text.secondary">
                            Joined: {format(new Date(participant.joinedAt), 'HH:mm')} •{' '}
                            {calculateDuration(participant.joinedAt)}
                          </Typography>
                        )}
                      </Box>
                    }
                  />

                  <Circle
                    sx={{
                      fontSize: 12,
                      color: isOnline ? 'success.main' : 'grey.400',
                      ml: 1
                    }}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            );
          })
        )}
      </List>
    </Paper>
  );
};

export default AttendancePanel;
