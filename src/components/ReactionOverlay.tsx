import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';

const { width } = Dimensions.get('window');

export const ReactionOverlay = ({ visible, position, onSelect }: any) => {
  if (!visible) return null;

  const reactions = [
    '👍',
    '❤️',
    '😂',
    '😮',
    '😢',
    '🙏',
    '🔥',
    '🎉',
    '😎',
    '💯',
    '👏',
    '🤝',
    '😡',
    '🤔',
    '😍',
    '🥳',
    '🤯',
    '😭',
    '💔',
    '🚀',
    '🙌',
    '👀',
    '😴',
    '🤗',
    '😬',
    '🤡',
  ];

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View
        style={[
          styles.palette,
          {
            left: Math.max(10, Math.min(width - 280, position.x - 120)),
            top: position.y,
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {reactions.map(emoji => (
            <TouchableOpacity
              key={emoji}
              onPress={() => onSelect(emoji)}
              style={styles.emojiButton}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    elevation: 99999,
  },
  palette: {
    position: 'absolute',
    width: 260, // shows only 6 emojis
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 25,
  },
  scrollContent: {
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  emojiButton: {
    paddingHorizontal: 6,
  },
  emoji: {
    fontSize: 26,
  },
});
