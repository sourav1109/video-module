import React from 'react';
import { useNavigate } from 'react-router-dom';
import VideoCallRoom from './VideoCallRoom';

const LiveClassJoinPage = ({ classId }) => {
  const navigate = useNavigate();

  return (
    <VideoCallRoom 
      roomId={classId} 
      onLeave={() => navigate('/student')}
    />
  );
};

export default LiveClassJoinPage;
