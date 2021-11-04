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
import { DiatumSession, LabelEntry } from '../diatum/DiatumTypes';
import { DiatumProvider, useDiatum } from "../diatum/DiatumContext";
import { IndiViewCom, Contact } from "./IndiViewCom";
import { AppSuppport, useApp } from './AppSupport';

function Prompt({ callback }) {
  const [search, setSearch] = React.useState("");
 
  const onSearchText = (val) => {
    setSearch(val);
  }

  const onSearch = () => {
    callback(search);
  }

  const onCancel = () => {
    callback(null);
  };
 
  return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 48 }}>
        <View style={{ width: '90%', backgroundColor: '#ffffff', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
          <TextInput style={{ backgroundColor: '#555555', color: '#ffffff', borderRadius: 8, textAlign: 'center', fontSize: 18, width: '80%', height: 40, margin: 16 }} autoCapitalize="none" placeholder="Profile Name or Handle" placeholderTextColor='#ffffff' onSubmitEditing={onSearch} onChangeText={onSearchText}/>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <TouchableOpacity onPress={onSearch}>
              <Text style={{ color: '#0077CC', margin: 16, fontSize: 20 }}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onCancel}>
              <Text style={{ color: '#0077CC', margin: 16, fontSize: 20 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
  );
}

function Results({ match }) {
  const [contacts, setContacts] = React.useState(null);
  let support: AppSupport = useApp();
  
  useEffect(async () => {
    let search: Contact[] = [];
    if(match != null) {
      try {   
        search = await IndiViewCom.search(support.getToken(), match);
      }
      catch(err) {
        console.log(err);
        Alert.alert("Failed to search directory.");
      }
    }
    setContacts(search);
  }, [match]);

  if(contacts == null) {
    return (<></>);
  }
  else if(contacts.length == 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 20, color: '#444444', margin: 32, textAlign: 'center' }}>No contacts found with matching name or handle.</Text>
      </View>
    );
  }
  else {
    return (<FlatList data={contacts} keyExtractor={item => item.amigoId} renderItem={({item, index}) => <SearchEntry item={item} index={index}/> } />);
  }
} 

function SearchEntry({item, index}) {

  let diatum = useDiatum();
  let pad: number = 0;
  if(index == 0) {
    pad = 8;
  }
  let name: string = "not set";
  let nameColor = "#888888";
  if(item.name != null) {
    name = item.name;
    nameColor = '#222222';
  }
  let imgSrc = {};
  if(item.registry == null || !item.logoSet) {
    imgSrc = require('../assets/avatar.png');
  }
  else {
    imgSrc = { uri: diatum.getRegistryImage(item.amigoId, item.registry), cache: 'force-cache' };
  }

  let Reggy = () => {
    if(item == null || item.registry == null) {
      return '';
    }
    if(item.registry.startsWith('https://registry.') && item.registry.endsWith('/app')) {
      return '@' + item.registry.substring(17, item.registry.length - 4);
    }
    if(item.registry.startsWith('https://diatum') && item.registry.endsWith('/registry')) {
      return ' | ' + item.registry.substring(15, item.registry.length - 9);
    }
    if(item.registry.startsWith('https://') && item.registry.endsWith('/registry')) {
      return ' || ' + item.registry.substring(8, item.registry.length - 9);
    }
    return ' ?';
  }

  let navigation = useNavigation();
  let onProfile = async () => {
    let imgUrl = null;
    if(item.registry != null && item.logoSet) {
      imgUrl = await diatum.getRegistryImage(item.amigoId, item.registry);
    }
    let view = { amigoId: item.amigoId, name: item.name, handle: item.handle, imageUrl: imgUrl, registry: item.registry, location: item.location, description: item.description, showFooter: true, saved: null };
    navigation.navigate("Contact Profile", {...view});
  }

  return (
    <TouchableOpacity activeOpacity={1} style={{ height: 64, marginTop: pad, paddingLeft: 16, paddingRight: 16, flexDirection: 'row' }} onPress={onProfile}>
      <View style={{ width: 64, height: 64, alignItems: 'center', justifyContent: 'center' }}>
        <Image style={{ width: 48, height: 48, borderRadius: 32, borderWidth: 2, borderColor: '#444444' }} source={imgSrc}/>
      </View>
      <View style={{ paddingLeft: 8, height: 64, justifyContent: 'center' }}>
        <Text style={{ fontSize: 18, color: nameColor }}>{name}</Text>
        <Text>{item.handle}{ Reggy() }</Text>
      </View>
    </TouchableOpacity>
  );
}

export function ContactSearch({ navigation }) {
  const [prompt, setPrompt] = React.useState(true);
  const [search, setSearch] = React.useState(null);

  const onSearch = (value: string) => {
    //IndiViewCom.search(support.getToken(), value).then(c => {
    setPrompt(false);
    if(value != null) {
      setSearch(value);
    }
  }

  const ShowPrompt = () => {
    if(!prompt) {
      return (<></>);
    }
    return (<Prompt callback={onSearch} />);
  };

  const ShowResults = () => {
    if(prompt) {
      return (<></>);
    }
    return (<Results match={search} />);
 }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={onPrompt}>
          <Icon name="search" style={{ color: '#0077CC', fontSize: 18, marginRight: 24 }} />
        </TouchableOpacity>
      )
    });
  }, [navigation]);

  const onPrompt = () => {
    setPrompt(true);
  };

  return (
    <View style={{ flex: 1, width: '100%' }}>
      <ShowPrompt />
      <ShowResults />
    </View>
  )
}

