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

import Modal from 'react-native-modal';
import { Diatum, DiatumEvent } from '../diatum/Diatum';
import { DiatumSession, ContactRequest } from '../diatum/DiatumTypes';
import { DiatumProvider, useDiatum } from "../diatum/DiatumContext";
import { IndiViewCom, Contact } from "./IndiViewCom";
import { AppSuppport, useApp } from './AppSupport';

export function ContactRequests({ navigation }) {
  const [requests, setRequests] = React.useState([]);  

  let diatum = useDiatum();
  useEffect(() => {
    diatum.setListener(DiatumEvent.Share, updateRequests);
    diatum.setListener(DiatumEvent.Pending, updateRequests);
    return () => {
      diatum.clearListener(DiatumEvent.Share, updateRequests);
      diatum.clearListener(DiatumEvent.Pending, updateRequests);
    }
  }, []);

  const updateRequests = async () => {
    let req: ContactRequest[] = [];
    
    // retrieve saved entries
    let s = await diatum.getContacts(null, "received");
    for(let i = 0; i < s.length; i++) {
      req.push({ pending: false, id: s[i].amigoId, name: s[i].name, entry: s[i] });
    }

    // retrieve unsaved entries
    let p = await diatum.getContactRequests();
    for(let i = 0; i < p.length; i++) {
      try {
        let amigo = await diatum.getRegistryAmigo(p[i].amigo.amigoId, p[i].amigo.registry);
        req.push({ pending: true, id: p[i].shareId, name: amigo.name, amigo: amigo });
      }
      catch(err) {
        console.log(err);
        req.push({ pending: true, id: p[i].shareId, name: null, amigo: {} });
      }
    }
    req.sort((a, b) => (a.name < b.name) ? -1 : 1);
    setRequests(req);
  };
 
  const Instructions = () => {
    if(requests.length == 0) {
      return (
        <View style={{ position: 'absolute', flexDirection: 'row', marginLeft: 32, marginRight: 32, marginBottom: 16, padding: 16, backgroundColor: '#dddddd', borderRadius: 8, bottom: 0 }}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: '#444444', fontSize: 16, textAlign: 'center' }}>You have no pending requests.</Text>
          </View>
        </View>
      );
    }
    return (<></>);
  }
 
  return (
    <View style={{ paddingTop: 16, flex: 1 }}>
      <FlatList data={requests} keyExtractor={item => item.id} renderItem={({item}) => { 
        if(item.pending) {
          return (<PendingEntry item={item} />);
        }
        else {
          return (<SavedEntry item={item} />);
        }
      }} /> 
      <Instructions />
    </View>
  );
}

function SavedEntry({item}) {
  let imgSrc = {};
  if(item.entry.imageUrl == null) {
    imgSrc = require('../assets/avatar.png');
  }
  else {
    imgSrc = { uri: item.entry.imageUrl, cache: 'force-cache' };
  }

  let diatum = useDiatum();
  const onDenySaved = () => {
    const title = "Do you want to delete the request?";
    const message = '';
    const buttons = [
        { text: 'Yes, Delete', onPress: async () => {
          try {
            await diatum.closeContactConnection(item.id);
          }
          catch(err) {
            console.log(err);
            Alert.alert("failed to delete request");
          }
        }},
        { text: 'Cancel', type: 'cancel' }
    ];
    Alert.alert(title, message, buttons);
  }

  let navigation = useNavigation();
  let onSavedProfile = async () => {
    let imgUrl = null;
    if(item.entry.registry != null && item.entry.logoSet) {
      imgUrl = await diatum.getRegistryImage(item.entry.amigoId, item.entry.registry);
    }
    let view = { amigoId: item.entry.amigoId, name: item.entry.name, handle: item.entry.handle, imageUrl: item.entry.imageUrl, registry: item.entry.registry, location: item.entry.location, description: item.entry.description, showFooter: true, saved: null, requested: true };
    navigation.navigate("Contact Profile", {...view});
  }

  return (
    <TouchableOpacity activeOpacity={1} style={{ height: 64, paddingLeft: 16, paddingRight: 16, flexDirection: 'row' }} onPress={onSavedProfile} onLongPress={onDenySaved}>
      <View style={{ width: 64, height: 64, alignItems: 'center', justifyContent: 'center' }}>
        <Image style={{ width: 48, height: 48, borderRadius: 32, borderWidth: 2, borderColor: '#888888' }} source={imgSrc}/>
      </View>
      <View style={{ paddingLeft: 8, height: 64, justifyContent: 'center' }}>
        <Text style={{ fontSize: 18 }}>{item.entry.name}</Text>
        <Text>{item.entry.handle}</Text>
      </View>
    </TouchableOpacity>
  );
}

function PendingEntry({item}) {
  let diatum = useDiatum();
  let imgSrc = {};
  if(item.amigo == null || item.amigo.logo == null || item.amigo.amigoId == null) {
    imgSrc = require('../assets/avatar.png');
  }
  else {
    imgSrc = { uri: diatum.getRegistryImage(item.amigo.amigoId, item.amigo.registry), cache: 'force-cache' };
  }

  const onDenyPending = () => {
    const title = "Do you want to delete the request?";
    const message = '';
    const buttons = [
        { text: 'Yes, Delete', onPress: async () => {
          try {
            await diatum.clearContactRequest(item.id);
          }
          catch(err) {
            console.log(err);
            Alert.alert("failed to delete label");
          }
        }},
        { text: 'Cancel', type: 'cancel' }
    ];
    Alert.alert(title, message, buttons);
  }

  let navigation = useNavigation();
  let onPendingProfile = async () => {
    let imgUrl = null;
    if(item.amigo.registry != null && item.amigo.logo != null) {
      imgUrl = await diatum.getRegistryImage(item.amigo.amigoId, item.amigo.registry);
    }
    let view = { amigoId: item.amigo.amigoId, name: item.amigo.name, handle: item.amigo.handle, imageUrl: imgUrl, registry: item.amigo.registry, location: item.amigo.location, description: item.amigo.description, showFooter: true, saved: null, requested: true };
    navigation.navigate("Contact Profile", {...view});
  }

  return (
    <TouchableOpacity activeOpacity={1} style={{ height: 64, paddingLeft: 16, paddingRight: 16, flexDirection: 'row' }} onPress={onPendingProfile} onLongPress={onDenyPending}>
      <View style={{ width: 64, height: 64, alignItems: 'center', justifyContent: 'center' }}>
        <Image style={{ width: 48, height: 48, borderRadius: 32, borderWidth: 2, borderColor: '#ffff00' }} source={imgSrc}/>
      </View>
      <View style={{ paddingLeft: 8, height: 64, justifyContent: 'center' }}>
        <Text style={{ fontSize: 18 }}>{item.amigo.name}</Text>
        <Text>{item.amigo.handle}</Text>
      </View>
    </TouchableOpacity>
  );
}
