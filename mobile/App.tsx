import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Dimensions, Platform, Linking, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, TextInput, Image, FlatList, Button, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import { Diatum, DiatumEvent, DiatumDataType } from './diatum/Diatum';
import { AttachCode, getAttachCode } from './diatum/DiatumUtil';
import { DiatumSession, LabelEntry, Attribute } from './diatum/DiatumTypes';
import { DiatumProvider, useDiatum } from "./diatum/DiatumContext";
import { IndiViewCom } from "./src/IndiViewCom";

import { AppSupport, AppSupportProvider, useApp } from './src/AppSupport';
import { Latch, LatchProvider, useLatch } from './src/LatchContext';
import { AttributeUtil } from "./src/AttributeUtil";

import { Contacts } from "./src/Contacts";
import { ContactProfile } from "./src/ContactProfile";
import { MyProfile } from "./src/MyProfile";
import { MyAttribute } from "./src/MyAttribute";

import { Feed } from "./src/Feed";
import { Conversation } from "./src/Conversation";

import { ContactSearch } from "./src/ContactSearch";
import { ManageLabels } from "./src/ManageLabels";
import { ContactRequests } from "./src/ContactRequests";
import { BlockedItems } from "./src/BlockedItems";

// schema identifiers
const TEXT: string = 'de91199232b71e2e06921b051ddcb5288bb289f27ad87402bde701146dac6e9e';
const PHOTO: string = '6cf626f1b2222b128dc39dceabdfce7073ea961d97f34fe20fd30ef02b7bf8dd';
const VIDEO: string = 'e245d8cc676a79055aac13a2d0aa9a3eb3f673765556070dc0bd131510e60e40';
const AUDIO: string = '6c816e6cfa33ba3685436ddc2279b39627d724a5a47f79413e4ff604273bf785';
const MESSAGE_TAG: string = '19fd19cbaaf31f5d9f744af3c1c52ff770c2830ab4a636a86473991f7fe9f962';

const Stack = createStackNavigator(); 
const MainStack = createStackNavigator();
const HomeDrawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const ContactStack = createStackNavigator();
const FeedStack = createStackNavigator();
const ConversationStack = createStackNavigator();

const FeedDrawer = createDrawerNavigator();
const ConversationDrawer = createDrawerNavigator();

let logoutNav = null;
let homeNav = null;

function RootScreen({ navigation }) {
  logoutNav = navigation;

  const dataCallback = async (type: DiatumDataType, amigoId: string, objectId: string) => {
    try {
      if(type == DiatumDataType.AmigoAttribute && objectId == null) {
        let phoneNumbers = [];
        let textNumbers = [];
        let a: Attribute[] = await diatum.getContactAttributes(amigoId);
        for(let i = 0; i < a.length; i++) {
          if(AttributeUtil.isPhone(a[i])) {
            let obj = AttributeUtil.getDataObject(a[i]);
            if(obj.phone != null) {
              phoneNumbers.push({ value: obj.phone, type: obj.category });
              if(obj.phoneSms == true) {
                textNumbers.push({ value: obj.phone, type: obj.category });
              }
            }
          }
          if(AttributeUtil.isHome(a[i])) {
            let obj = AttributeUtil.getDataObject(a[i]);
            if(obj.phoneNumber != null) {
              phoneNumbers.push({ value: obj.phoneNumber, type: 'Home' });
              if(obj.phoneNumberSms == true) {
                textNumbers.push({ value: obj.phoneNumber, type: 'Home' });
              }
            }
          }
          if(AttributeUtil.isCard(a[i])) {
            let obj = AttributeUtil.getDataObject(a[i]);
            if(obj.mainPhone != null) {
              phoneNumbers.push({ value: obj.mainPhone, type: 'Main' });
              if(obj.mainPhoneSms == true) {
                textNumbers.push({ value: obj.mainPhone, type: 'Main' });
              }
            }
            if(obj.directPhone != null) {
              phoneNumbers.push({ value: obj.directPhone, type: 'Direct' });
              if(obj.directPhoneSms == true) {
                textNumbers.push({ value: obj.directPhone, type: 'Direct' });
              }
            }
            if(obj.mobilePhone != null) {
              phoneNumbers.push({ value: obj.mobilePhone, type: 'Mobile' });
              if(obj.mobilePhoneSms == true) {
                textNumbers.push({ value: obj.mobilePhone, type: 'Mobile' });
              }
            }
          }
            let obj = AttributeUtil.getDataObject(a[i]);
        }
        await diatum.setContactAttributeData(amigoId, { phone: phoneNumbers, text: textNumbers });
      }
    }
    catch(err) {
      console.log(err);
    }
  }
  
  let attributes = AttributeUtil.getSchemas();
  let subjects = [ TEXT, PHOTO, VIDEO, AUDIO ];
  let tag = MESSAGE_TAG;
  let diatum: Diatum = useDiatum();
  let support: AppSupport = useApp();
  diatum.init("indiview_v104.db", attributes, subjects, tag, dataCallback).then(async ctx => {
    if(ctx.context == null) {
      navigation.replace('Login');
    }
    else {
      let l = ctx.context;
      console.log("APP TOKEN: " + l.appToken);
      try {
        await diatum.setSession({ amigoId: l.amigoId, amigoNode: l.accountNode, amigoToken: l.accountToken, appNode: l.serviceNode, appToken: l.serviceToken });
        support.setToken(l.appToken);
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
    if(!busy) {
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

  const { code, otherParam } = route.params;
  const [busy, onBusy] = React.useState(false);

  let diatum: Diatum = useDiatum();
  let support: AppSupport = useApp();

  const agree = (async () => {
    if(!busy) {
      onBusy(true);
      try {
        let l = await IndiViewCom.attach(code);
        await diatum.setSession({ amigoId: l.amigoId, amigoNode: l.accountNode, amigoToken: l.accountToken, appNode: l.serviceNode, appToken: l.serviceToken });
        support.setToken(l.appToken);
        await diatum.setAppContext(l);
        navigation.replace("Main");
      }
      catch(err) {
        console.log(err);
        Alert.alert("failed to attach app");
      }
      onBusy(false);
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
  const forFade = ({ current }) => ({
    cardStyle: {
      opacity: current.progress,
    },
  });

  return (
    <MainStack.Navigator initialRouteName="Home" headerMode="screen" screenOptions={{ cardStyleInterpolator: forFade }}>
      <MainStack.Screen name="Home" component={HomeNavScreen} options={{headerShown: false}} />
      <MainStack.Screen name="Contact Search" component={ContactSearch} options={{headerBackTitle: null, headerShown: true}} />
      <MainStack.Screen name="Contact Profile" component={ContactProfile} options={{headerBackTitle: null, headerShown: true}} />
      <MainStack.Screen name="Manage Labels" component={ManageLabels} options={{headerBackTitle: null, headerShown: true}} />
      <MainStack.Screen name="Contact Requests" component={ContactRequests} options={{headerBackTitle: null, headerShown: true}} />
      <MainStack.Screen name="Blocked Items" component={BlockedItems} options={{headerBackTitle: null, headerShown: true}} />
    </MainStack.Navigator>
  );
}

function HomeFeedScreen() {
  const forFade = ({ current }) => ({
    cardStyle: {
      opacity: current.progress,
    },
  });

  return (
    <FeedStack.Navigator initialRouteName="Contacts" headerMode="screen" screenOptions={{ cardStyleInterpolator: forFade }}>
      <FeedStack.Screen name="Feed" component={Feed} options={{headerShown: false}} />
    </FeedStack.Navigator>
  );
}  

function HomeConversationScreen() {
  const forFade = ({ current }) => ({
    cardStyle: {
      opacity: current.progress,
    },
  });

  return (
    <ConversationStack.Navigator initialRouteName="Contacts" headerMode="screen" screenOptions={{ cardStyleInterpolator: forFade }}>
      <ConversationStack.Screen name="Conversation" component={Conversation} options={{headerShown: false}} />
    </ConversationStack.Navigator>
  );
}  

function HomeDrawerContent(props) {
  homeNav = props.navigation;

  let diatum: Diatum = useDiatum();
  const logout = (async () => {
    const title = 'Are you sure you want to logout?';
    const message = '';
    const buttons = [
        { text: 'Cancel', type: 'cancel' },
        { text: 'Confirm', onPress: async () => {
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
        }}
    ];
    Alert.alert(title, message, buttons);
  });

  return (
    
    <View style={{ flex: 1 }}>
      <Image source={require('./logo.png')} style={{ width: '100%', marginBottom: 16 }} />
      <DrawerItem label={'Manage Labels'} labelStyle={{ fontSize: 18 }} onPress={() => {
        props.navigation.closeDrawer();
        props.navigate("Manage Labels");
      }} />
      <DrawerItem label={'Contact Search'} labelStyle={{ fontSize: 18 }} onPress={() => {
        props.navigation.closeDrawer();
        props.navigate('Contact Search');
      }} />
      <DrawerItem label={'Contact Requests'} labelStyle={{ fontSize: 18 }} onPress={() => {
        props.navigation.closeDrawer();
        props.navigate("Contact Requests");
      }} />
      <DrawerItem label={'Blocked Items'} labelStyle={{ fontSize: 18 }} onPress={() => {
        props.navigation.closeDrawer();
        props.navigate("Blocked Items");
      }} />
      <DrawerItem label={'Settings'} labelStyle={{ fontSize: 18 }} onPress={() => {
        props.navigation.closeDrawer();
      }} />
      <DrawerItem label={'Logout'} labelStyle={{ fontSize: 18 }} onPress={logout} />
    </View>
  );
}

function HomeNavScreen({ navigation }) {
 
  const [labelLatch, setLabelLatch] = React.useState('#272728');
  let latch: Latch = useLatch();
  const onLatch = (color: string) => {
    setLabelLatch(color);
  };

  useEffect(() => {
    latch.setColorListener(onLatch);
    return () => {
      latch.clearColorListener(onLatch);
    }
  }, []);
 
  const toggleControl = () => {
    homeNav.toggleDrawer();
  };

  const toggleLabels = () => {
    latch.toggle();
  }

  return (
    <View style={{ flex: 1 }}>
      <HomeDrawer.Navigator navigationOptions={{title: 'ro'}} drawerPosition={'left'} drawerContent={(props) => <HomeDrawerContent {...props} {...navigation} />}>
        <HomeDrawer.Screen name="HomeScreen" component={HomeScreen} initialParams={{ callback: 'ro' }} />
      </HomeDrawer.Navigator>
      <TouchableOpacity style={{ top: '50%', marginTop: -32, alignItems: 'center', position: "absolute", right: -24, width: 48, height: 64, borderRadius: 8 }} onPress={toggleLabels}>
        <View style={{ width: 16, height: 64, backgroundColor: labelLatch, borderRadius: 8 }}></View>
      </TouchableOpacity>
      <TouchableOpacity style={{ top: '50%', marginTop: -32, alignItems: 'center', position: "absolute", left: -24, width: 48, height: 64, borderRadius: 8 }} onPress={toggleControl}>
        <View style={{ width: 16, height: 64, backgroundColor: '#282827', borderRadius: 8 }}></View>
      </TouchableOpacity>
    </View>
  )
}

function HomeScreen({ navigation }) {

  let latch: Latch = useLatch();
  const tabbed = () => {
  };

  return (
    <Tab.Navigator tabBarOptions={{showLabel: false}} >
      <Tab.Screen name="HomeContact" component={HomeContactScreen} 
          listeners={({ navigation, route }) => ({
            tabPress: e => { tabbed(); }
          })}
          options={{ tabBarIcon: ({ color, size }) => (
            <Icon name="users" size={size} color={color} solid />
          )}} />
      <Tab.Screen name="Feed" component={HomeFeedScreen} 
          listeners={({ navigation, route }) => ({
            tabPress: e => { tabbed(); }
          })}
          options={{ tabBarIcon: ({ color, size }) => (
            <Icon name="picture-o" size={size} color={color} solid />
          )}} />
      <Tab.Screen name="Conversation" component={HomeConversationScreen} 
          listeners={({ navigation, route }) => ({
            tabPress: e => { tabbed(); }
          })}
          options={{ tabBarIcon: ({ color, size }) => (
            <Icon name="comments-o" size={size} color={color} solid />
          )}} />
    </Tab.Navigator>
  );
}

function HomeContactScreen() {
  const forFade = ({ current }) => ({
    cardStyle: {
      opacity: current.progress,
    },
  });

  return (
    <ContactStack.Navigator initialRouteName="Contacts" headerMode="screen" screenOptions={{ cardStyleInterpolator: forFade }}>
      <ContactStack.Screen name="Contacts" component={Contacts} options={{headerShown: false}} />
      <ContactStack.Screen name="ContactProfile" component={ContactProfile} options={{ headerBackTitle: null, headerShow: true }} />
      <ContactStack.Screen name="MyProfile" component={MyProfile} options={{ headerBackTitle: null, headerShow: true }} />
      <ContactStack.Screen name="MyAttribute" component={MyAttribute} options={{ headerBackTitle: null, headerShow: true }} />
    </ContactStack.Navigator>
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
      <LatchProvider> 
        <AppSupportProvider> 
          <SafeAreaProvider>
            <NavigationContainer>
<StatusBar
 backgroundColor='transparent'
 barStyle="dark-content" // Here is where you change the font-color
/>
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
        </AppSupportProvider>
      </LatchProvider>
    </DiatumProvider>
  );

};

export default App;

