export type Message = {
  id: string;
  sender: 'user' | 'ai_astrologer' | 'human_astrologer' | 'system';
  text: string;
  timestamp: number;
  type: 'text' | 'ai' | 'human' | 'event';
  hasFeedback?: boolean;
  feedbackType?: 'liked' | 'disliked' | null;
  replyTo?: string;
  reactions?: string[];
  dislikeReason?: 'inaccurate' | 'too_vague' | 'too_long' | null;
};

export type FeedbackType = 'inaccurate' | 'tooVague' | 'tooLong' | null;

export type ChatState = {
  messages: Message[];
  replyTo: Message | null;
  selectedMessageId: string | null;
  showFeedbackOptions: boolean;
  showRatingModal: boolean;
  rating: number;
  feedback: {
    messageId: string | null;
    type: FeedbackType;
  };
  reactingToMessage: {
    messageId?: string;
    position?: { x: number; y: number };
  };
};

export type RootStackParamList = {
  Chat: undefined;
  Rating: { onRate: (rating: number) => void };
};

export type SwipeableMessageProps = {
  children: React.ReactNode;
  onSwipe: () => void;
  isUser: boolean;
};

export type MessageBubbleProps = {
  message: Message;
  onLongPress: () => void;
  onFeedback: (type: 'like' | 'dislike') => void;
  isReplying: boolean;
  onSelectReaction: (emoji: string) => void;
};
