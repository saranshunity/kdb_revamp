/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* <NewAppScreen
        templateFileName="App.tsx"
        safeAreaInsets={safeAreaInsets}
      /> */}
      <Text style={styles.text}>Bold Text</Text>
      <Text style={styles.mediumText}>Medium Text</Text>
      <Text style={styles.regularText}>Regular Text</Text>
      <Text style={styles.semiBoldText}>Semi Bold Text</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  text: {
    fontSize: 20,
    fontWeight: '700',
    color: 'yellow',
    fontFamily: 'Gilroy-Bold',
  },
  mediumText: {
    fontSize: 20,
    fontWeight: '500',
    color: 'green',
    fontFamily: 'Gilroy-Medium',
  },
  regularText: {
    fontSize: 20,
    fontWeight: '400',
    color: 'blue',
    fontFamily: 'Gilroy-Regular',
  },
  semiBoldText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'red',
    fontFamily: 'Gilroy-SemiBold',
  },
});

export default App;
