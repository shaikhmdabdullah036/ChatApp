import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Message } from '../types';
import { useChat } from '../store/ChatContext';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const SWIPE_THRESHOLD = 40;

interface Props {
  message: Message;
  isUser: boolean;
}

// Helper function to get sender display name
const getSenderDisplayName = (sender: Message['sender']): string => {
  switch (sender) {
    case 'user':
      return 'You';
    case 'system':
      return 'System';
    case 'human_astrologer':
      return 'Astrologer Vikram';
    case 'ai_astrologer':
      return 'AI Astrologer';
    default:
      return 'Astrologer Vikram';
  }
};

const MessageBubble: React.FC<Props> = ({ message, isUser }) => {
  const { setReply, setReactingToMessage, updateMessageFeedback, state } =
    useChat();
  const translateX = useRef(new Animated.Value(0)).current;
  const containerRef = useRef<View>(null);

  // Animation values for feedback chips
  const chipHeight = useRef(new Animated.Value(0)).current;
  const chipOpacity = useRef(new Animated.Value(0)).current;
  const chipScale = useRef(new Animated.Value(0.8)).current;

  if (!message || !message.id) {
    return null;
  }

  const isAIMessage = message.sender === 'ai_astrologer';
  const isDisliked = message.feedbackType === 'disliked';

  // Find the message being replied to
  const repliedToMessage = message.replyTo
    ? state.messages.find(msg => msg.id === message.replyTo)
    : null;

  // Animate chips when dislike is selected
  useEffect(() => {
    if (isDisliked) {
      Animated.parallel([
        Animated.timing(chipHeight, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(chipOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.spring(chipScale, {
          toValue: 1,
          damping: 6,
          stiffness: 100,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(chipHeight, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(chipOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(chipScale, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isDisliked, chipHeight, chipOpacity, chipScale]);

  const handleSwipe = useCallback(
    ({ nativeEvent }: any) => {
      if (nativeEvent.state === State.ACTIVE) {
        const dragX = isUser
          ? Math.min(0, nativeEvent.translationX)
          : Math.max(0, nativeEvent.translationX);

        translateX.setValue(dragX * 0.6);
      }

      if (nativeEvent.state === State.END) {
        const shouldReply =
          Math.abs(nativeEvent.translationX) > SWIPE_THRESHOLD;

        Animated.timing(translateX, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }).start(() => {
          if (shouldReply) {
            setReply(message);
          }
        });
      }
    },
    [isUser, message, setReply, translateX],
  );

  const handleLongPress = useCallback(() => {
    containerRef.current?.measureInWindow((x, y) => {
      setReactingToMessage({
        messageId: message.id,
        position: { x, y },
      });
    });
  }, [message.id, setReactingToMessage]);

  // Animated styles
  const animatedMessageStyle = {
    transform: [{ translateX: translateX }],
  };

  const animatedChipsContainerStyle = {
    opacity: chipOpacity,
    maxHeight: chipHeight.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 100],
    }),
  };

  const animatedChipStyle = {
    transform: [{ scale: chipScale }],
    opacity: chipOpacity,
  };

  const handleFeedbackToggle = useCallback(
    (type: 'liked' | 'disliked') => {
      try {
        if (message.feedbackType === type) {
          // If clicking the same button, deselect it
          updateMessageFeedback({
            messageId: message.id,
            feedbackType: null,
            dislikeReason: null,
          });
        } else {
          // Select the new feedback type
          updateMessageFeedback({
            messageId: message.id,
            feedbackType: type,
            dislikeReason: null, // Reset dislikeReason when changing feedback type
          });
        }
      } catch (error) {
        console.error('Error updating feedback:', error);
      }
    },
    [message.id, message.feedbackType, updateMessageFeedback],
  );

  const handleChipSelect = useCallback(
    (reason: 'inaccurate' | 'too_vague' | 'too_long') => {
      try {
        updateMessageFeedback({
          messageId: message.id,
          feedbackType: 'disliked',
          dislikeReason: reason,
        });
      } catch (error) {
        console.error('Error selecting chip:', error);
      }
    },
    [message.id, updateMessageFeedback],
  );

  return (
    <View ref={containerRef} style={styles.container}>
      <PanGestureHandler
        enabled={!isUser}
        onGestureEvent={handleSwipe}
        onHandlerStateChange={handleSwipe}
      >
        <Animated.View
          style={[
            styles.messageWrapper,
            {
              alignSelf: isUser ? 'flex-end' : 'flex-start',
              backgroundColor: isUser ? '#007AFF' : '#E5E5EA',
            },
            animatedMessageStyle,
          ]}
        >
          <TouchableOpacity onLongPress={handleLongPress} delayLongPress={250}>
            {repliedToMessage && (
              <View
                style={[
                  styles.replyIndicator,
                  isUser
                    ? styles.replyIndicatorUser
                    : styles.replyIndicatorOther,
                ]}
              >
                <View style={styles.replyIndicatorLine} />
                <View style={styles.replyIndicatorContent}>
                  <Text
                    style={[
                      styles.replyIndicatorSender,
                      isUser
                        ? styles.replyIndicatorSenderUser
                        : styles.replyIndicatorSenderOther,
                    ]}
                  >
                    {getSenderDisplayName(repliedToMessage.sender)}
                  </Text>
                  <Text
                    style={[
                      styles.replyIndicatorText,
                      isUser
                        ? styles.replyIndicatorTextUser
                        : styles.replyIndicatorTextOther,
                    ]}
                    numberOfLines={1}
                  >
                    {repliedToMessage.text}
                  </Text>
                </View>
              </View>
            )}
            <Text style={isUser ? styles.userText : styles.otherText}>
              {message.text}
            </Text>
          </TouchableOpacity>
          {!!message.reactions?.length && (
            <View
              style={[
                styles.reactionBar,
                isUser ? styles.reactionBarUser : styles.reactionBarOther,
              ]}
            >
              {Object.entries(
                message.reactions.reduce((a: any, e: string) => {
                  a[e] = (a[e] || 0) + 1;
                  return a;
                }, {}),
              ).map(([emoji, count]) => (
                <View key={emoji} style={styles.reactionBadge}>
                  <Text>{emoji}</Text>
                  {(count as number) > 1 && (
                    <Text style={styles.reactionCount}>{count as number}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      </PanGestureHandler>

      {/* Like/Dislike Toggle for AI Messages */}
      {isAIMessage && (
        <View style={styles.feedbackContainer}>
          <View style={styles.feedbackToggle}>
            <TouchableOpacity
              style={[
                styles.feedbackButton,
                message.feedbackType === 'liked' && styles.feedbackButtonActive,
              ]}
              onPress={() => handleFeedbackToggle('liked')}
            >
              <Text
                style={[
                  styles.feedbackButtonText,
                  message.feedbackType === 'liked' &&
                    styles.feedbackButtonTextActive,
                ]}
              >
                👍 Like
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.feedbackButton,
                message.feedbackType === 'disliked' &&
                  styles.feedbackButtonActive,
              ]}
              onPress={() => handleFeedbackToggle('disliked')}
            >
              <Text
                style={[
                  styles.feedbackButtonText,
                  message.feedbackType === 'disliked' &&
                    styles.feedbackButtonTextActive,
                ]}
              >
                👎 Dislike
              </Text>
            </TouchableOpacity>
          </View>

          {/* Animated Feedback Chips */}
          {isDisliked && (
            <Animated.View
              pointerEvents="auto"
              style={[styles.chipsContainer, animatedChipsContainerStyle]}
            >
              {['inaccurate', 'too_vague', 'too_long'].map(reason => {
                const reasonKey = reason as
                  | 'inaccurate'
                  | 'too_vague'
                  | 'too_long';
                const isSelected = message.dislikeReason === reasonKey;

                return (
                  <Animated.View key={reason} style={animatedChipStyle}>
                  <TouchableOpacity
                    disabled={!isDisliked}
                    style={[
                      styles.feedbackChip,
                      isSelected && styles.feedbackChipSelected,
                    ]}
                    onPress={() => handleChipSelect(reasonKey)}
                  >
                    <Text
                      style={[
                        styles.feedbackChipText,
                        isSelected && styles.feedbackChipTextSelected,
                      ]}
                    >
                      {reason === 'inaccurate'
                        ? 'Inaccurate'
                        : reason === 'too_vague'
                        ? 'Too Vague'
                        : 'Too Long'}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
            </Animated.View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: hp('0.4%'),
    paddingHorizontal: wp('3%'),
  },
  messageWrapper: {
    maxWidth: wp('75%'),
    borderRadius: wp('4%'),
    padding: wp('3%'),
    position: 'relative',
    paddingBottom: wp('4%'),
  },
  userText: { color: '#fff', fontSize: 16 },
  otherText: { color: '#000', fontSize: 16 },
  replyIndicator: {
    marginBottom: 6,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(255, 255, 255, 0.5)',
  },
  replyIndicatorUser: {
    borderLeftColor: 'rgba(255, 255, 255, 0.5)',
  },
  replyIndicatorOther: {
    borderLeftColor: 'rgba(0, 0, 0, 0.3)',
  },
  replyIndicatorLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  replyIndicatorContent: {
    paddingLeft: 4,
  },
  replyIndicatorSender: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  replyIndicatorSenderUser: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  replyIndicatorSenderOther: {
    color: 'rgba(0, 0, 0, 0.6)',
  },
  replyIndicatorText: {
    fontSize: 13,
  },
  replyIndicatorTextUser: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  replyIndicatorTextOther: {
    color: 'rgba(0, 0, 0, 0.7)',
  },

  reactionBar: {
    position: 'absolute',
    bottom: -8,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  reactionBarUser: {
    right: 8,
  },
  reactionBarOther: {
    left: 8,
  },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
  },
  reactionCount: {
    fontSize: 11,
    marginLeft: 2,
    color: '#555',
  },
  feedbackContainer: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  feedbackToggle: {
    flexDirection: 'row',
  },
  feedbackButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginRight: 8,
  },
  feedbackButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  feedbackButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  feedbackButtonTextActive: {
    color: '#FFFFFF',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    overflow: 'hidden',
  },
  feedbackChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginRight: 6,
    marginBottom: 6,
  },
  feedbackChipSelected: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  feedbackChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  feedbackChipTextSelected: {
    color: '#FFFFFF',
  },
});

export default MessageBubble;
