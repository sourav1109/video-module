import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid
} from '@mui/material';

const ScheduleLiveClassDialog = ({ open, onClose, onClassScheduled, token }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledStart: '',
    scheduledEnd: '',
    maxParticipants: 500,
    recordingEnabled: true,
    whiteboardEnabled: true,
    chatEnabled: true,
    pollsEnabled: true
  });

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (onClassScheduled) {
        await onClassScheduled(formData);
      }
      
      // Reset form on success
      setFormData({
        title: '',
        description: '',
        scheduledStart: '',
        scheduledEnd: '',
        maxParticipants: 500,
        recordingEnabled: true,
        whiteboardEnabled: true,
        chatEnabled: true,
        pollsEnabled: true
      });
      
      onClose();
    } catch (error) {
      console.error('❌ Error scheduling class:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Schedule Live Class</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Class Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Start Date & Time"
              name="scheduledStart"
              type="datetime-local"
              value={formData.scheduledStart}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="End Date & Time"
              name="scheduledEnd"
              type="datetime-local"
              value={formData.scheduledEnd}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Max Participants"
              name="maxParticipants"
              type="number"
              value={formData.maxParticipants}
              onChange={handleChange}
              inputProps={{ min: 1, max: 500 }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name="recordingEnabled"
                  checked={formData.recordingEnabled}
                  onChange={handleChange}
                />
              }
              label="Enable Recording"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name="whiteboardEnabled"
                  checked={formData.whiteboardEnabled}
                  onChange={handleChange}
                />
              }
              label="Enable Whiteboard"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name="chatEnabled"
                  checked={formData.chatEnabled}
                  onChange={handleChange}
                />
              }
              label="Enable Chat"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name="pollsEnabled"
                  checked={formData.pollsEnabled}
                  onChange={handleChange}
                />
              }
              label="Enable Polls"
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={!formData.title || !formData.scheduledStart || !formData.scheduledEnd}
        >
          Schedule Class
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleLiveClassDialog;
