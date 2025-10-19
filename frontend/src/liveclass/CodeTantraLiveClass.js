import React from 'react';
import VideoCallRoom from '../components/VideoCallRoom';

const CodeTantraLiveClass = ({ classId, onExit }) => {
  return (
    <VideoCallRoom 
      roomId={classId}
      onLeave={onExit}
    />
  );
};

export default CodeTantraLiveClass;
