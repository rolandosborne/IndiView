import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Button, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function RootScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>RootScreen</Text>
      <Button title="-> LOGIN" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}

function LoginScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>LoginScreen</Text>
      <Button title="-> MAIN" onPress={() => navigation.navigate('Main')} />
    </View>
  );
}

function MainScreen() {
  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Search" component={SearchScreen} />
      <Drawer.Screen name="Label" component={LabelScreen} />
    </Drawer.Navigator>
  );
}

function FeedScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Feed</Text>
    </View>
  );
}

function ContactScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Contact</Text>
    </View>
  );
}

function PersonalScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Personal</Text>
    </View>
  );
}

function HomeScreen({ navigation }) {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Contact" component={ContactScreen} />
      <Tab.Screen name="Personal" component={PersonalScreen} />
    </Tab.Navigator>
  );
}

function SearchScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>SearchScreen</Text>
    </View>
  );
}

function LabelScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>LabelScreen</Text>
    </View>
  );
}

const App = () => {

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Root">
          <Stack.Screen name="Root" component={RootScreen} options={{headerShown: false}} />
          <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}} />
          <Stack.Screen name="Main" component={MainScreen} options={{headerShown: false}} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );

};

export default App;

