import 'react-native-gesture-handler';
import React, { useEffect, forwardRef, useRef, useImperativeHandle } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Platform, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, TextInput, Image, FlatList, Button, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View, ImageBackground, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import UserAvatar from 'react-native-user-avatar';
//Linking.openURL(`tel:${phoneNumber}`)

import { Diatum, DiatumEvent } from '../diatum/Diatum';
import { AttachCode, getAttachCode } from '../diatum/DiatumUtil';
import { DiatumSession, LabelEntry } from '../diatum/DiatumTypes';
import { DiatumProvider, useDiatum } from "../diatum/DiatumContext";
import { IndiViewCom } from "./IndiViewCom";

const ContactDrawer = createDrawerNavigator();
let contactNav = null;

class ContactData {
  type: string;
  imgUrl: string;
  name: string;
  handle: string
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
      <View>
        <DrawerItem labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#000000' }} label={'Label View'} />
        <FlatList data={labels} keyExtractor={item => item.labelId} renderItem={({item,index}) => <DrawerItem labelStyle={{ fontSize: 18 }} label={item.name} onPress={() => {props.navigation.closeDrawer(); props.onLabel(item.labelId);} } />} />
      </View>
  );
}

export function ContactScreen() {
  let callack: (id: string) => {} = null;
  const selected = (id: string) => {
    console.log("SELECTED: " + id);
    if(callback != null) {
      callback(id);
    }
  };

  const setCallback = (cb: (id: string) => {}) => {
    callback = cb;
  };

  const clearCallback = () => {
    callback = null;
  };

  return (
    <ContactDrawer.Navigator navigationOptions={{title: 'ro'}} drawerPosition={'right'} drawerContent={(props) => <ContactDrawerContent {...props} {...{onLabel: selected}} />}>
      <ContactDrawer.Screen name="ContactNavScreen">{(props) => <ContactNavScreen {...props} {...{setListener: setCallback, clearListner: clearCallback}}/>}</ContactDrawer.Screen>
    </ContactDrawer.Navigator>
  )
}

function ContactNavScreen(props) {
  const toggleLabel = () => {
    contactNav.openDrawer();
  };
  return (
    <View style={{ flex: 1 }}>
      <Contacts {...props}></Contacts>

      <TouchableOpacity style={{ alignItems: 'center', position: "absolute", right: -24, top: '50%', translateY: -32, width: 48, height: 64, borderRadius: 8 }} onPress={toggleLabel}>
        <View style={{ width: 16, height: 64, backgroundColor: '#282827', borderRadius: 8 }}></View>
      </TouchableOpacity>
    </View>
  );
}

function Contacts(props) {

  const [identity, setIdentity] = React.useState([]);
  const [contacts, setContacts] = React.useState([]);

  let diatum: Diatum = useDiatum();
  const updateIdentity = () => {
    diatum.getIdentity().then(i => {
      let entry = [{ type: 'pad', amigoId: 'top' }];
      if(i != null) {
        entry.push({ type: 'identity', amigoId: i.amigoId, name: i.name, handle: i.handle, imageUrl: i.imageUrl });
      }
      setIdentity(entry);
    }).catch(err => {
      console.log(err);
    });
  };
  const updateContacts = () => {
    diatum.getContacts().then(c => {
      for(let i = 0; i < c.length; i++) {
        c[i].type = 'contact';
      }
      c.push({ type: 'pad', amigoId: 'bottom' });
      setContacts(c);
    }).catch(err => {
      console.log(err);
    });
  };

  const setLabel = (id: string) => {
    console.log("SET LABEL CONTACT: " + id);
  };

  useEffect(() => {
    if(props.setListener != null) {
      props.setListener(setLabel);
    }
    diatum.setListener(DiatumEvent.Identity, updateIdentity);
    diatum.setListener(DiatumEvent.Contact, updateContacts);
    diatum.setListener(DiatumEvent.Amigos, updateContacts);
    diatum.setListener(DiatumEvent.Share, updateContacts);
    return () => {
      if(props.clearListener != null) {
        props.clearListener();
      }
      diatum.clearListener(DiatumEvent.Identity, updateIdentity);
      diatum.clearListener(DiatumEvent.Contact, updateContacts);
      diatum.clearListener(DiatumEvent.Amigos, updateContacts);
      diatum.clearListener(DiatumEvent.Share, updateContacts);
    }
  }, []);

  return (
      <FlatList data={identity.concat(contacts)} keyExtractor={item => item.amigoId} renderItem={ContactEntry} />
  )
}

function ContactControl({attributes}) {

  let hasPhone = attributes != null && attributes.phone != null && attributes.phone.length > 0;
  let hasText = attributes != null && attributes.phone != null && attributes.text.length > 0;
 
  if(hasPhone && hasText) {
    return (
      <View style={{ paddingRight: 16, justifyContent: 'center' }}>
        <Icon name="phone" style={{ fontSize: 24 }}/>
        <Icon name="commenting" style={{ fontSize: 24 }}/>
      </View>
    )
  }
  if(hasPhone) {
    return (
      <View style={{ paddingRight: 16, justifyContent: 'center' }}>
        <Icon name="phone" style={{ fontSize: 24 }}/>
      </View>
    )
  }
  if(hasText) {
    return (
      <View style={{ paddingRight: 16, justifyContent: 'center' }}>
        <Icon name="commenting" style={{ fontSize: 24 }}/>
      </View>
    )
  }
  return (
    <View></View>
  )
}

function ContactEntry({item}) {

  let name: string = "not set";
  let nameColor: string = "#aaaaaa"
  if(item.name != null) {
    name = item.name;
    nameColor = "#222222";
  }
  let imgSrc = {};
  if(item.imageUrl == null) {
    imgSrc = require('../assets/avatar.png');
  }
  else {
    imgSrc = { uri: item.imageUrl, cache: 'force-cache' };
  }

  if(item.type == 'pad') {
    return (
      <View style={{ height: 8, flexDirection: 'row' }} />
    )
  }

  if(item.type == 'contact') {
    return (
     <View style={{ height: 64, paddingLeft: 16, paddingRight: 16, flexDirection: 'row' }}>
        <View style={{ width: 64, height: 64, alignItems: 'center', justifyContent: 'center' }}>
          <Image style={{ width: 48, height: 48, borderRadius: 32, borderWidth: 2, borderColor: '#0088ff' }} source={imgSrc}/>
        </View>
        <View style={{ paddingLeft: 8, height: 64, justifyContent: 'center' }}>
          <Text style={{ fontSize: 18, color: nameColor }}>{name}</Text>
          <Text>{item.handle}</Text>
        </View>
        <View style={{ flexGrow: 1 }}></View>
        <ContactControl attributes={item.appAttribute} />
      </View>
    )
  }

  if(item.type == 'identity') {
    return (
        <View style={{ height: 64, paddingLeft: 16, flexDirection: 'row' }}>
          <View style={{ width: 64, height: 64, alignItems: 'center', justifyContent: 'center' }}>
            <Image style={{ width: 48, height: 48, borderRadius: 32, borderWidth: 2, borderColor: '#00bb88' }} source={imgSrc}/>
          </View>
          <View style={{ paddingLeft: 8, height: 64, justifyContent: 'center' }}>
            <Text style={{ fontSize: 18 }}><Icon name="cog" style={{ fontSize: 16 }}/>&nbsp;{name}</Text>
            <Text>{item.handle}</Text>
          </View>
      </View>
    )
  }

}

