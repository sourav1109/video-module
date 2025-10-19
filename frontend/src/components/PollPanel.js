import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  List,
  ListItem,
  Divider,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  Close,
  Add,
  Delete,
  Poll,
  Send,
  CheckCircle
} from '@mui/icons-material';

const PollPanel = ({
  visible = false,
  polls = [],
  onClose,
  onCreatePoll,
  onVote,
  isTeacher = false,
  currentUserId
}) => {
  const [createMode, setCreateMode] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  const handleAddOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleRemoveOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleCreatePoll = () => {
    const validOptions = pollOptions.filter(opt => opt.trim());
    if (pollQuestion.trim() && validOptions.length >= 2) {
      onCreatePoll({
        question: pollQuestion.trim(),
        options: validOptions,
        createdAt: new Date(),
        createdBy: currentUserId
      });
      // Reset form
      setPollQuestion('');
      setPollOptions(['', '']);
      setCreateMode(false);
    }
  };

  const handleVote = (pollId, optionIndex) => {
    onVote(pollId, optionIndex);
  };

  const calculatePercentage = (votes, total) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
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
        width: 400,
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
          Polls
        </Typography>
        <Box>
          {isTeacher && !createMode && (
            <IconButton
              onClick={() => setCreateMode(true)}
              size="small"
              sx={{ color: 'white', mr: 1 }}
            >
              <Add />
            </IconButton>
          )}
          <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Create Poll Form */}
        {isTeacher && createMode && (
          <Paper elevation={2} sx={{ p: 2, mb: 2, backgroundColor: 'grey.50' }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
              Create New Poll
            </Typography>

            <TextField
              fullWidth
              label="Poll Question"
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              placeholder="What is your question?"
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
            />

            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Options (2-6):
            </Typography>

            {pollOptions.map((option, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  variant="outlined"
                  size="small"
                />
                {pollOptions.length > 2 && (
                  <IconButton
                    onClick={() => handleRemoveOption(index)}
                    size="small"
                    color="error"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ))}

            {pollOptions.length < 6 && (
              <Button
                startIcon={<Add />}
                onClick={handleAddOption}
                size="small"
                sx={{ mt: 1, mb: 2 }}
              >
                Add Option
              </Button>
            )}

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleCreatePoll}
                disabled={!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2}
                fullWidth
                startIcon={<Send />}
              >
                Create Poll
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setCreateMode(false);
                  setPollQuestion('');
                  setPollOptions(['', '']);
                }}
              >
                Cancel
              </Button>
            </Box>
          </Paper>
        )}

        {/* Active Polls List */}
        {polls.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 6, color: 'text.secondary' }}>
            <Poll sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
            <Typography variant="body2">No polls yet</Typography>
            {isTeacher && (
              <Typography variant="caption">
                Create a poll to engage your students!
              </Typography>
            )}
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {polls.map((poll, pollIndex) => {
              const totalVotes = poll.votes?.reduce((sum, v) => sum + v, 0) || 0;
              const hasVoted = poll.voters?.includes(currentUserId);
              const userVoteIndex = poll.userVotes?.[currentUserId];

              return (
                <Paper
                  key={poll.id || pollIndex}
                  elevation={2}
                  sx={{ mb: 2, p: 2 }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', flex: 1 }}>
                      {poll.question}
                    </Typography>
                    {poll.isActive !== false && (
                      <Chip label="Active" color="success" size="small" sx={{ height: 20 }} />
                    )}
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                  </Typography>

                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      value={userVoteIndex !== undefined ? userVoteIndex.toString() : ''}
                    >
                      {poll.options.map((option, optionIndex) => {
                        const votes = poll.votes?.[optionIndex] || 0;
                        const percentage = calculatePercentage(votes, totalVotes);
                        const isSelected = userVoteIndex === optionIndex;

                        return (
                          <Box key={optionIndex} sx={{ mb: 1.5 }}>
                            <FormControlLabel
                              value={optionIndex.toString()}
                              control={
                                <Radio
                                  size="small"
                                  disabled={hasVoted}
                                  onChange={() => handleVote(poll.id, optionIndex)}
                                />
                              }
                              label={
                                <Box sx={{ width: '100%' }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2">
                                      {option}
                                      {isSelected && (
                                        <CheckCircle
                                          sx={{ fontSize: 16, ml: 1, color: 'success.main', verticalAlign: 'middle' }}
                                        />
                                      )}
                                    </Typography>
                                    {(hasVoted || isTeacher) && (
                                      <Typography variant="caption" color="text.secondary">
                                        {votes} ({percentage}%)
                                      </Typography>
                                    )}
                                  </Box>
                                  {(hasVoted || isTeacher) && (
                                    <LinearProgress
                                      variant="determinate"
                                      value={percentage}
                                      sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                                      color={isSelected ? 'success' : 'primary'}
                                    />
                                  )}
                                </Box>
                              }
                              sx={{ width: '100%', ml: 0 }}
                            />
                          </Box>
                        );
                      })}
                    </RadioGroup>
                  </FormControl>

                  {hasVoted && (
                    <Chip
                      label="You voted"
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  )}
                </Paper>
              );
            })}
          </List>
        )}
      </Box>
    </Paper>
  );
};

export default PollPanel;
