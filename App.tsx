/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { ChatProvider } from '../src/store/ChatContext';
import ChatScreen from './src/screens/ChatScreen';
import RatingModal from './src/components/RatingModal';
import { StatusBar } from 'react-native';
import { ChatProvider } from './src/store/ChatContext';

export type RootStackParamList = {
  Chat: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ChatProvider>
          <StatusBar barStyle="dark-content" />
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="Chat" component={ChatScreen} />
            </Stack.Navigator>
          </NavigationContainer>
          <RatingModal />
        </ChatProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
