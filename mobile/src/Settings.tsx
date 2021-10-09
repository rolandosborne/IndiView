import 'react-native-gesture-handler';
import React, { useEffect, forwardRef, useRef, useImperativeHandle } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Dimensions, Platform, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, TextInput, Image, FlatList, Button, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View, ImageBackground, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import UserAvatar from 'react-native-user-avatar';
import OptionsMenu from "react-native-option-menu";
import { useNavigation } from '@react-navigation/native';

import PushNotification from "react-native-push-notification";

import Modal from 'react-native-modal';
import { IndiViewCom, Contact } from "./IndiViewCom";
import { AppSuppport, useApp } from './AppSupport';
import { Diatum, DiatumEvent } from '../diatum/Diatum';
import { DiatumProvider, useDiatum } from "../diatum/DiatumContext";

const APP_CONFIG: string = 'INDIVIEW_CONFIG';

export function Settings({ navigation }) {

  const [quality, setQuality] = React.useState('sd');
  const [searchable, setSearchable] = React.useState(true);  
  const [notifications, setNotifications] = React.useState(false);  
  const [muting, setMuting] = React.useState(true);  

  let app = useApp();
  let diatum = useDiatum();

  useEffect(async () => {
    let c = await app.getConfig();
    if(c == null) {
      c = await IndiViewCom.getSettings(app.getToken());
      await diatum.setAccountData(APP_CONFIG, c);
      app.setConfig(c);
    }
    setQuality(c.videoQuality);
    setSearchable(c.searchable);
    setNotifications(c.notifications);
    setMuting(c.videoMute);
  }, []);

  const onSearch = async () => {
    let s = !searchable;
    setSearchable(s);

    // sync to store and server
    let c = await app.getConfig();
    c.searchable = s;
    app.setConfig(c);
    try {
      IndiViewCom.setSettings(app.getToken(), c);
    }
    catch(err) {
      console.log(err);
      Alert.alert("failed to save settings");
    }
  };

  const onNotify = async () => {
    let n = !notifications;
    setNotifications(n);
    if(n) {
	    PushNotification.requestPermissions();
    }

    // sync to store and server
    let c = await app.getConfig();
    c.notifications = n;
    app.setConfig(c);
    try {
      IndiViewCom.setSettings(app.getToken(), c);
    }
    catch(err) {
      console.log(err);
      Alert.alert("failed to save settings");
    }
  };

  const onMute = async () => {
    let m = !muting;
    setMuting(m);

    // sync to store and server
    let c = await app.getConfig();
    c.videoMute = m;
    app.setConfig(c);
    try {
      IndiViewCom.setSettings(app.getToken(), c);
    }
    catch(err) {
      console.log(err);
      Alert.alert("failed to save settings");
    }
  };

  const onQuality = async (q: string) => {
    setQuality(q);

    // sync to store and server
    let c = await app.getConfig();
    c.videoQuality = q;
    app.setConfig(c);
    try {
      IndiViewCom.setSettings(app.getToken(), c);
    }
    catch(err) {
      console.log(err);
      Alert.alert("failed to save settings");
    }
  };

  return (
    <View style={{ marginTop: 8 }}>

      <View style={{ margin: 16, borderBottomWidth: 1, borderColor: '#888888' }}>
        <Text>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#222222', paddingLeft: 16, paddingRight: 16 }}>Searchable:</Text>
          <Text style={{ fontSize: 14, color: '#222222' }}> allow your account to be visible in the 'Contact Search' page.</Text>
        </Text>
        <View style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ width: 64, textAlign: 'right' }}>No</Text>
          <TouchableOpacity activeOpacity={1} style={{ margin: 16, width: 48, height: 24, borderRadius: 16, backgroundColor: searchable ? '#0072CC' : '#888888', justifyContent: 'center' }} onPress={onSearch}>
            <View style={{ margin: 1, borderRadius: 16, flex: 1, aspectRatio: 1, backgroundColor: '#ffffff', alignSelf: searchable ? 'flex-end' : 'flex-start' }}></View>
          </TouchableOpacity>
          <Text style={{ width: 64, textAlign: 'left' }}>Yes</Text>
        </View>
      </View>

      <View style={{ margin: 16, borderBottomWidth: 1, borderColor: '#888888' }}>
        <Text>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#222222', paddingLeft: 16, paddingRight: 16 }}>Notifications:</Text>
          <Text style={{ fontSize: 14, color: '#222222' }}> show a message when a conversation event occurs.</Text>
        </Text>
        <View style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ width: 64, textAlign: 'right' }}>No</Text>
          <TouchableOpacity activeOpacity={1} style={{ margin: 16, width: 48, height: 24, borderRadius: 16, backgroundColor: notifications ? '#0072CC' : '#888888', justifyContent: 'center' }} onPress={onNotify}>
            <View style={{ margin: 1, borderRadius: 16, flex: 1, aspectRatio: 1, backgroundColor: '#ffffff', alignSelf: notifications ? 'flex-end' : 'flex-start' }}></View>
          </TouchableOpacity>
          <Text style={{ width: 64, textAlign: 'left' }}>Yes</Text>
        </View>
      </View>

      <View style={{ margin: 16, borderBottomWidth: 1, borderColor: '#888888' }}>
        <Text>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#222222', paddingLeft: 16, paddingRight: 16 }}>Muting:</Text>
          <Text style={{ fontSize: 14, color: '#222222' }}> default audio state for video playback within feed.</Text>
        </Text>
        <View style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ width: 64, textAlign: 'right' }}>Mute</Text>
          <TouchableOpacity activeOpacity={1} style={{ margin: 16, width: 48, height: 24, borderRadius: 16, backgroundColor: muting ? '#888888' : '#0072CE', justifyContent: 'center' }} onPress={onMute}>
            <View style={{ margin: 1, borderRadius: 16, flex: 1, aspectRatio: 1, backgroundColor: '#ffffff', alignSelf: muting ? 'flex-start' : 'flex-end' }}></View>
          </TouchableOpacity>
          <Text style={{ width: 64, textAlign: 'left' }}>Unmute</Text>
        </View>
      </View>

      <View style={{ margin: 16, borderBottomWidth: 1, borderColor: '#888888' }}>
        <Text>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#222222', paddingLeft: 16, paddingRight: 16 }}>Streaming:</Text>
          <Text style={{ fontSize: 14, color: '#222222' }}> default video playback quality.</Text>
        </Text>
        <View style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <TouchableOpacity activeOpacity={1} style={{ margin: 16, alignItems: 'center', justifyContent: 'center' }} onPress={() => onQuality('lq')}>
            <Text style={{ fontSize: 12, color: '#444444' }}>Low</Text>
            <View style={{ margin: 8, width: 16, height: 16, borderRadius: 8, backgroundColor: quality=='lq' ? '#0072CE' : '#888888', justifyContent: 'center' }}>
            </View>
          </TouchableOpacity>
 
          <TouchableOpacity activeOpacity={1} style={{ margin: 16, alignItems: 'center', justifyContent: 'center' }} onPress={() => onQuality('sd')}>
            <Text style={{ fontSize: 12, color: '#444444' }}>Standard</Text>
            <View style={{ margin: 8, width: 16, height: 16, borderRadius: 8, backgroundColor: quality=='sd' ? '#0072CE' : '#888888', justifyContent: 'center' }}>
            </View>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={1} style={{ margin: 16, alignItems: 'center', justifyContent: 'center' }} onPress={() => onQuality('hd')}>
            <Text style={{ fontSize: 12, color: '#444444' }}>High</Text>
            <View style={{ margin: 8, width: 16, height: 16, borderRadius: 8, backgroundColor: quality=='hd' ? '#0072CE' : '#888888', justifyContent: 'center' }}>
            </View>
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
}

