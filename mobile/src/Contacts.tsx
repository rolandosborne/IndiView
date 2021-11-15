import 'react-native-gesture-handler';
import React, { useEffect, forwardRef, useRef, useImperativeHandle } from 'react';
import { SafeAreaView, Alert, Dimensions, Platform, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, TextInput, Image, FlatList, Button, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View, ImageBackground, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import UserAvatar from 'react-native-user-avatar';
import OptionsMenu from "react-native-option-menu";
import { useNavigation } from '@react-navigation/native';

import { Latch, useLatch } from './LatchContext';
import { Diatum, DiatumEvent } from '../diatum/Diatum';
import { AttachCode, getAttachCode } from '../diatum/DiatumUtil';
import { DiatumSession, LabelEntry } from '../diatum/DiatumTypes';
import { DiatumProvider, useDiatum } from "../diatum/DiatumContext";
import { IndiViewCom } from "./IndiViewCom";

const ContactDrawer = createDrawerNavigator();
let contactNav = null;

function ContactDrawerContent(props) {
  contactNav = props.navigation;
  const [labelId, setLabelId] = React.useState(null);
  const [labels, setLabels] = React.useState([]);
  let diatum: Diatum = useDiatum();
  const update = () => {
    diatum.getLabels().then(l => {
      setLabels(l);
    }).catch(err => {
      console.log(err);
    });
  };

  const setLabel = (id: string) => {
    setLabelId(id);
    props.onLabel(id);
  }

  const clearLabel = () => {
    setLabelId(null);
    props.onLabel(null);
  }

  useEffect(() => {
    diatum.setListener(DiatumEvent.Labels, update);
    return () => {
      diatum.clearListener(DiatumEvent.Labels, update);
    }
  }, []);

  return (
      <View style={{ flex: 1 }}>
        <View style={{ width: '100%', paddingTop: 32, backgroundColor: '#282827', alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
          <Icon name="tag" style={{ marginLeft: 16, fontSize: 18, color: '#ffffff' }} />
          <DrawerItem style={{ flex: 1 }} labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#ffffff', backgroundColor: '#282827', textAlign: 'left' }} label={'Contact Filter'} />
        </View>
        <FlatList data={labels} keyExtractor={item => item.labelId} renderItem={({item,index}) => { 
          if(labelId == item.labelId) {
            return <DrawerItem labelStyle={{ fontSize: 18, color: '#0072CC' }} label={item.name} onPress={() => {props.navigation.closeDrawer(); clearLabel();} } />
          }
          else {
            return <DrawerItem labelStyle={{ fontSize: 18, color: '#282827' }} label={item.name} onPress={() => {props.navigation.closeDrawer(); setLabel(item.labelId);} } />
          }
        }} />
      </View>
  );
}

export function Contacts({ navigation }) {
  
  const callbackRef = useRef(null);
  const latchColorRef = useRef('#282827');

  const latch = useLatch();
  const onLatch = () => {
    contactNav.toggleDrawer();
  };

  useEffect(() => {
    const unfocus = navigation.addListener('focus', () => {
      contactNav.closeDrawer();
      latch.setToggleListener(onLatch, latchColorRef.current);
    });
    return (() => {
      latch.clearToggleListener(onLatch);
      unfocus();
    }) 
  }, []);

  const selected = (id: string) => {
    if(id == null) {
      latchColorRef.current = '#282827';
    }
    else {
      latchColorRef.current = '#0077CC';
    }
    latch.setColor(latchColorRef.current);
    if(callbackRef.current != null) {
      callbackRef.current(id);
    }
  };

  const setCallback = (cb: (id: string) => {}) => {
    callbackRef.current = cb;
  };

  const clearCallback = () => {
    callbackRef.current = null;
  };

  return (
    <View style={{ flex: 1 }}>
      <ContactDrawer.Navigator navigationOptions={{title: 'ro'}} drawerPosition={'right'} drawerContent={(props) => <ContactDrawerContent {...props} {...{onLabel: selected}} />}>
        <ContactDrawer.Screen name="Contacts">{(props) => { 
          return (
            <View style={{ flex: 1 }}>
              <ContactList {...props} {...{setListener: setCallback, clearListener: clearCallback}}/> 
            </View>
          )
        }}</ContactDrawer.Screen>
      </ContactDrawer.Navigator>
    </View>
  )
}

function ContactList(props) {

  const [labelId, setLabelId] = React.useState(null);
  const [identity, setIdentity] = React.useState([]);
  const [contacts, setContacts] = React.useState([]);

  const labelIdRef = useRef(labelId);
  const _setLabelId = id => {
    labelIdRef.current = id;
    setLabelId(id);
  }

  let diatum: Diatum = useDiatum();
  const updateIdentity = () => {
    diatum.getIdentity().then(i => {
      let entry = [{ type: 'pad', amigoId: 'top' }];
      if(i != null) {
        entry.push({ type: 'identity', amigoId: "_" + i.amigoId, name: i.name, handle: i.handle, registry: i.registry, imageUrl: i.imageUrl, errorFlag: i.errorFlag });
      }
      setIdentity(entry);
    }).catch(err => {
      console.log(err);
    });
  };
  const updateContacts = () => {
    updateLabelContacts(labelIdRef.current);
  };

  const Instructions = () => {
    if(labelIdRef.current == null && contacts.length == 1) {
      return (
        <View style={{ position: 'absolute', marginLeft: 32, marginRight: 32, marginBottom: 16, padding: 16, backgroundColor: '#dddddd', borderRadius: 8, bottom: 0 }}>
          <Text style={{ color: '#444444', fontSize: 16 }}>Use the 'Contact Search' page from the left menu to find and connect with others</Text>
        </View>
      );
    }
    return (<></>);
  }

  const updateLabelContacts = (id: string) => {
    diatum.getContacts(id).then(c => {
      for(let i = 0; i < c.length; i++) {
        c[i].type = 'contact';
      }
      c.push({ type: 'pad', amigoId: 'bottom' });
      setContacts(c);
    }).catch(err => {
      console.log(err);
    });
  }

  const setLabel = (id: string) => {
    _setLabelId(id);
    updateLabelContacts(id);
  };

  useEffect(() => {
    props.setListener(setLabel);
    diatum.setListener(DiatumEvent.Identity, updateIdentity);
    diatum.setListener(DiatumEvent.Contact, updateContacts);
    diatum.setListener(DiatumEvent.Amigos, updateContacts);
    diatum.setListener(DiatumEvent.Share, updateContacts);
    return () => {
      props.clearListener();
      diatum.clearListener(DiatumEvent.Identity, updateIdentity);
      diatum.clearListener(DiatumEvent.Contact, updateContacts);
      diatum.clearListener(DiatumEvent.Amigos, updateContacts);
      diatum.clearListener(DiatumEvent.Share, updateContacts);
    }
  }, []);

  return (
    <SafeAreaView style={{ flex: 1}} forceInset={{ bottom: 'never'}} >
      <FlatList data={identity.concat(contacts)} keyExtractor={item => item.amigoId} renderItem={({item}) => <ContactEntry item={item} /> } />
      <Instructions />
    </SafeAreaView>
  )
}

function ContactControl({attributes}) {

  let hasPhone: boolean = false;
  let phoneOptions = [];
  let phoneActions = [];
  if(attributes != null && attributes.phone != null && attributes.phone.length > 0) {
    hasPhone = true;
    for(let i = 0; i < attributes.phone.length; i++) {
      let type = attributes.phone[i].type == null ? "" : " - " + attributes.phone[i].type;
      phoneOptions.push( attributes.phone[i].value + type );
      phoneActions.push( () => { Linking.openURL("tel:" + attributes.phone[i].value.replace(/[^0-9]/g,'')) });
    }
    if(Platform.OS === 'ios') {
      phoneOptions.push("Cancel");
    }
    phoneActions.push(()=>{});
  }

  let hasText: boolean = false;
  let textOptions = [];
  let textActions = [];
  if(attributes != null && attributes.text != null && attributes.text.length > 0) {
    hasText = true;
    for(let i = 0; i < attributes.text.length; i++) {
      let type = attributes.phone[i].type == null ? "" : " - " + attributes.phone[i].type;
      textOptions.push(attributes.text[i].value + type);
      textActions.push(() => { Linking.openURL("sms:+" + attributes.text[i].value.replace(/[^0-9]/g,'')) });
    } 
    if(Platform.OS === 'ios') {
      textOptions.push("Cancel");
    }
    textActions.push(()=>{});
  }
 
  const phone = (<View style={{ width: 40, height: 40, backgroundColor: '#dddddd', justifyContent: 'center', alignItems: 'center', borderRadius: 8 }}><Icon name="phone" style={{ color: '#444444', fontSize: 24 }} /></View>)
  const text = (<View style={{ width: 40, height: 40, backgroundColor: '#dddddd', justifyContent: 'center', alignItems: 'center', borderRadius: 8 }}><Icon name="tty" style={{ color: '#444444', fontSize: 24 }} /></View>)

  if(hasPhone && hasText) {
    return (
      <View style={{ paddingRight: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
        <View style={{ marginRight: 8, marginLeft: 8 }}>
          <OptionsMenu customButton={phone} options={phoneOptions} actions={phoneActions}/>
        </View>
        <View style={{ marginRight: 8, marginLeft: 8 }}>
          <OptionsMenu customButton={text} options={textOptions} actions={textActions}/>
        </View>
      </View>
    )
  }
  if(hasPhone) {
    return (
      <View style={{ paddingRight: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
        <View style={{ marginRight: 8, marginLeft: 8 }}>
          <OptionsMenu customButton={phone} options={phoneOptions} actions={phoneActions}/>
        </View>
      </View>
    )
  }
  if(hasText) {
    return (
      <View style={{ width: 40, height: 40, backgroundColor: '#ccddee', justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginRight: 16 }}>
        <OptionsMenu customButton={text} options={textOptions} actions={textActions}/>
      </View>
    )
  }
  return (
    <View></View>
  )
}

function ContactEntry({item}) {
  const navigation = useNavigation();
  const onProfile = () => {
    console.log(item);
    let view = { amigoId: item.amigoId, name: item.name, handle: item.handle, imageUrl: item.imageUrl, registry: item.registry, location: item.location, description: item.description, showFooter: false };
    navigation.navigate("ContactProfile", { ...view });
  };
  const onIdentity = () => {
    console.log(item);
    let view = { amigoId: item.amigoId, name: item.name, handle: item.handle, imageUrl: item.imageUrl, registry: item.registry, location: item.location, description: item.description, showFooter: false };
    navigation.navigate("MyProfile");
  }

  let nameColor = '#aaaaaa';
  let borderColor = '#888888';
  let opacity = 1; 
  if(item.type == 'contact') {
    if(item.status != 'connected') {
      borderColor = '#444444';
      opacity = 0.5;
    }
    else if(item.errorFlag) {
      borderColor = '#ff8888';
    }
    else {
      borderColor = '#0088ff';
    }
  }
  if(item.type == 'identity') {
    if(item.errorFlag) {
      borderColor = '#dd8888';
    }
    else {
      borderColor = '#00bb88';
    }
  }

  let name: string = "not set";
  if(item.name != null) {
    name = item.name;
    nameColor = '#222222';
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

  const Control = () => {
    if(item.status == 'connected') {
      return (<ContactControl attributes={item.appAttribute} />);
    }
    return (<></>);
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

  if(item.type == 'contact') {
    return (
      <TouchableOpacity activeOpacity={1} style={{ height: 64, paddingLeft: 16, paddingRight: 16, flexDirection: 'row' }} onPress={onProfile}>
        <View style={{ width: 64, height: 64, alignItems: 'center', justifyContent: 'center' }}>
          <Image opacity={opacity} style={{ width: 48, height: 48, borderRadius: 32, borderWidth: 2, borderColor: borderColor }} source={imgSrc}/>
        </View>
        <View style={{ paddingLeft: 8, height: 64, justifyContent: 'center' }}>
          <Text style={{ fontSize: 18, color: nameColor }}>{name}</Text>
          <Text>{item.handle}{Reggy()}</Text>
        </View>
        <View style={{ flexGrow: 1 }}></View>
        <Control />
      </TouchableOpacity>
    )
  }

  if(item.type == 'identity') {
    return (
      <TouchableOpacity activeOpacity={1} style={{ height: 64, paddingLeft: 16, flexDirection: 'row' }} onPress={onIdentity}>
        <View style={{ width: 64, height: 64, alignItems: 'center', justifyContent: 'center' }}>
          <Image style={{ width: 48, height: 48, borderRadius: 32, borderWidth: 2, borderColor: borderColor }} source={imgSrc}/>
        </View>
        <View style={{ paddingLeft: 8, height: 64, justifyContent: 'center' }}>
          <Text style={{ fontSize: 18 }}><Icon name="cog" style={{ fontSize: 16 }}/>&nbsp;{item.name}</Text>
          <Text>{item.handle}{Reggy()}</Text>
        </View>
      </TouchableOpacity>
    )
  }

}

