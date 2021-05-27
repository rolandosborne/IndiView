import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Platform, KeyboardAvoidingView, TextInput, Image, FlatList, Button, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import { Diatum } from './sdk/Diatum';
import { DiatumProvider, useDiatum } from "./sdk/DiatumContext";

const Tab = createBottomTabNavigator();
const FeedDrawer = createDrawerNavigator();
const ContactDrawer = createDrawerNavigator();
const PersonalDrawer = createDrawerNavigator();
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function RootScreen({ navigation }) {
  let diatum: Diatum = useDiatum();
  diatum.init("default.db").then(() => {
    diatum.get();
  });


  return (
    <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#282827', justifyContent: 'center' }}>
      <Text>RootScreen</Text>
      <Button title="-> LOGIN" onPress={() => navigation.replace('Login')} />
    </View>
  );
}

function LoginScreen({ navigation }) {
  const [username, onChangeUsername] = React.useState("");
  const [password, onChangePassword] = React.useState("");
  
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: '#282827', justifyContent: 'center', alignItems: 'center' }}>
      <Image source={require('./logo.png')} />
      <TextInput style={{ backgroundColor: '#fce77d', textAlign: 'center', height: 40, width: '90%', margin: 16 }} placeholder="Diatum Username" placeholderTextColor="#444444" onChangeText={onChangeUsername} value={username} />
      <TextInput style={{ backgroundColor: '#fce77d', textAlign: 'center', height: 40, width: '90%', margin: 16 }} placeholder="Portal Password" placeholderTextColor="#444444" onChangeText={onChangePassword} value={password} />
      <Button title="LOGIN" color="#ffffff" onPress={() => navigation.replace('Main')} />
    </KeyboardAvoidingView>
  );
}

function MainScreen() {
  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Search" component={SearchScreen} options={{headerShown: true}} />
      <Drawer.Screen name="Label" component={LabelScreen} options={{headerShown: true}}/>
    </Drawer.Navigator>
  );
}

function FeedDrawerContent(props) {
  return (
    <SafeAreaView>
      <Text>Story Labels</Text>
      <FlatList data={[ 'test1', 'test2' ]} keyExtractor={item => item + 4} renderItem={({item,index}) => <DrawerItem label={item} onPress={() => alert(index)} />} />
    </SafeAreaView>
  );
}

function FeedNavScreen() {
  return (
    <FeedDrawer.Navigator navigationOptions={{title: 'ro'}} drawerPosition={'right'} drawerContent={(props) => <FeedDrawerContent {...props}  />}>
      <FeedDrawer.Screen name="FeedScreen" component={FeedScreen} />
    </FeedDrawer.Navigator>
  )
}

function FeedScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Feed</Text>
    </View>
  );
}

function ContactDrawerContent(props) {
  return (
    <SafeAreaView>
      <Text>Contact Labels</Text>
      <FlatList data={[ 'test1', 'test2' ]} keyExtractor={item => item + 4} renderItem={({item,index}) => <DrawerItem label={item} onPress={() => alert(index)} />} />
    </SafeAreaView>
  );
}

function ContactNavScreen() {
  return (
    <ContactDrawer.Navigator navigationOptions={{title: 'ro'}} drawerPosition={'right'} drawerContent={(props) => <ContactDrawerContent {...props}  />}>
      <ContactDrawer.Screen name="ContactScreen" component={ContactScreen} />
    </ContactDrawer.Navigator>
  )
}

function ContactScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Contact</Text>
    </View>
  );
}

function PersonalDrawerContent(props) {
  return (
    <SafeAreaView>
      <Text>View as Label</Text>
      <FlatList data={[ 'test1', 'test2' ]} keyExtractor={item => item + 4} renderItem={({item,index}) => <DrawerItem label={item} onPress={() => alert(index)} />} />
    </SafeAreaView>
  );
}

function PersonalNavScreen() {
  return (
    <PersonalDrawer.Navigator navigationOptions={{title: 'ro'}} drawerPosition={'right'} drawerContent={(props) => <PersonalDrawerContent {...props}  />}>
      <PersonalDrawer.Screen name="PersonalScreen" component={PersonalScreen} />
    </PersonalDrawer.Navigator>
  )
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
      <Tab.Screen name="Contact" component={ContactNavScreen} 
          options={{ tabBarIcon: ({ color, size }) => (
            <Icon name="users" size={size} color={color} solid />
          )}} />
      <Tab.Screen name="Personal" component={PersonalNavScreen} 
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
    <DiatumProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <View style={{ flex: 1, backgroundColor: '#282827' }}>
            <Stack.Navigator initialRouteName="Root">
              <Stack.Screen name="Root" component={RootScreen} options={{headerShown: false}} />
              <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}} />
              <Stack.Screen name="Main" component={MainScreen} options={{headerShown: false}} />
            </Stack.Navigator>
          </View>
        </NavigationContainer>
      </SafeAreaProvider>
    </DiatumProvider>
  );

};

export default App;

