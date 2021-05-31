import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Platform, Linking, TouchableOpacity, KeyboardAvoidingView, TextInput, Image, FlatList, Button, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import { Diatum } from './sdk/Diatum';
import { DiatumProvider, useDiatum } from "./sdk/DiatumContext";
import { IndiViewCom } from "./src/IndiViewCom";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const FeedDrawer = createDrawerNavigator();
const ContactDrawer = createDrawerNavigator();
const PersonalDrawer = createDrawerNavigator();
const HomeDrawer = createDrawerNavigator();
const MainStack = createStackNavigator();

let logoutNav = null;

function RootScreen({ navigation }) {
  logoutNav = navigation;
  let diatum: Diatum = useDiatum();
  diatum.init("default.db").then(ctx => {
    if(ctx.context == null) {
      navigation.replace('Login');
    }
    else {
      navigation.replace('Main');
    }
  });

  return (
    <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#282827', justifyContent: 'center' }}>
      <Text>RootScreen</Text>
      <Button title="-> LOGIN" onPress={() => navigation.replace('Login')} />
    </View>
  );
}

function LoginScreen({ navigation }) {
  let diatum: Diatum = useDiatum();
  const [username, onChangeUsername] = React.useState("");
  const [password, onChangePassword] = React.useState("");

  const attach = (() => { 
    diatum.getAttachCode(username, password).then(c => {
      navigation.replace("Agree", { code: c });
    }).catch(err => {
      Alert.alert("failed to retrieve attachment code");
    });
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: '#282827', justifyContent: 'center', alignItems: 'center' }}>
      <Image source={require('./logo.png')} style={{ marginBottom: 48 }} />
      <TextInput style={{ backgroundColor: '#fce77d', textAlign: 'center', height: 40, width: '90%', margin: 16 }} autoCapitalize="none" placeholder="Diatum Username" placeholderTextColor="#444444" onChangeText={onChangeUsername} value={username} />
      <TextInput style={{ backgroundColor: '#fce77d', textAlign: 'center', height: 40, width: '90%', margin: 16 }} autoCapitalize="none" secureTextEntry={true} placeholder="Portal Password" placeholderTextColor="#444444" onChangeText={onChangePassword} value={password} />
      <TouchableOpacity onPress={attach}><Text style={{ color: "#44aaff", fontSize: 24, paddingTop: 32 }} >Attach App</Text></TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

function AgreeScreen({ route, navigation }) {

  let diatum: Diatum = useDiatum();
  const { code, otherParam } = route.params;

  const agree = (() => { 
    IndiViewCom.attach(code).then(l => {
      diatum.setAppContext(l);
      navigation.replace("Main");
    });
  });
  const cancel = (() => { navigation.replace("Login") });
  const terms = (() => { Linking.openURL('https://diatum.org/terms-of-service') });
  const policy = (() => { Linking.openURL('https://diatum.org/policies-introduction') });

  return (
    <View style={[ { flex: 1, backgroundColor: "#282827", padding: 16 }, { flexDirection: "column" }]}>
      <View style={{ flex: 1 }} />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: "#ffffff", fontSize: 22 }}>Do you agree to the terms of service an data policy specified by Diatum?</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={[ { flex: 1 }, { flexDirection: "row" }]}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={cancel}>
              <Text style={{ color: "#ffff88", fontSize: 22, borderColor: "#44aaff", borderWidth: 2, borderRadius: 6, padding: 8, minWidth: 128, textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={agree}>
              <Text style={{ color: "#88ff88", fontSize: 22, borderColor: "#44aaff", borderWidth: 2, borderRadius: 6, padding: 8, minWidth: 128, textAlign: 'center' }}>Agree</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity onPress={terms}><Text style={{ color: "#44aaff", fontSize: 20, padding: 16 }}>Terms of Service</Text></TouchableOpacity>
        <TouchableOpacity onPress={policy}><Text style={{ color: "#44aaff", fontSize: 20, padding: 16 }}>Data Policy</Text></TouchableOpacity>
      </View>
      <View style={{ flex: 1 }} />
    </View>
  )
}

function MainScreen() {
  return (
    <MainStack.Navigator initialRouteName="Home">
      <MainStack.Screen name="Home" component={HomeNavScreen} options={{headerShown: false}} />
      <MainStack.Screen name="Search" component={SearchScreen} options={{headerShown: true}} />
      <MainStack.Screen name="Label" component={LabelScreen} options={{headerShown: true}} />
    </MainStack.Navigator>
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

function HomeDrawerContent(navigation) {

  let diatum: Diatum = useDiatum();
  const logout = (() => {
    diatum.clearAppContext().then(() => {
      logoutNav.replace("Login");
    });
  });

  return (
    <SafeAreaView>
      <Text>Main Menu</Text>
      <DrawerItem label={'Search'} labelStyle={{ fontSize: 22 }} onPress={() => {
        navigation.navigation.closeDrawer();
        navigation.navigate('Search');
      }} />
      <DrawerItem label={'Labels'} labelStyle={{ fontSize: 22 }} onPress={() => {
        navigation.navigation.closeDrawer();
        navigation.navigate("Label");
      }} />
      <DrawerItem label={'Logout'} labelStyle={{ fontSize: 22 }} onPress={logout} />
    </SafeAreaView>
  );
}

function HomeNavScreen({ navigation }) {
  return (
    <HomeDrawer.Navigator navigationOptions={{title: 'ro'}} drawerPosition={'left'} drawerContent={(props) => <HomeDrawerContent {...props} {...navigation} />}>
      <HomeDrawer.Screen name="HomeScreen" component={HomeScreen} />
    </HomeDrawer.Navigator>
  )
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
              <Stack.Screen name="Agree" component={AgreeScreen} options={{headerShown: false}} />
              <Stack.Screen name="Main" component={MainScreen} options={{headerShown: false}} />
            </Stack.Navigator>
          </View>
        </NavigationContainer>
      </SafeAreaProvider>
    </DiatumProvider>
  );

};

export default App;

