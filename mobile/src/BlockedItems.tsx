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

export function BlockedItems({ navigation }) {
  const [contacts, setContacts] = React.useState([]);

  let diatum = useDiatum();
  useEffect(() => {
    diatum.setListener(DiatumEvent.Amigos, updateContacts);
    return () => {
      diatum.clearListener(DiatumEvent.Amigos, updateContacts);
    }
  }, []);

  const updateContacts = async () => {
    try {
      setContacts(await diatum.getBlockedContacts());
    }
    catch(err) {
      console.log(err);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: 48, flexDirection: 'row', alignItems: 'flex-end', paddingBottom: 8, borderBottomWidth: 1, borderColor: '#aaaaaa', backgroundColor: '#dddddd' }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Icon name="user" size={24} color={'#0072CC'} solid />
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Icon name="file-picture-o" size={24} color={'#444444'} solid />
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Icon name="comment-o" size={24} color={'#444444'} solid />
        </View>
      </View>
      <FlatList style={{ paddingTop: 16, flex: 1 }} data={contacts} keyExtractor={item => item.amigoId} renderItem={({item}) => <BlockedEntry item={item} /> } />
    </View>
  );
}

function BlockedEntry({item}) {
  let imgSrc = {};
  if(item.imageUrl == null) {
    imgSrc = require('../assets/avatar.png');
  }
  else {
    imgSrc = { uri: item.imageUrl, cache: 'force-cache' };
  }

  let navigation = useNavigation();
  let onProfile = async () => {
    let imgUrl = null;
    if(item.registry != null && item.logoSet) {
      imgUrl = await diatum.getRegistryImage(item.amigoId, item.registry);
    }
    let view = { amigoId: item.amigoId, name: item.name, handle: item.handle, imageUrl: item.imageUrl, registry: item.registry, location: item.location, description: item.description, showFooter: true, saved: null, requested: true };
    navigation.navigate("Contact Profile", {...view});
  }

  return (
    <TouchableOpacity activeOpacity={1} style={{ height: 64, paddingLeft: 16, paddingRight: 16, flexDirection: 'row' }} onPress={onProfile}>
      <View style={{ width: 64, height: 64, alignItems: 'center', justifyContent: 'center' }}>
        <Image style={{ width: 48, height: 48, borderRadius: 32, borderWidth: 2, borderColor: '#888888' }} source={imgSrc}/>
      </View>
      <View style={{ paddingLeft: 8, height: 64, justifyContent: 'center' }}>
        <Text style={{ fontSize: 18 }}>{item.name}</Text>
        <Text>{item.handle}</Text>
      </View>
    </TouchableOpacity>
  );
}
