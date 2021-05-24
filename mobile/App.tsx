import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, Button, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/dist/FontAwesome';

const Tab = createBottomTabNavigator();
const RightDrawer = createDrawerNavigator();
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function RootScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>RootScreen</Text>
      <Button title="-> LOGIN" onPress={() => navigation.replace('Login')} />
    </View>
  );
}

function LoginScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>LoginScreen</Text>
      <Button title="-> MAIN" onPress={() => navigation.replace('Main')} />
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

function CustomDrawerContent(props) {
  return (
      <FlatList style={{ paddingTop: 10 }} data={[ 'test1', 'test2', 'test3' ]} keyExtractor={item => item + 4} renderItem={({item,index}) => <DrawerItem label={item} onPress={() => alert(index)} />} />
  );
}

function FeedNavScreen() {
  return (
    <RightDrawer.Navigator navigationOptions={{title: 'ro'}} drawerPosition={'right'} drawerContent={(props) => <CustomDrawerContent {...props}  />}>
      <RightDrawer.Screen name="FeedScreen" component={FeedScreen} />
    </RightDrawer.Navigator>
  )
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
    <Tab.Navigator tabBarOptions={{showLabel: false}} >
      <Tab.Screen name="Feed" component={FeedNavScreen} 
          options={{ tabBarIcon: ({ color, size }) => (
            <Icon name="picture-o" size={size} color={color} solid />
          )}} />
      <Tab.Screen name="Contact" component={ContactScreen} 
          options={{ tabBarIcon: ({ color, size }) => (
            <Icon name="users" size={size} color={color} solid />
          )}} />
      <Tab.Screen name="Personal" component={PersonalScreen} 
          options={{ tabBarIcon: ({ color, size }) => (
            <Icon name="user" size={size} color={color} solid />
          )}} />
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

