import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Platform, Linking, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, TextInput, Image, FlatList, Button, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
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

import { AttributeUtil } from "./src/AttributeUtil";
import { ContactScreen } from "./src/Contacts";

// schema identifiers
const TEXT: string = 'de91199232b71e2e06921b051ddcb5288bb289f27ad87402bde701146dac6e9e';
const PHOTO: string = '6cf626f1b2222b128dc39dceabdfce7073ea961d97f34fe20fd30ef02b7bf8dd';
const VIDEO: string = 'e245d8cc676a79055aac13a2d0aa9a3eb3f673765556070dc0bd131510e60e40';
const AUDIO: string = '6c816e6cfa33ba3685436ddc2279b39627d724a5a47f79413e4ff604273bf785';
const MESSAGE_TAG: string = '19fd19cbaaf31f5d9f744af3c1c52ff770c2830ab4a636a86473991f7fe9f962';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const FeedDrawer = createDrawerNavigator();
const ConversationDrawer = createDrawerNavigator();
const HomeDrawer = createDrawerNavigator();
const MainStack = createStackNavigator();

let logoutNav = null;
let homeNav = null;
let feedNav = null;
let conversationNav = null;

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
          if(AttributeUtil.isWork(a[i])) {
            let obj = AttributeUtil.getDataObject(a[i]);
            if(obj.phoneNumber != null) {
              phoneNumbers.push({ value: obj.phoneNumber, type: 'Work' });
              if(obj.phoneNumberSms == true) {
                textNumbers.push({ value: obj.phoneNumber, type: 'Work' });
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
  diatum.init("indiview_v96.db", attributes, subjects, tag, dataCallback).then(async ctx => {
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
  const forFade = ({ current }) => ({
    cardStyle: {
      opacity: current.progress,
    },
  });

  return (
    <MainStack.Navigator initialRouteName="Home" headerMode="screen" screenOptions={{ cardStyleInterpolator: forFade }}>
      <MainStack.Screen name="Home" component={HomeNavScreen} options={{headerShown: false}} />
      <MainStack.Screen name="Search" component={SearchScreen} options={{headerBackTitle: null, headerShown: true}} />
      <MainStack.Screen name="Label" component={LabelScreen} options={{headerBackTitle: null, headerShown: true}} />
    </MainStack.Navigator>
  );
}

function FeedDrawerContent(props) {
  feedNav = props.navigation; 
  const [labels, setLabels] = React.useState([]);
  let diatum: Diatum = useDiatum();
  const update = () => {
    diatum.getLabels().then(l => {
      setLabels(l);
    }).catch(err => {
      console.log(err);
    });
  };
 
  useEffect(() => {
        diatum.setListener(DiatumEvent.Labels, update);
        return () => {
          diatum.clearListener(DiatumEvent.Labels, update);
        }
    }, []);

  return (
    <View>
      <DrawerItem labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#000000' }} label={'Label View'} />
      <FlatList data={labels} keyExtractor={item => item.labelId} renderItem={({item,index}) => <DrawerItem labelStyle={{ fontSize: 18 }} label={item.name} onPress={() => {props.navigation.closeDrawer(); props.onLabel(item.labelId);} } />} />
    </View>
  );
}

function FeedNavScreen() {
  
  const selected = (id: string) => {
    console.log("SELECTED: " + id);
  };

  return (
    <FeedDrawer.Navigator navigationOptions={{title: 'ro'}} drawerPosition={'right'} drawerContent={(props) => <FeedDrawerContent {...props} {...{onLabel: selected}} />}>
      <FeedDrawer.Screen name="FeedScreen" component={FeedScreen} />
    </FeedDrawer.Navigator>
  )
}

function FeedScreen({ route, navigation }) {
  const toggleLabel = () => {
    feedNav.openDrawer();
  };
  const toggleControl = () => {
    homeNav.openDrawer();
  };
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Feed</Text>
      <TouchableOpacity style={{ alignItems: 'center', position: "absolute", left: -24, top: '50%', translateY: -32, width: 48, height: 64, borderRadius: 8 }} onPress={toggleControl}>
        <View style={{ width: 16, height: 64, backgroundColor: '#282827', borderRadius: 8 }}></View>
      </TouchableOpacity>
      <TouchableOpacity style={{ alignItems: 'center', position: "absolute", right: -24, top: '50%', translateY: -32, width: 48, height: 64, borderRadius: 8 }} onPress={toggleLabel}>
        <View style={{ width: 16, height: 64, backgroundColor: '#282827', borderRadius: 8 }}></View>
      </TouchableOpacity>
    </View>
  );
}

function ConversationDrawerContent(props) {
  conversationNav = props.navigation;
  const [labels, setLabels] = React.useState([]);
  let diatum: Diatum = useDiatum();
  const update = () => {
    diatum.getLabels().then(l => {
      setLabels(l);
    }).catch(err => {
      console.log(err);
    });
  };
 
  useEffect(() => {
        diatum.setListener(DiatumEvent.Labels, update);
        return () => {
          diatum.clearListener(DiatumEvent.Labels, update);
        }
    }, []);

  return (
    <View>
      <DrawerItem labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#000000' }} label={'Label View'} />
      <FlatList data={labels} keyExtractor={item => item.labelId} renderItem={({item,index}) => <DrawerItem labelStyle={{ fontSize: 18 }} label={item.name} onPress={() => {props.navigation.closeDrawer(); props.onLabel(item.labelId);} } />} />
    </View>
  );
}

function ConversationNavScreen() {
  const selected = (id: string) => {
    console.log("SELECTED: " + id);
  };

  return (
    <ConversationDrawer.Navigator navigationOptions={{title: 'ro'}} drawerPosition={'right'} drawerContent={(props) => <ConversationDrawerContent {...props} {...{onLabel: selected}} />}>
      <ConversationDrawer.Screen name="ConversationScreen" component={ConversationScreen} />
    </ConversationDrawer.Navigator>
  )
}

function ConversationScreen() {

  const toggleLabel = () => {
    conversationNav.openDrawer();
  };
  const toggleControl = () => {
    homeNav.openDrawer();
  };

  const [labels, setLabels] = React.useState([]);
  let diatum: Diatum = useDiatum();
  const update = () => {
    diatum.getIdentity().then(i => {
      console.log(i);
    }).catch(err => {
      console.log(err);
    });
  };
 
  useEffect(() => {
        diatum.setListener(DiatumEvent.Identity, update);
        return () => {
          diatum.clearListener(DiatumEvent.Identity, update);
        }
    }, []);


  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Conversation</Text>
      <TouchableOpacity style={{ alignItems: 'center', position: "absolute", left: -24, top: '50%', translateY: -32, width: 48, height: 64, borderRadius: 8 }} onPress={toggleControl}>
        <View style={{ width: 16, height: 64, backgroundColor: '#282827', borderRadius: 8 }}></View>
      </TouchableOpacity>
      <TouchableOpacity style={{ alignItems: 'center', position: "absolute", right: -24, top: '50%', translateY: -32, width: 48, height: 64, borderRadius: 8 }} onPress={toggleLabel}>
        <View style={{ width: 16, height: 64, backgroundColor: '#282827', borderRadius: 8 }}></View>
      </TouchableOpacity>
    </View>
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
    <SafeAreaView style={{ flex: 1 }}>
      <DrawerItem label={'Contact Search'} labelStyle={{ fontSize: 18 }} onPress={() => {
        props.navigation.closeDrawer();
        props.navigate('Search');
      }} />
      <DrawerItem label={'Update Labels'} labelStyle={{ fontSize: 18 }} onPress={() => {
        props.navigation.closeDrawer();
        props.navigate("Label");
      }} />
      <DrawerItem label={'Contacts Updates'} labelStyle={{ fontSize: 18 }} onPress={() => {
        props.navigation.closeDrawer();
      }} />
      <DrawerItem label={'Blocked Contacts'} labelStyle={{ fontSize: 18 }} onPress={() => {
        props.navigation.closeDrawer();
      }} />
      <DrawerItem label={'Settings'} labelStyle={{ fontSize: 18 }} onPress={() => {
        props.navigation.closeDrawer();
      }} />
      <DrawerItem label={'Logout'} labelStyle={{ fontSize: 18 }} onPress={logout} />
    </SafeAreaView>
  );
}

function HomeNavScreen({ navigation }) {
  
  return (
    <HomeDrawer.Navigator navigationOptions={{title: 'ro'}} drawerPosition={'left'} drawerContent={(props) => <HomeDrawerContent {...props} {...navigation} />}>
      <HomeDrawer.Screen name="HomeScreen" component={HomeScreen} initialParams={{ callback: 'ro' }} />
    </HomeDrawer.Navigator>
  )
}

function HomeScreen({ navigation }) {

  const tabbed = () => {
    if(feedNav != null) {
      feedNav.closeDrawer();
    }
    if(conversationNav != null) {
      conversationNav.closeDrawer();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tab.Navigator tabBarOptions={{showLabel: false}} >
        <Tab.Screen name="HomeContact" component={HomeContactScreen} 
            listeners={({ navigation, route }) => ({
              tabPress: e => { tabbed(); }
            })}
            options={{ tabBarIcon: ({ color, size }) => (
              <Icon name="users" size={size} color={color} solid />
            )}} />
        <Tab.Screen name="Feed" component={FeedNavScreen} 
            listeners={({ navigation, route }) => ({
              tabPress: e => { tabbed(); }
            })}
            options={{ tabBarIcon: ({ color, size }) => (
              <Icon name="picture-o" size={size} color={color} solid />
            )}} />
        <Tab.Screen name="Conversation" component={ConversationNavScreen} 
            listeners={({ navigation, route }) => ({
              tabPress: e => { tabbed(); }
            })}
            options={{ tabBarIcon: ({ color, size }) => (
              <Icon name="comments-o" size={size} color={color} solid />
            )}} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

function HomeContactScreen() {
  const toggleControl = () => {
    homeNav.openDrawer();
  };
  return (
      <View style={{ flex: 1 }}>
        <ContactScreen></ContactScreen>

        <TouchableOpacity style={{ alignItems: 'center', position: "absolute", left: -24, top: '50%', translateY: -32, width: 48, height: 64, borderRadius: 8 }} onPress={toggleControl}>
          <View style={{ width: 16, height: 64, backgroundColor: '#282827', borderRadius: 8 }}></View>
        </TouchableOpacity>
      </View>
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

