import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useChat } from '../store/ChatContext';

const { width, height } = Dimensions.get('window');

const STAR_COUNT = 5;
const STAR_SIZE = 40;
const SPACING = 8;

const RatingModal: React.FC = () => {
  const {
    state: { showRatingModal, rating },
    toggleRatingModal,
    setRating,
  } = useChat();

  const [selectedRating, setSelectedRating] = React.useState(0);

  // Initialize animations with final values to prevent initial jump
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const starsAnim = useRef(new Animated.Value(1)).current;

  const animateIn = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    starsAnim.setValue(0);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.spring(starsAnim, {
        toValue: 1,
        damping: 5,
        stiffness: 100,
        useNativeDriver: false,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, starsAnim]);

  const animateOut = useCallback(
    (callback?: () => void) => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start((finished) => {
        if (finished && callback) {
          callback();
        }
      });
    },
    [fadeAnim, slideAnim],
  );

  const handleRating = useCallback(
    (rating: number) => {
      setSelectedRating(rating);
      // Remove the setRating call here to prevent context updates
    },
    [], // No dependencies needed
  );

  const handleSubmit = useCallback(() => {
    animateOut(toggleRatingModal);
    // Only update the context when submitting
    setRating(selectedRating);
    Alert.alert(
      'Thank You!',
      `You rated us ${selectedRating} star${
        selectedRating !== 1 ? 's' : ''
      }. Your feedback is valuable to us!`,
      [
        {
          text: 'OK',
          onPress: () => {
            setSelectedRating(0);
          },
        },
      ],
    );
  }, [selectedRating, setRating, animateOut, toggleRatingModal]);

  useEffect(() => {
    if (showRatingModal && !selectedRating) {
      animateIn();
    }
  }, [showRatingModal, animateIn]);

  if (!showRatingModal) return null;

  const starInputRange = Array.from({ length: STAR_COUNT }, (_, i) => i);
  const starOutputRange = starInputRange.map(
    (_, i) => (i + 1) * (STAR_SIZE + SPACING) * 2,
  );

  const starsAnimatedStyle = {
    transform: [
      {
        translateX: starsAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-starOutputRange[STAR_COUNT - 1] / 2, 0],
        }),
      },
    ],
  };

  const overlayAnimatedStyle = {
    opacity: fadeAnim,
  };

  const modalAnimatedStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };

  return (
    <Animated.View style={[styles.overlay, overlayAnimatedStyle]}>
      <BlurView
        style={styles.blurView}
        blurType="light"
        blurAmount={10}
        reducedTransparencyFallbackColor="white"
      >
        <Animated.View style={[styles.modal, modalAnimatedStyle]}>
          <Text style={styles.title}>How was your experience?</Text>
          <Text style={styles.subtitle}>Your feedback helps us improve</Text>

          <Animated.View style={[styles.starsContainer, starsAnimatedStyle]}>
            {Array.from({ length: STAR_COUNT }).map((_, index) => {
              const starValue = index + 1;
              const isActive = starValue <= selectedRating; // Use selectedRating instead of rating

              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.7}
                  onPress={() => handleRating(starValue)}
                >
                  <View
                    style={[
                      styles.star,
                      isActive && styles.starActive,
                    ]}
                  >
                    <Text style={styles.starText}>★</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </Animated.View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={() => {
                animateOut(toggleRatingModal);
                setSelectedRating(0);
              }}
            >
              <Text style={styles.closeButtonText}>Not Now</Text>
            </TouchableOpacity>
            {selectedRating > 0 && (
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  blurView: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: width * 0.8,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    width: STAR_SIZE,
    height: STAR_SIZE,
    borderRadius: STAR_SIZE / 2,
    backgroundColor: '#E0E0E0', // Lighter gray for better contrast
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING,
    borderWidth: 1,
    borderColor: '#BDBDBD', // Slightly darker gray border for better visibility
    // Ensure content is perfectly centered
    display: 'flex',
    flexDirection: 'row',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  starActive: {
    backgroundColor: '#FFC107', // A standard yellow/gold color for selected stars
    borderColor: '#FFA000', // Slightly darker yellow for the border
  },
  starText: {
    fontSize: 24,
    color: '#666',
    // Center the star symbol
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    lineHeight: STAR_SIZE - 2, // Adjust based on font size to center vertically
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  },
  button: {
    padding: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#f5f5f5',
  },
  submitButton: {
    backgroundColor: '#FFC107',
  },
  closeButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RatingModal;
