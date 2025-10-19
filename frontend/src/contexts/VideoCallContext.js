import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  // Connection state
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  
  // Room state
  currentRoom: null,
  participants: [],
  
  // User state
  currentUser: null,
  userRole: 'participant', // 'host', 'participant', 'observer'
  
  // Media state
  localStream: null,
  isVideoEnabled: true,
  isAudioEnabled: true,
  isScreenSharing: false,
  
  // UI state
  isChatVisible: false,
  isParticipantsVisible: false,
  selectedLayout: 'grid', // 'grid', 'speaker', 'gallery'
  
  // Features state
  features: {
    chat: true,
    screenShare: true,
    recording: false,
    whiteboard: false,
    breakoutRooms: false
  }
};

// Action types
const ActionTypes = {
  // Connection actions
  SET_CONNECTING: 'SET_CONNECTING',
  SET_CONNECTED: 'SET_CONNECTED',
  SET_DISCONNECTED: 'SET_DISCONNECTED',
  SET_CONNECTION_ERROR: 'SET_CONNECTION_ERROR',
  
  // Room actions
  SET_CURRENT_ROOM: 'SET_CURRENT_ROOM',
  ADD_PARTICIPANT: 'ADD_PARTICIPANT',
  REMOVE_PARTICIPANT: 'REMOVE_PARTICIPANT',
  UPDATE_PARTICIPANT: 'UPDATE_PARTICIPANT',
  SET_PARTICIPANTS: 'SET_PARTICIPANTS',
  
  // User actions
  SET_CURRENT_USER: 'SET_CURRENT_USER',
  SET_USER_ROLE: 'SET_USER_ROLE',
  
  // Media actions
  SET_LOCAL_STREAM: 'SET_LOCAL_STREAM',
  TOGGLE_VIDEO: 'TOGGLE_VIDEO',
  TOGGLE_AUDIO: 'TOGGLE_AUDIO',
  SET_SCREEN_SHARING: 'SET_SCREEN_SHARING',
  
  // UI actions
  TOGGLE_CHAT: 'TOGGLE_CHAT',
  TOGGLE_PARTICIPANTS: 'TOGGLE_PARTICIPANTS',
  SET_LAYOUT: 'SET_LAYOUT',
  
  // Features actions
  SET_FEATURES: 'SET_FEATURES',
  TOGGLE_FEATURE: 'TOGGLE_FEATURE'
};

// Reducer
function videoCallReducer(state, action) {
  switch (action.type) {
    // Connection actions
    case ActionTypes.SET_CONNECTING:
      return { ...state, isConnecting: true, connectionError: null };
    
    case ActionTypes.SET_CONNECTED:
      return { ...state, isConnected: true, isConnecting: false, connectionError: null };
    
    case ActionTypes.SET_DISCONNECTED:
      return { ...state, isConnected: false, isConnecting: false, currentRoom: null };
    
    case ActionTypes.SET_CONNECTION_ERROR:
      return { ...state, connectionError: action.payload, isConnecting: false };
    
    // Room actions
    case ActionTypes.SET_CURRENT_ROOM:
      return { ...state, currentRoom: action.payload };
    
    case ActionTypes.ADD_PARTICIPANT:
      return {
        ...state,
        participants: [...state.participants, action.payload]
      };
    
    case ActionTypes.REMOVE_PARTICIPANT:
      return {
        ...state,
        participants: state.participants.filter(p => p.id !== action.payload)
      };
    
    case ActionTypes.UPDATE_PARTICIPANT:
      return {
        ...state,
        participants: state.participants.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        )
      };
    
    case ActionTypes.SET_PARTICIPANTS:
      return { ...state, participants: action.payload };
    
    // User actions
    case ActionTypes.SET_CURRENT_USER:
      return { ...state, currentUser: action.payload };
    
    case ActionTypes.SET_USER_ROLE:
      return { ...state, userRole: action.payload };
    
    // Media actions
    case ActionTypes.SET_LOCAL_STREAM:
      return { ...state, localStream: action.payload };
    
    case ActionTypes.TOGGLE_VIDEO:
      return { ...state, isVideoEnabled: !state.isVideoEnabled };
    
    case ActionTypes.TOGGLE_AUDIO:
      return { ...state, isAudioEnabled: !state.isAudioEnabled };
    
    case ActionTypes.SET_SCREEN_SHARING:
      return { ...state, isScreenSharing: action.payload };
    
    // UI actions
    case ActionTypes.TOGGLE_CHAT:
      return { ...state, isChatVisible: !state.isChatVisible };
    
    case ActionTypes.TOGGLE_PARTICIPANTS:
      return { ...state, isParticipantsVisible: !state.isParticipantsVisible };
    
    case ActionTypes.SET_LAYOUT:
      return { ...state, selectedLayout: action.payload };
    
    // Features actions
    case ActionTypes.SET_FEATURES:
      return { ...state, features: { ...state.features, ...action.payload } };
    
    case ActionTypes.TOGGLE_FEATURE:
      return {
        ...state,
        features: {
          ...state.features,
          [action.payload]: !state.features[action.payload]
        }
      };
    
    default:
      return state;
  }
}

// Create context
const VideoCallContext = createContext();

// Provider component
export function VideoCallProvider({ children, config = {} }) {
  const [state, dispatch] = useReducer(videoCallReducer, {
    ...initialState,
    features: { ...initialState.features, ...config.features }
  });

  // Action creators
  const actions = {
    // Connection actions
    setConnecting: useCallback(() => {
      dispatch({ type: ActionTypes.SET_CONNECTING });
    }, []),

    setConnected: useCallback(() => {
      dispatch({ type: ActionTypes.SET_CONNECTED });
      toast.success('Connected to video call!');
    }, []),

    setDisconnected: useCallback(() => {
      dispatch({ type: ActionTypes.SET_DISCONNECTED });
      toast.info('Disconnected from video call');
    }, []),

    setConnectionError: useCallback((error) => {
      dispatch({ type: ActionTypes.SET_CONNECTION_ERROR, payload: error });
      toast.error(`Connection error: ${error}`);
    }, []),

    // Room actions
    setCurrentRoom: useCallback((room) => {
      dispatch({ type: ActionTypes.SET_CURRENT_ROOM, payload: room });
    }, []),

    addParticipant: useCallback((participant) => {
      dispatch({ type: ActionTypes.ADD_PARTICIPANT, payload: participant });
      toast.info(`${participant.name} joined the call`);
    }, []),

    removeParticipant: useCallback((participantId) => {
      const participant = state.participants.find(p => p.id === participantId);
      dispatch({ type: ActionTypes.REMOVE_PARTICIPANT, payload: participantId });
      if (participant) {
        toast.info(`${participant.name} left the call`);
      }
    }, [state.participants]),

    updateParticipant: useCallback((participant) => {
      dispatch({ type: ActionTypes.UPDATE_PARTICIPANT, payload: participant });
    }, []),

    setParticipants: useCallback((participants) => {
      dispatch({ type: ActionTypes.SET_PARTICIPANTS, payload: participants });
    }, []),

    // User actions
    setCurrentUser: useCallback((user) => {
      dispatch({ type: ActionTypes.SET_CURRENT_USER, payload: user });
    }, []),

    setUserRole: useCallback((role) => {
      dispatch({ type: ActionTypes.SET_USER_ROLE, payload: role });
    }, []),

    // Media actions
    setLocalStream: useCallback((stream) => {
      dispatch({ type: ActionTypes.SET_LOCAL_STREAM, payload: stream });
    }, []),

    toggleVideo: useCallback(() => {
      dispatch({ type: ActionTypes.TOGGLE_VIDEO });
      const newState = !state.isVideoEnabled;
      toast.info(`Video ${newState ? 'enabled' : 'disabled'}`);
    }, [state.isVideoEnabled]),

    toggleAudio: useCallback(() => {
      dispatch({ type: ActionTypes.TOGGLE_AUDIO });
      const newState = !state.isAudioEnabled;
      toast.info(`Audio ${newState ? 'enabled' : 'disabled'}`);
    }, [state.isAudioEnabled]),

    setScreenSharing: useCallback((isSharing) => {
      dispatch({ type: ActionTypes.SET_SCREEN_SHARING, payload: isSharing });
      toast.info(`Screen sharing ${isSharing ? 'started' : 'stopped'}`);
    }, []),

    // UI actions
    toggleChat: useCallback(() => {
      dispatch({ type: ActionTypes.TOGGLE_CHAT });
    }, []),

    toggleParticipants: useCallback(() => {
      dispatch({ type: ActionTypes.TOGGLE_PARTICIPANTS });
    }, []),

    setLayout: useCallback((layout) => {
      dispatch({ type: ActionTypes.SET_LAYOUT, payload: layout });
      toast.info(`Layout changed to ${layout}`);
    }, []),

    // Features actions
    setFeatures: useCallback((features) => {
      dispatch({ type: ActionTypes.SET_FEATURES, payload: features });
    }, []),

    toggleFeature: useCallback((feature) => {
      dispatch({ type: ActionTypes.TOGGLE_FEATURE, payload: feature });
    }, [])
  };

  const value = {
    ...state,
    ...actions
  };

  return (
    <VideoCallContext.Provider value={value}>
      {children}
    </VideoCallContext.Provider>
  );
}

// Custom hook to use the context
export function useVideoCall() {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error('useVideoCall must be used within a VideoCallProvider');
  }
  return context;
}

export { ActionTypes };
export default VideoCallContext;