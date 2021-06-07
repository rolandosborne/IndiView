import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Platform, Linking, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, TextInput, Image, FlatList, Button, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import { Diatum, DiatumEvent } from './diatum/Diatum';
import { AttachCode, getAttachCode } from './diatum/DiatumUtil';
import { DiatumSession, LabelEntry } from './diatum/DiatumTypes';
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
let homeNav = null;
let feedNav = null;
let contactNav = null;
let personalNav = null;

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
    <SafeAreaView>
      <DrawerItem labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#000000' }} label={'Label View'} />
      <FlatList data={labels} keyExtractor={item => item.labelId} renderItem={({item,index}) => <DrawerItem labelStyle={{ fontSize: 18 }} label={item.name} onPress={() => {props.navigation.closeDrawer(); props.onLabel(item.labelId);} } />} />
    </SafeAreaView>
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
      <TouchableOpacity style={{ position: "absolute", left: -24, top: '50%', translateY: -32, backgroundColor: '#282827', width: 32, height: 64, borderRadius: 8 }} onPress={toggleControl}></TouchableOpacity>
      <TouchableOpacity style={{ position: "absolute", right: -24, top: '50%', translateY: -32, backgroundColor: '#282827', width: 32, height: 64, borderRadius: 8 }} onPress={toggleLabel}></TouchableOpacity>
    </View>
  );
}

function ContactDrawerContent(props) {
  contactNav = props.navigation;
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
    <SafeAreaView>
      <DrawerItem labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#000000' }} label={'Label View'} />
      <FlatList data={labels} keyExtractor={item => item.labelId} renderItem={({item,index}) => <DrawerItem labelStyle={{ fontSize: 18 }} label={item.name} onPress={() => {props.navigation.closeDrawer(); props.onLabel(item.labelId);} } />} />
    </SafeAreaView>
  );
}

function ContactNavScreen() {
  const selected = (id: string) => {
    console.log("SELECTED: " + id);
  };

  return (
    <ContactDrawer.Navigator navigationOptions={{title: 'ro'}} drawerPosition={'right'} drawerContent={(props) => <ContactDrawerContent {...props} {...{onLabel: selected}} />}>
      <ContactDrawer.Screen name="ContactScreen" component={ContactScreen} />
    </ContactDrawer.Navigator>
  )
}

function ContactScreen() {
  const toggleLabel = () => {
    contactNav.openDrawer();
  };
  const toggleControl = () => {
    homeNav.openDrawer();
  };
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Contact</Text>
      <TouchableOpacity style={{ position: "absolute", left: -24, top: '50%', translateY: -32, backgroundColor: '#282827', width: 32, height: 64, borderRadius: 8 }} onPress={toggleControl}></TouchableOpacity>
      <TouchableOpacity style={{ position: "absolute", right: -24, top: '50%', translateY: -32, backgroundColor: '#282827', width: 32, height: 64, borderRadius: 8 }} onPress={toggleLabel}></TouchableOpacity>
    </View>
  );
}

function PersonalDrawerContent(props) {
  personalNav = props.navigation;
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
    <SafeAreaView>
      <DrawerItem labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#000000' }} label={'Label View'} />
      <FlatList data={labels} keyExtractor={item => item.labelId} renderItem={({item,index}) => <DrawerItem labelStyle={{ fontSize: 18 }} label={item.name} onPress={() => {props.navigation.closeDrawer(); props.onLabel(item.labelId);} } />} />
    </SafeAreaView>
  );
}

function PersonalNavScreen() {
  const selected = (id: string) => {
    console.log("SELECTED: " + id);
  };

  return (
    <PersonalDrawer.Navigator navigationOptions={{title: 'ro'}} drawerPosition={'right'} drawerContent={(props) => <PersonalDrawerContent {...props} {...{onLabel: selected}} />}>
      <PersonalDrawer.Screen name="PersonalScreen" component={PersonalScreen} />
    </PersonalDrawer.Navigator>
  )
}

function PersonalScreen() {

  const toggleLabel = () => {
    personalNav.openDrawer();
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
      <Text>Personal</Text>
      <TouchableOpacity style={{ position: "absolute", left: -24, top: '50%', translateY: -32, backgroundColor: '#282827', width: 32, height: 64, borderRadius: 8 }} onPress={toggleControl}></TouchableOpacity>
      <TouchableOpacity style={{ position: "absolute", right: -24, top: '50%', translateY: -32, backgroundColor: '#282827', width: 32, height: 64, borderRadius: 8 }} onPress={toggleLabel}></TouchableOpacity>
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
    <SafeAreaView style={{ paddingTop: 18 }}>
      <DrawerItem label={'Contact Search'} labelStyle={{ fontSize: 18 }} onPress={() => {
        props.navigation.closeDrawer();
        props.navigate('Search');
      }} />
      <DrawerItem label={'Labels'} labelStyle={{ fontSize: 18 }} onPress={() => {
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
    if(contactNav != null) {
      contactNav.closeDrawer();
    }
    if(personalNav != null) {
      personalNav.closeDrawer();
    }
  };

  return (
    <Tab.Navigator tabBarOptions={{showLabel: false}} >
      <Tab.Screen name="Personal" component={PersonalNavScreen} 
          listeners={({ navigation, route }) => ({
            tabPress: e => { tabbed(); }
          })}
          options={{ tabBarIcon: ({ color, size }) => (
            <Icon name="user" size={size} color={color} solid />
          )}} />
      <Tab.Screen name="Contact" component={ContactNavScreen} 
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

