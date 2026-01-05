import React, {
  createContext,
  useReducer,
  useContext,
  useCallback,
} from 'react';
import { Message, ChatState, FeedbackType } from '../types';

type Action =
  | { type: 'SEND_MESSAGE'; payload: Message }
  | { type: 'SET_REPLY'; payload: Message | null }
  | { type: 'SET_SELECTED_MESSAGE'; payload: string | null }
  | { type: 'TOGGLE_FEEDBACK_OPTIONS' }
  | {
      type: 'SET_FEEDBACK';
      payload: { messageId: string | null; type: FeedbackType };
    }
  | {
      type: 'UPDATE_MESSAGE_FEEDBACK';
      payload: {
        messageId: string;
        feedbackType: 'liked' | 'disliked' | null;
        dislikeReason?: 'inaccurate' | 'too_vague' | 'too_long' | null;
      };
    }
  | { type: 'TOGGLE_RATING_MODAL' }
  | { type: 'SET_RATING'; payload: number }
  | { type: 'ADD_REACTION'; payload: { messageId: string; emoji: string } }
  | { type: 'SET_REACTING_TO_MESSAGE'; payload: ReactingToMessagePayload };

const initialState: ChatState = {
  messages: [],
  replyTo: null,
  selectedMessageId: null,
  showFeedbackOptions: false,
  showRatingModal: false,
  rating: 0,
  feedback: {
    messageId: null,
    type: null,
  },
  reactingToMessage: {
    messageId: '',
    position: { x: 0, y: 0 },
  },
};

const chatReducer = (state: ChatState, action: Action): ChatState => {
  switch (action.type) {
    case 'SEND_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        replyTo: null,
      };
    case 'SET_REPLY':
      return {
        ...state,
        replyTo: action.payload,
      };
    case 'SET_SELECTED_MESSAGE':
      return {
        ...state,
        selectedMessageId: action.payload,
      };
    case 'TOGGLE_FEEDBACK_OPTIONS':
      return {
        ...state,
        showFeedbackOptions: !state.showFeedbackOptions,
      };
    case 'SET_FEEDBACK':
      return {
        ...state,
        feedback: {
          messageId: action.payload.messageId,
          type: action.payload.type,
        },
        messages: state.messages.map(msg =>
          msg.id === action.payload.messageId
            ? { ...msg, feedbackType: action.payload.type ? 'disliked' : null }
            : msg,
        ),
      };
    case 'UPDATE_MESSAGE_FEEDBACK':
      if (!action.payload.messageId) {
        return state;
      }
      // Safety check: ensure messages array exists
      if (!state.messages || !Array.isArray(state.messages)) {
        return state;
      }
      const newMessages = state.messages.map(msg => {
        if (msg && msg.id === action.payload.messageId) {
          const updatedMsg: Message = {
            ...msg,
            feedbackType: action.payload.feedbackType,
          };
          // Handle dislikeReason update
          if (action.payload.dislikeReason !== undefined) {
            updatedMsg.dislikeReason = action.payload.dislikeReason;
          } else if (action.payload.feedbackType !== 'disliked') {
            // Clear dislikeReason when not disliked
            updatedMsg.dislikeReason = null;
          }
          return updatedMsg;
        }
        return msg;
      });
      return {
        ...state,
        messages: newMessages,
      };
    case 'TOGGLE_RATING_MODAL':
      return {
        ...state,
        showRatingModal: !state.showRatingModal,
        rating: !state.showRatingModal ? 0 : state.rating,
      };
    case 'SET_REACTING_TO_MESSAGE':
      return {
        ...state,
        reactingToMessage: action.payload,
      };
    case 'SET_RATING':
      return {
        ...state,
        rating: action.payload,
      };
    case 'ADD_REACTION':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.messageId
            ? {
                ...msg,
                reactions: [...(msg.reactions || []), action.payload.emoji],
              }
            : msg,
        ),
      };
    default:
      return state;
  }
};

interface ReactingToMessagePayload {
  messageId: string;
  position?: { x: number; y: number };
}

const ChatContext = createContext<{
  state: ChatState;
  dispatch: React.Dispatch<Action>;
  sendMessage: (text: string) => void;
  setReply: (message: Message | null) => void;
  setSelectedMessage: (id: string | null) => void;
  toggleFeedbackOptions: () => void;
  setFeedback: (messageId: string | null, type: FeedbackType) => void;
  updateMessageFeedback: (payload: {
    messageId: string;
    feedbackType: 'liked' | 'disliked' | null;
    dislikeReason?: 'inaccurate' | 'too_vague' | 'too_long' | null;
  }) => void;
  toggleRatingModal: () => void;
  setRating: (rating: number) => void;
  addReaction: (messageId: string, emoji: string) => void;

  setReactingToMessage: (payload: ReactingToMessagePayload) => void;
}>({
  state: initialState,
  dispatch: () => null,
  sendMessage: () => {},
  setReply: () => {},
  setSelectedMessage: () => {},
  toggleFeedbackOptions: () => {},
  setFeedback: () => {},
  updateMessageFeedback: () => {},
  toggleRatingModal: () => {},
  setRating: () => {},
  addReaction: () => {},
  setReactingToMessage: () => {},
});

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(chatReducer, {
    ...initialState,
    messages: [
      {
        id: '1',
        sender: 'system',
        text: 'Your session with Astrologer Vikram has started.',
        timestamp: 1734681480000,
        type: 'event',
      },
      {
        id: '2',
        sender: 'user',
        text: 'Namaste. I am feeling very anxious about my current job. Can you look at my chart?',
        timestamp: 1734681600000,
        type: 'text',
      },
      {
        id: '3',
        sender: 'ai_astrologer',
        text: 'Namaste! I am analyzing your birth details. Currently, you are running through Shani Mahadasha. This often brings pressure but builds resilience.',
        timestamp: 1734681660000,
        type: 'ai',
        hasFeedback: true,
        feedbackType: 'liked',
      },
      {
        id: '4',
        sender: 'human_astrologer',
        text: 'I see the same. Look at your 6th house; Saturn is transiting there. This is why you feel the workload is heavy.',
        timestamp: 1734681720000,
        type: 'human',
      },
      {
        id: '5',
        sender: 'user',
        text: 'Is there any remedy for this? I find it hard to focus.',
        timestamp: 1734681780000,
        type: 'text',
        replyTo: '4',
      },
      {
        id: '6',
        sender: 'ai_astrologer',
        text: 'I suggest chanting the Shani Mantra 108 times on Saturdays. Would you like the specific mantra text?',
        timestamp: 1734681840000,
        type: 'ai',
        hasFeedback: false,
      },
    ],
  });

  const sendMessage = useCallback(
    (text: string) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: 'user',
        text,
        timestamp: Date.now(),
        type: 'text',
        replyTo: state.replyTo ? state.replyTo.id : undefined,
      };
      dispatch({ type: 'SEND_MESSAGE', payload: newMessage });
    },
    [state.replyTo],
  );

  const setReply = useCallback((message: Message | null) => {
    dispatch({ type: 'SET_REPLY', payload: message });
  }, []);

  const setSelectedMessage = useCallback((id: string | null) => {
    dispatch({ type: 'SET_SELECTED_MESSAGE', payload: id });
  }, []);

  const setReactingToMessage = useCallback(
    (payload: { messageId: string; position: { x: number; y: number } }) => {
      dispatch({ type: 'SET_REACTING_TO_MESSAGE', payload });
    },
    [],
  );

  const toggleFeedbackOptions = useCallback(() => {
    dispatch({ type: 'TOGGLE_FEEDBACK_OPTIONS' });
  }, []);

  const setFeedback = useCallback(
    (messageId: string | null, type: FeedbackType) => {
      dispatch({ type: 'SET_FEEDBACK', payload: { messageId, type } });
    },
    [],
  );

  const updateMessageFeedback = useCallback(
    (payload: {
      messageId: string;
      feedbackType: 'liked' | 'disliked' | null;
      dislikeReason?: 'inaccurate' | 'too_vague' | 'too_long' | null;
    }) => {
      dispatch({ type: 'UPDATE_MESSAGE_FEEDBACK', payload });
    },
    [],
  );

  const toggleRatingModal = useCallback(() => {
    dispatch({ type: 'TOGGLE_RATING_MODAL' });
  }, []);

  const setRating = useCallback((rating: number) => {
    dispatch({ type: 'SET_RATING', payload: rating });
  }, []);

  const addReaction = useCallback((messageId: string, emoji: string) => {
    dispatch({ type: 'ADD_REACTION', payload: { messageId, emoji } });
  }, []);

  return (
    <ChatContext.Provider
      value={{
        state,
        dispatch,
        sendMessage,
        setReply,
        setSelectedMessage,
        toggleFeedbackOptions,
        setFeedback,
        updateMessageFeedback,
        toggleRatingModal,
        setRating,
        addReaction,
        setReactingToMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
