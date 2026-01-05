# MyNaksh Chat Application

A modern, interactive chat application built with React Native, featuring AI-driven and human-led astrological consultations with smooth UI interactions.

## 🚀 Features

- **Swipe-to-Reply**: Swipe messages to quickly reply
- **Message Reactions**: Add emoji reactions to messages
- **AI Feedback System**: Rate AI responses with like/dislike and feedback options
- **Smooth Animations**: Built with React Native's Animated API for smooth interactions
- **Modern UI**: Clean and intuitive user interface

## 📋 Prerequisites

- Node.js (v20 or newer)
- npm or Yarn
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- CocoaPods (for iOS)
- Java Development Kit (JDK) for Android

## 🛠 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/MyNaksh-ChatAppNew.git
   cd MyNaksh-ChatAppNew
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Install iOS dependencies** (macOS only)
   ```bash
   cd ios && pod install && cd ..
   ```

## 🚀 Steps to Run the App

### Android

**Option 1: Using npm scripts (Recommended)**

```bash
# Terminal 1: Start Metro bundler
npm start

# Terminal 2: Build and run on Android device/emulator
npm run android
```

**Option 2: Using React Native CLI**

```bash
# Terminal 1: Start Metro bundler
npx react-native start

# Terminal 2: Run Android app
npx react-native run-android
```

**Option 3: Manual Build**

```bash
# Clean build (if needed)
cd android && ./gradlew clean && cd ..

# Build Debug APK
cd android && ./gradlew assembleDebug && cd ..

# Build Release APK
cd android && ./gradlew assembleRelease && cd ..

# APK location: android/app/build/outputs/apk/debug/app-debug.apk
```

**Troubleshooting Android:**
- If you encounter build errors, try: `cd android && ./gradlew clean && cd ..`
- Make sure you have an Android emulator running or a device connected via USB with USB debugging enabled
- Check that `ANDROID_HOME` environment variable is set correctly

### iOS (macOS only)

**Option 1: Using npm scripts (Recommended)**

```bash
# Install CocoaPods dependencies (first time only)
cd ios && pod install && cd ..

# Terminal 1: Start Metro bundler
npm start

# Terminal 2: Run iOS app
npm run ios
```

**Option 2: Using React Native CLI**

```bash
# Install CocoaPods if not already installed
sudo gem install cocoapods

# Install iOS dependencies
cd ios && pod install && cd ..

# Terminal 1: Start Metro bundler
npx react-native start

# Terminal 2: Run iOS app
npx react-native run-ios
```

**Option 3: Using Xcode**

```bash
# Install pods
cd ios && pod install && cd ..

# Open workspace in Xcode
open ios/ChatAppNew.xcworkspace

# Select a simulator or device and click Run
```

**Troubleshooting iOS:**
- If pods fail to install, try: `cd ios && pod deintegrate && pod install && cd ..`
- Make sure Xcode Command Line Tools are installed: `xcode-select --install`
- Ensure CocoaPods is up to date: `sudo gem install cocoapods`

### Quick Start Commands

```bash
# Start Metro bundler with cache cleared
npm start -- --reset-cache

# Run Android
npm run android

# Run iOS
npm run ios

# Run linting
npm run lint

# Run tests
npm test
```

## 🎨 Technical Architecture

### Animation System: React Native Animated API

This application uses **React Native's built-in Animated API** (not Reanimated 3) for all animations. The Animated API provides a powerful and performant way to create smooth animations that run on the native thread.

**How it's used in this app:**

1. **Message Swipe Animation** (`MessageBubble.tsx`):
   - Uses `Animated.Value` to track swipe translation
   - `Animated.timing` for smooth swipe-to-reply animations
   - Animations run on the native thread for 60fps performance

2. **Feedback Chips Animation** (`MessageBubble.tsx`):
   - `Animated.Value` for chip height, opacity, and scale
   - `Animated.parallel` to run multiple animations simultaneously
   - `Animated.spring` for natural bounce effects when chips appear
   - `Animated.timing` for smooth fade in/out transitions

3. **Rating Modal Animation** (`RatingModal.tsx`):
   - Fade and slide animations for modal appearance
   - Star animation with spring physics for engaging interactions
   - Smooth transitions using `Animated.timing` and `Animated.spring`

**Key Benefits:**
- ✅ Native thread execution for smooth 60fps animations
- ✅ Declarative API that's easy to understand and maintain
- ✅ Built into React Native (no additional dependencies)
- ✅ Excellent performance for most animation needs

**Example Usage:**
```typescript
// Create animated value
const translateX = useRef(new Animated.Value(0)).current;

// Animate
Animated.timing(translateX, {
  toValue: 100,
  duration: 300,
  useNativeDriver: false, // For layout properties
}).start();

// Use in style
<Animated.View style={{ transform: [{ translateX }] }}>
  {/* Content */}
</Animated.View>
```

### Gesture Handling: React Native Gesture Handler

The app uses **react-native-gesture-handler** for native gesture recognition, providing better performance and more natural gesture interactions compared to React Native's built-in gesture system.

**How it's used:**

1. **Swipe-to-Reply Gesture** (`MessageBubble.tsx`):
   - `PanGestureHandler` detects horizontal swipe gestures
   - Tracks gesture state (ACTIVE, END) for precise control
   - Calculates swipe distance and triggers reply action when threshold is met
   - Provides smooth, native-feeling swipe interactions

2. **Gesture Benefits:**
   - Runs on the UI thread for responsive interactions
   - Better touch handling than React Native's built-in PanResponder
   - Supports complex gesture recognition
   - Works seamlessly with React Navigation

**Example Usage:**
```typescript
<PanGestureHandler
  enabled={!isUser}
  onGestureEvent={handleSwipe}
  onHandlerStateChange={handleSwipe}
>
  <Animated.View>
    {/* Message content */}
  </Animated.View>
</PanGestureHandler>
```

### State Management: React Context API with useReducer

The application uses **React Context API** combined with **useReducer** for state management. This approach provides a centralized, predictable state management solution without external dependencies.

**Architecture:**

1. **ChatContext** (`src/store/ChatContext.tsx`):
   - Centralized state management for all chat-related data
   - Uses `useReducer` for predictable state updates
   - Provides context via `ChatProvider` component
   - Exposes state and actions through `useChat` hook

2. **State Structure:**
   - Messages array with full message history
   - Reply-to message tracking
   - Message reactions and feedback
   - Rating modal state
   - UI state (selected messages, feedback options)

3. **Action Types:**
   - `SEND_MESSAGE`: Add new message to chat
   - `SET_REPLY`: Set message to reply to
   - `UPDATE_MESSAGE_FEEDBACK`: Update like/dislike feedback
   - `ADD_REACTION`: Add emoji reaction to message
   - `TOGGLE_RATING_MODAL`: Show/hide rating modal
   - And more...

**Why Context API over Redux/Zustand:**
- ✅ No external dependencies - built into React
- ✅ Simpler setup and maintenance
- ✅ Sufficient for this app's state management needs
- ✅ Easy to understand and debug
- ✅ Good performance for this use case
- ✅ TypeScript support out of the box

**Example Usage:**
```typescript
// In component
const { state, sendMessage, updateMessageFeedback } = useChat();

// Access state
const messages = state.messages;

// Dispatch actions
sendMessage(newMessage);
updateMessageFeedback({ messageId, feedbackType: 'liked' });
```

**State Flow:**
```
Component → useChat() → ChatContext → chatReducer → Updated State → Component Re-render
```

## 🛠 Project Structure

```
src/
├── assets/          # Images, fonts, and other static files
├── components/      # Reusable UI components
│   ├── MessageBubble.tsx    # Individual message component with animations
│   └── RatingModal.tsx       # Rating modal with animations
├── constants/       # App constants and configurations
├── hooks/           # Custom React hooks
├── navigation/      # Navigation configuration
├── screens/         # App screens
│   └── ChatScreen.tsx        # Main chat interface
├── store/           # State management
│   └── ChatContext.tsx       # Context API with useReducer
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## 📱 Key Dependencies

- **[React Native](https://reactnative.dev/)** - Framework for building mobile apps
- **[React Navigation](https://reactnavigation.org/)** - Routing and navigation
- **[React Native Animated API](https://reactnative.dev/docs/animated)** - Built-in animation system
- **[React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)** - Native gesture recognition
- **[React Context API](https://react.dev/reference/react/useContext)** - State management
- **[TypeScript](https://www.typescriptlang.org/)** - Type checking

## 🛠 Build Commands

### Android

```bash
# Clean build
cd android && ./gradlew clean && cd ..

# Build Debug APK
cd android && ./gradlew assembleDebug && cd ..

# Build Release APK
cd android && ./gradlew assembleRelease && cd ..

# Build Release Bundle (for Play Store)
cd android && ./gradlew bundleRelease && cd ..
```

**APK Locations:**
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`
- Bundle: `android/app/build/outputs/bundle/release/app-release.aab`

### iOS

```bash
# Install pods
cd ios && pod install && cd ..

# Build from Xcode
open ios/ChatAppNew.xcworkspace
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React Native Community](https://github.com/react-native-community)
- [React Navigation](https://reactnavigation.org/)
- All contributors who have helped shape this project

## 🔧 Troubleshooting

### Common Issues

**Metro bundler cache issues:**
```bash
npm start -- --reset-cache
```

**Android build failures:**
```bash
cd android && ./gradlew clean && cd ..
rm -rf android/app/build android/build
npm run android
```

**iOS pod installation issues:**
```bash
cd ios && pod deintegrate && pod install && cd ..
```

**Native module linking issues:**
- Make sure all dependencies are installed: `npm install`
- Clean and rebuild: `cd android && ./gradlew clean && cd ..`
- For iOS: `cd ios && pod install && cd ..`

For more troubleshooting help, see the [React Native Troubleshooting Guide](https://reactnative.dev/docs/troubleshooting).
