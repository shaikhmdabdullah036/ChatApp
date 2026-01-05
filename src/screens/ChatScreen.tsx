import React, { useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useChat } from '../store/ChatContext';
import MessageBubble from '../components/MessageBubble';
import { Message } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReactionOverlay } from '../components/ReactionOverlay';

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

const ChatScreen: React.FC = () => {
  const {
    state: { messages, replyTo, reactingToMessage },
    sendMessage,
    setReply,
    toggleRatingModal,
    setReactingToMessage,
    addReaction,
  } = useChat();

  const [message, setMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const handleSend = useCallback(() => {
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
      setReply(null); // 🔥 clear reply state after send
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    }
  }, [message, sendMessage, setReply]);

  const renderItem = useCallback(({ item }: { item: Message }) => {
    return <MessageBubble message={item} isUser={item.sender === 'user'} />;
  }, []);

  const renderHeader = useCallback(
    () => (
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerTitle}>Astrologer Vikram</Text>
        <TouchableOpacity onPress={toggleRatingModal}>
          <Text style={styles.endChatText}>End Chat</Text>
        </TouchableOpacity>
      </View>
    ),
    [insets.top, toggleRatingModal],
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {renderHeader()}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      {/* ✅ GLOBAL REACTION OVERLAY — ALWAYS ON TOP */}
      {reactingToMessage.messageId && reactingToMessage.position && (
        <ReactionOverlay
          visible
          position={reactingToMessage.position}
          onSelect={(emoji: any) => {
            addReaction(reactingToMessage.messageId!, emoji);
            setReactingToMessage({ messageId: '' });
          }}
        />
      )}
      {replyTo && (
        <View style={styles.replyPreview}>
          <View style={styles.replyPreviewContent}>
            <View style={styles.replyPreviewTextContainer}>
              <Text style={styles.replyPreviewSender}>
                Replying to {getSenderDisplayName(replyTo.sender)}
              </Text>
              <Text style={styles.replyPreviewText} numberOfLines={2}>
                {replyTo.text}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setReply(null)}
            >
              <Text style={styles.cancelButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom }]}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !message && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!message}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  endChatButton: {
    padding: 8,
  },
  endChatText: {
    color: '#FF3B30',
    fontWeight: '500',
  },
  messagesContainer: {
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    padding: 10,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    marginRight: 8,
    fontSize: 16,
    textAlignVertical: 'center',
  },
  sendButton: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    alignSelf: 'flex-end',
  },
  sendButtonDisabled: {
    backgroundColor: '#A7A7AA',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  replyPreview: {
    backgroundColor: 'rgba(229, 229, 234, 0.9)',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#D1D1D6',
    borderLeftWidth: 4,
    borderLeftColor: '#8E8E93',
    marginHorizontal: 8,
    marginTop: 4,
    borderRadius: 4,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  replyPreviewContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  replyPreviewTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  replyPreviewSender: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  replyPreviewText: {
    color: '#8E8E93',
    fontSize: 14,
    flex: 1,
  },
  cancelButton: {
    padding: 4,
    marginLeft: 'auto',
  },
  cancelButtonText: {
    fontSize: 18,
    color: '#8E8E93',
    fontWeight: '300',
  },
});

export default ChatScreen;
