import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Platform, Linking, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, TextInput, Image, FlatList, Button, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import { Diatum } from './diatum/Diatum';
import { AttachCode, getAttachCode } from './diatum/DiatumUtil';
import { DiatumSession } from './diatum/DiatumTypes';
import { DiatumProvider, useDiatum } from "./diatum/DiatumContext";
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
  diatum.init("default.db").then(async ctx => {
    if(ctx.context == null) {
      navigation.replace('Login');
    }
    else {
      let l = ctx.context;
      console.log("APP TOKEN: " + l.appToken);
      try {
        await diatum.setSession({ amigoId: l.amigoId, amigoNode: l.accountNode, amigoToken: l.accountToken, appNode: l.serviceNode, appToken: l.serviceToken });
        navigation.replace('Main');
      }
      catch(err) {
        console.log(err);
        navigation.replace('Login');
      }
    }
  });

  return (
    <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#282827', justifyContent: 'center' }} />
  );
}

function LoginScreen({ navigation }) {
  let diatum: Diatum = useDiatum();
  const [username, onChangeUsername] = React.useState("");
  const [password, onChangePassword] = React.useState("");
  const [busy, onBusy] = React.useState(false);

  const attach = (() => {
    if(username != "" && password != "") {
      onBusy(true);
      getAttachCode(username, password).then(c => {
        onBusy(false);
        navigation.replace("Agree", { code: c });
      }).catch(err => {
        onBusy(false);
        Alert.alert("failed to retrieve attachment code");
      });
    }
  });

  const attachColor = (() => {
    if(username != "" && password != "") {
      return "#44aaff";
    }
    return "#888888";
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: '#282827', justifyContent: 'center', alignItems: 'center' }}>
      <Image source={require('./logo.png')} style={{ marginBottom: 48 }} />
      <TextInput style={{ backgroundColor: '#fce77d', textAlign: 'center', height: 40, width: '90%', margin: 16 }} autoCapitalize="none" placeholder="Diatum Username" placeholderTextColor="#444444" onChangeText={onChangeUsername} value={username} />
      <TextInput style={{ backgroundColor: '#fce77d', textAlign: 'center', height: 40, width: '90%', margin: 16 }} autoCapitalize="none" secureTextEntry={true} placeholder="Portal Password" placeholderTextColor="#444444" onChangeText={onChangePassword} value={password} />
      <TouchableOpacity onPress={attach}><Text style={{ color: attachColor(), fontSize: 24, padding: 32 }} >Attach App</Text></TouchableOpacity>
      <ActivityIndicator animating={busy} size="large" color="#ffffff" />
    </KeyboardAvoidingView>
  );
}

function AgreeScreen({ route, navigation }) {

  let diatum: Diatum = useDiatum();
  const { code, otherParam } = route.params;
  const [busy, onBusy] = React.useState(false);

  const agree = (async () => {
    onBusy(true);
    try {
      let l = await IndiViewCom.attach(code);
      console.log("APP TOKEN: " + l.appToken);
      await diatum.setSession({ amigoId: l.amigoId, amigoNode: l.accountNode, amigoToken: l.accountToken, appNode: l.serviceNode, appToken: l.serviceToken });
      await diatum.setAppContext(l);
      onBusy(false);
      navigation.replace("Main");
    }
    catch(err) {
      console.log(err);
      Alert.alert("failed to attach app");
    }
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
        <ActivityIndicator animating={busy} size="large" color="#ffffff" />
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
  const logout = (async () => {
    try {
      await diatum.clearSession();
    }
    catch(err) {
      console.log("clear session failed");
    }
    try {
      await diatum.clearAppContext();
    }
    catch(err) {
      console.log("clear context failed");
    }
    logoutNav.replace("Login");
  });

  return (
    <SafeAreaView style={{ paddingTop: 18 }}>
      <DrawerItem label={'Search for New Contacts'} labelStyle={{ fontSize: 18 }} onPress={() => {
        navigation.navigation.closeDrawer();
        navigation.navigate('Search');
      }} />
      <DrawerItem label={'Labels'} labelStyle={{ fontSize: 18 }} onPress={() => {
        navigation.navigation.closeDrawer();
        navigation.navigate("Label");
      }} />
      <DrawerItem label={'Blocked Contacts'} labelStyle={{ fontSize: 18 }} onPress={() => {
        navigation.navigation.closeDrawer();
      }} />
      <DrawerItem label={'Settings'} labelStyle={{ fontSize: 18 }} onPress={() => {
        navigation.navigation.closeDrawer();
      }} />
      <DrawerItem label={'Logout'} labelStyle={{ fontSize: 18 }} onPress={logout} />
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

