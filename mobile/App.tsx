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
import { DiatumSession, LabelEntry, Attribute, Subject } from './diatum/DiatumTypes';
import { DiatumProvider, useDiatum } from "./diatum/DiatumContext";
import { IndiViewCom } from "./src/IndiViewCom";

import {setToken} from './src/NotificationConfig';
import PushNotification from "react-native-push-notification";

import { AppSupport, AppSupportProvider, useApp } from './src/AppSupport';
import { Latch, LatchProvider, useLatch } from './src/LatchContext';
import { AttributeUtil } from "./src/AttributeUtil";
import { SubjectUtil } from "./src/SubjectUtil";
import { TagUtil } from './src/TagUtil';

import { Contacts } from "./src/Contacts";
import { ContactProfile } from "./src/ContactProfile";
import { MyProfile } from "./src/MyProfile";
import { MyAttribute } from "./src/MyAttribute";

import { Feed } from "./src/Feed";
import { MyFeed } from "./src/MyFeed";
import { EditPhoto } from "./src/EditPhoto";
import { EditVideo } from "./src/EditVideo";
import { ContactFeed } from "./src/ContactFeed";
import { FullScreenVideo } from "./src/FullScreenVideo"
import { FullScreenPhoto } from "./src/FullScreenPhoto"
import { Comment } from "./src/Comment"

import { Conversations } from "./src/Conversations";
import { Topics } from "./src/Topics";

import { ContactSearch } from "./src/ContactSearch";
import { ManageLabels } from "./src/ManageLabels";
import { ContactRequests } from "./src/ContactRequests";
import { BlockedItems } from "./src/BlockedItems";
import { Settings } from "./src/Settings";

const APP_CONFIG: string = 'INDIVIEW_CONFIG';

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

  const dataCallback = async (type: DiatumDataType, object: any) => {
    try {

      if(type == DiatumDataType.Message) {

        let revision: number;
        let message: string;
        let t: TopicView[] = await diatum.getTopicViews(object.amigoId, object.dialogueId, object.hosting);
        if(t.length > 0) {
          let b: Blurb[] = await diatum.getTopicBlurbs(object.amigoId, object.dialogueId, object.hosting, t[0].topicId);
          if(b.length > 0 && b[0].data != null) {
            message = JSON.parse(b[b.length-1].data).message;
            revision = b[b.length-1].revision 
          }
        }
        await diatum.setConversationBlurbData(object.amigoId, object.dialogueId, object.hosting, { message: message, revision: revision });
      }

      if(type == DiatumDataType.AmigoSubject) {

        // compute revision of retrieved subjects
        let s: Subject[] = await diatum.getContactSubjects(object);
        let rev: number = null;
        let mod: number = null;
        for(let i = 0; i < s.length; i++) {
          if(rev == null || s[i].revision > rev) {
            rev = s[i].revision;
          }
          if(mod == null || s[i].modified > mod) {
            mod = s[i].modified;
          }
        }

        // update subject revision
        let c: ContactEntry = await diatum.getContact(object);
        let feed: number = null;
        if(c.appSubject != null) {
          feed = c.appSubject.feedRevision;
        }
        await diatum.setContactSubjectData(object, { feedRevision: feed, subjectRevision: rev, subjectModified: mod });
      }

      if(type == DiatumDataType.AmigoAttribute) {
        let phoneNumbers = [];
        let textNumbers = [];
        let a: Attribute[] = await diatum.getContactAttributes(object);
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
        await diatum.setContactAttributeData(object, { phone: phoneNumbers, text: textNumbers });
      }
    }
    catch(err) {
      console.log(err);
    }
  }
  
  let attributes = AttributeUtil.getSchemas();
  let subjects = SubjectUtil.getSchemas();
  let tag = TagUtil.MESSAGE;
  let diatum: Diatum = useDiatum();
  let support: AppSupport = useApp();
  diatum.init("indiview_v153.db", attributes, subjects, tag, dataCallback).then(async ctx => {

    if(ctx.context == null) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }]});
    }
    else {
      let l = ctx.context;
      console.log("APP TOKEN: " + l.appToken);
      try {
        await diatum.setSession({ amigoId: l.amigoId, amigoNode: l.accountNode, amigoToken: l.accountToken, appNode: l.serviceNode, appToken: l.serviceToken });
        setToken(l.appToken);
        support.setToken(l.appToken);
        support.setAmigoId(l.amigoId);
        await syncConfig(diatum, support);
        navigation.reset({ index: 0, routes: [{ name: 'Main' }]});
      }
      catch(err) {
        console.log(err);
        navigation.reset({ index: 0, routes: [{ name: 'Login' }]});
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
  const [visible, setVisible] = React.useState(false);

  const attach = (() => {
    if(!busy) {
      if(username != "" && password != "") {
        onBusy(true);
        getAttachCode(username, password).then(c => {
          onBusy(false);
          navigation.reset({ index: 0, routes: [{ name: 'Agree', params: { code: c }}]});
        }).catch(err => {
          onBusy(false);
          console.log(err);
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
      <TextInput style={{ backgroundColor: '#fce77d', textAlign: 'center', height: 40, width: '90%', margin: 16 }} autoCapitalize="none" autoCorrect={false} spellCheck={false} placeholder="Diatum Username" placeholderTextColor="#444444" onChangeText={onChangeUsername} value={username} />
      <View style={{ height: 40, width: '90%', margin: 16, justifyContent: 'center' }}>
        <TextInput style={{ backgroundColor: '#fce77d', textAlign: 'center', height: '100%' }} autoCapitalize="none" secureTextEntry={!visible} placeholder="Portal Password" placeholderTextColor="#444444" onChangeText={onChangePassword} value={password} />
        <Icon name={ visible ? 'eye' : 'eye-slash' } style={{ position: 'absolute', right: 0, fontSize: 18, color: '#444444', marginRight: 12 }} onPress={ () => setVisible(!visible) } />
      </View>
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
        setToken(l.appToken);
        support.setToken(l.appToken);
        support.setAmigoId(l.amigoId);
        await diatum.setAppContext(l);
        await syncConfig(diatum, support);
        navigation.reset({ index: 0, routes: [{ name: 'Main' }]});
      }
      catch(err) {
        console.log(err);
        Alert.alert("failed to attach app");
      }
      onBusy(false);
    }
  });

  const cancel = (() => { navigation.reset({ index: 0, routes: [{ name: 'Login' }]}) });
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
      <MainStack.Screen name="Settings" component={Settings} options={{headerBackTitle: null, headerShown: true}} />
      <MainStack.Screen name="FullScreenVideo" component={FullScreenVideo} options={{ headerBackTitle: null, headerShown: false }} />
      <MainStack.Screen name="FullScreenPhoto" component={FullScreenPhoto} options={{ headerBackTitle: null, headerShown: false }} />
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
      <FeedStack.Screen name="MyFeed" component={MyFeed} options={{ headerBackTitle: null }} />
      <FeedStack.Screen name="Post Photo" component={EditPhoto} options={{ headerBackTitle: null }} />
      <FeedStack.Screen name="Post Video" component={EditVideo} options={{ headerBackTitle: null }} />
      <FeedStack.Screen name="ContactFeed" component={ContactFeed} options={{ headerBackTitle: null }} />
      <FeedStack.Screen name="Comment" component={Comment} options={{ headerBackTitle: null }} />
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
      <ConversationStack.Screen name="Conversations" component={Conversations} options={{headerShown: false}} />
      <ConversationStack.Screen name="Topics" component={Topics} options={{ headerBackTitle: null }} />
    </ConversationStack.Navigator>
  );
}  

function HomeDrawerContent(props) {
  const [requested, setRequested] = React.useState(false);

  let curShare = React.useRef(0);
  let curPending = React.useRef(0);
  let setShare = React.useRef(0);
  let setPending = React.useRef(0);

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
          logoutNav.reset({ index: 0, routes: [{ name: 'Login' }]});
        }}
    ];
    Alert.alert(title, message, buttons);
  });

  const updateShare = async () => {
    let s = await diatum.getContacts(null, "received");
    for(let i = 0; i < s.length; i++) {
      if(curShare.current == null || curShare.current < s[i].revision) {
        curShare.current = s[i].revision;
      }
    }
    let share = await diatum.getAccountData("SHARE_REVISION");
    if(share != null) {
      setShare.current = share;
    }
    setRequest();
  }

  const updatePending = async () => {
    let p = await diatum.getContactRequests();
    for(let i = 0; i < p.length; i++) {
      if(curPending.current == null || curPending.current < p[i].revision) {
        curPending.current = p[i].revision;
      }
    }
    let pending = await diatum.getAccountData("PENDING_REVISION");
    if(pending != null) {
      setPending.current = pending;
    }
    setRequest();
  }

  const setRequest = () => {
    if(setPending.current < curPending.current || setShare.current < curShare.current) {
      setRequested(true);
      props.setLatch('#0077CC');
    }
    else {
      setRequested(false);
      props.setLatch('#272728');
    }
  }

  useEffect(() => {
    diatum.setListener(DiatumEvent.Share, updateShare);
    diatum.setListener(DiatumEvent.Pending, updatePending);
    return () => {
      diatum.clearListener(DiatumEvent.Share, updateShare);
      diatum.clearListener(DiatumEvent.Pending, updatePending);
    }
  }, []);

  return (
    
    <View style={{ flex: 1 }}>
      <Image source={require('./logo.png')} style={{ width: '100%', marginBottom: 16 }} />
      <DrawerItem label={'Manage Labels'} labelStyle={{ fontSize: 18, color: '#555555' }} onPress={() => {
        props.navigation.closeDrawer();
        props.navigate("Manage Labels");
      }} />
      <DrawerItem label={'Contact Search'} labelStyle={{ fontSize: 18, color: '#555555' }} onPress={() => {
        props.navigation.closeDrawer();
        props.navigate('Contact Search');
      }} />
      <DrawerItem label={'Contact Requests'} labelStyle={{ fontSize: 18, color: requested ? '#0077cc' : '#555555' }} onPress={() => {
        setShare.current = curShare.current;
        setPending.current = curPending.current;
        diatum.setAccountData("PENDING_REVISION", curPending.current);
        diatum.setAccountData("SHARE_REVISION", curShare.current);
        setRequest();
        props.navigation.closeDrawer();
        props.navigate("Contact Requests");
      }} />
      <DrawerItem label={'Blocked Items'} labelStyle={{ fontSize: 18, color: '#555555' }} onPress={() => {
        props.navigation.closeDrawer();
        props.navigate("Blocked Items");
      }} />
      <DrawerItem label={'Settings'} labelStyle={{ fontSize: 18, color: '#555555' }} onPress={() => {
        props.navigation.closeDrawer();
        props.navigate("Settings");
      }} />
      <DrawerItem label={'Logout'} labelStyle={{ fontSize: 18, color: '#555555' }} onPress={logout} />
    </View>
  );
}

function HomeNavScreen({ navigation }) {
 
  const [labelLatch, setLabelLatch] = React.useState('#272728');
  const [latchColor, setLatchColor] = React.useState('#277728');
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

  const setLatch = (c) => {
    setLatchColor(c);
  }

  return (
    <View style={{ flex: 1 }}>
      <HomeDrawer.Navigator navigationOptions={{title: 'ro'}} drawerPosition={'left'} drawerContent={(props) => <HomeDrawerContent {...props} {...navigation} {...{setLatch: setLatch}} />}>
        <HomeDrawer.Screen name="HomeScreen" component={HomeScreen} initialParams={{ callback: 'ro' }} />
      </HomeDrawer.Navigator>
      <TouchableOpacity style={{ top: '50%', marginTop: -32, alignItems: 'center', position: "absolute", right: -24, width: 48, height: 64, borderRadius: 8 }} onPress={toggleLabels}>
        <View style={{ width: 16, height: 64, backgroundColor: labelLatch, borderRadius: 8 }}></View>
      </TouchableOpacity>
      <TouchableOpacity style={{ top: '50%', marginTop: -32, alignItems: 'center', position: "absolute", left: -24, width: 48, height: 64, borderRadius: 8 }} onPress={toggleControl}>
        <View style={{ width: 16, height: 64, backgroundColor: latchColor, borderRadius: 8 }}></View>
      </TouchableOpacity>
    </View>
  )
}

function HomeScreen({ navigation }) {

  let latch: Latch = useLatch();
  const tabbed = () => {
  };

  return (
    <Tab.Navigator initialRouteName={'Feed'} tabBarOptions={{ showLabel: false}} >
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
      <Tab.Screen name="Conversations" component={HomeConversationScreen} 
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
      <ContactStack.Screen name="ContactProfile" component={ContactProfile} options={{ headerBackTitle: null }} />
      <ContactStack.Screen name="MyProfile" component={MyProfile} options={{ headerBackTitle: null }} />
      <ContactStack.Screen name="MyAttribute" component={MyAttribute} options={{ headerBackTitle: null }} />
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

async function syncConfig(diatum: Diatum, support: AppSupport) {

  try {
    let c = await IndiViewCom.getSettings(support.getToken());
    diatum.setAccountData(APP_CONFIG, c);
    support.setConfig(c);
    if(c != null && c.notifications) {
      PushNotification.requestPermissions();
    }
  }
  catch(err) {
    console.log(err);
    let c = diatum.getAccountData(APP_CONFIG);
    support.setConfig(c);
    if(c != null && c.notifications) {
      PushNotification.requestPermissions();
    }
  }
}

const App = () => {

  return (
    <DiatumProvider>
      <LatchProvider> 
        <AppSupportProvider> 
          <SafeAreaProvider>
            <NavigationContainer>
              <StatusBar backgroundColor='transparent' barStyle="dark-content" />
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

