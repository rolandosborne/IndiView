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
  useEffect(async () => {
    let req: ContactRequest[] = [];
    
    // retrieve saved entries
    let s = await diatum.getContacts(null, "received");
    for(let i = 0; i < s.length; i++) {
      req.push({ pending: false, id: s[i].amigoId, entry: s[i] });
    }

    // retrieve unsaved entries
    let p = await diatum.getContactRequests();
    for(let i = 0; i < p.length; i++) {
      try {
        let amigo = await diatum.getRegistryAmigo(p[i].amigo.amigoId, p[i].amigo.registry);
        req.push({ pending: true, id: p[i].shareId, amigo: amigo });
      }
      catch(err) {
        console.log(err);
        req.push({ pending: true, id: p[i].shareId, amigo: {} });
      }
    }
    setRequests(req);
  }, []);
  return (
    <FlatList style={{ paddingTop: 16, flex: 1 }} data={requests} keyExtractor={item => item.id} renderItem={({item}) => { 
      if(item.pending) {
        return (<PendingEntry item={item} />);
      }
      else {
        return (<SavedEntry item={item} />);
      }
    }} /> 
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

  return (
    <TouchableOpacity activeOpacity={1} style={{ height: 64, paddingLeft: 16, paddingRight: 16, flexDirection: 'row' }}>
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
  let imgSrc = {};
  if(item.amigo == null || item.amigo.logo == null || item.amigo.amigoId == null) {
    imgSrc = require('../assets/avatar.png');
  }
  else {
    imgSrc = { uri: diatum.getRegistryImage(item.amigo.amigoId, item.amigo.registry), cache: 'force-cache' };
  }

  return (
    <TouchableOpacity activeOpacity={1} style={{ height: 64, paddingLeft: 16, paddingRight: 16, flexDirection: 'row' }}>
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
