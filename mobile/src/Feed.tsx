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

const FeedDrawer = createDrawerNavigator();
let contactNav = null;

function FeedDrawerContent(props) {
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

export function Feed({ navigation }) {
  
  const [latchColor, setLatchColor] = React.useState('#282827');
  const latchColorRef = useRef(latchColor);
  const _setLatchColor = color => {
    latchColorRef.current = color;
    setLatchColor(color);
    latch.setColor(color);
  };

  const latch = useLatch();
  const onLatch = () => {
    contactNav.toggleDrawer();
  };

  useEffect(() => {
    _setLatchColor(latchColor);
    const unfocus = navigation.addListener('focus', () => {
      contactNav.closeDrawer();
      latch.setToggleListener(onLatch, latchColorRef.current);
    });
    return (() => {
      latch.clearToggleListener(onLatch);
      unfocus();
    }) 
  }, []);

  let callack: (id: string) => {} = null;
  const selected = (id: string) => {
    if(id == null) {
      _setLatchColor('#282827');
    }
    else {
      _setLatchColor('#0077CC');
    }
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
    <View style={{ flex: 1 }}>
      <FeedDrawer.Navigator navigationOptions={{title: 'ro'}} drawerPosition={'right'} drawerContent={(props) => <FeedDrawerContent {...props} {...{onLabel: selected}} />}>
        <FeedDrawer.Screen name="Feed">{(props) => { 
          return (
            <View style={{ flex: 1 }}>
              <ContactList setListener={setCallback} clearListner={clearCallback} /> 
            </View>
          )
        }}</FeedDrawer.Screen>
      </FeedDrawer.Navigator>
    </View>
  )
}

function ContactList({ setListener, clearListener }) {

  const [contacts, setContacts] = React.useState([]);
  const labelIdRef = useRef(null);

  let diatum: Diatum = useDiatum();
  const updateContacts = async () => {
    let c = await diatum.getContacts(labelIdRef.current, "connected");
    let grid = [];
    for(let i = -1; i < c.length; i+=3) {
      if(i < 0) {
        grid.push({ id: "", left: null, middle: c[i+1], right: c[i+2] });
      }
      else {
        grid.push({ id: c[i+0].amigoId, left: c[i+0], middle: c[i+1], right: c[i+2] });
      }
    }
    setContacts(grid);
  }

  const setLabel = (id: string) => {
    labelIdRef.current = id;
    updateContacts()
  };

  useEffect(() => {
    if(setListener != null) {
      setListener(setLabel);
    }
    diatum.setListener(DiatumEvent.Contact, updateContacts);
    diatum.setListener(DiatumEvent.Amigos, updateContacts);
    diatum.setListener(DiatumEvent.Share, updateContacts);
    return () => {
      if(clearListener != null) {
        clearListener();
      }
      diatum.clearListener(DiatumEvent.Contact, updateContacts);
      diatum.clearListener(DiatumEvent.Amigos, updateContacts);
      diatum.clearListener(DiatumEvent.Share, updateContacts);
    }
  }, []);

  return (
    <SafeAreaView style={{ fle: 1}} foctor={item => item.id} forceInset={{ bottom: 'never' }}>
      <FlatList data={contacts} keyExtractor={item => item.id} renderItem={({item}) => <ContactRow item={item} />} />
    </SafeAreaView>
  );
}

function ContactRow({item}) {

  if(item.left == null) {
    return (
      <View style={{ width: '100%', flexDirection: 'row' }}>
        <IdentityEntry style={{ flex: 1 }} />
        <ContactEntry style={{ flex: 1 }} entry={item.middle} />
        <ContactEntry style={{ flex: 1 }} entry={item.right} />
      </View>
    );
  }
  else {
    return (
      <View style={{ width: '100%', flexDirection: 'row' }}>
        <ContactEntry style={{ flex: 1 }} entry={item.left} />
        <ContactEntry style={{ flex: 1 }} entry={item.middle} />
        <ContactEntry style={{ flex: 1 }} entry={item.right} />
      </View>
    );
  }
}

function IdentityEntry() {
  const [identity, setIdentity] = React.useState({});

  let diatum = useDiatum();
  const updateIdentity = async () => {
    let i = await diatum.getIdentity();
    console.log(i);
    setIdentity(i);
  };

  let navigation = useNavigation();
  const onIdentity = () => {
    navigation.navigate("MyFeed");
  }

  useEffect(() => {
    diatum.setListener(DiatumEvent.Identity, updateIdentity);
    return () => {
      diatum.clearListener(DiatumEvent.Identity, updateIdentity);
    };
  }, []);  

  let imgSrc = {};
  if(identity.imageUrl == null) {
    imgSrc = require('../assets/avatar.png');
  }
  else { 
    imgSrc = { uri: identity.imageUrl, cache: 'force-cache' };
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', padding: 16 }}>
      <TouchableOpacity activeOpacity={1} onPress={onIdentity}>
        <Image style={{ width: 92, height: 92, borderRadius: 32, borderWidth: 2, borderColor: identity.errorFlag ? '#ff8888' : '#00bb88' }} source={ imgSrc }/>
        <View style={{ position: 'absolute', bottom: 0, right: 0, alignItems: 'center', justifyContent: 'center', padding: 2 }}>
          <Icon name="cog" style={{ fontSize: 32, color: '#222200' }} />
          <Icon name="cog" style={{ position: 'absolute', fontSize: 28, color: '#ffffff' }} />
        </View>
      </TouchableOpacity>
      <Text style={{ fontSize: 16, color: '#444444' }}>{ identity.handle }</Text>
    </View>
  );
}

function ContactEntry({entry}) {
  if(entry == null) {
    return (<View style={{ flex: 1, alignItems: 'center', padding: 16 }}></View>);
  }

  let navigation = useNavigation();
  const onContact = () => {
    navigation.navigate("ContactFeed");
  }

  let imgSrc = {};
  if(entry.imageUrl == null) {
    imgSrc = require('../assets/avatar.png');
  }
  else {
    imgSrc = { uri: entry.imageUrl, cache: 'force-cache' };
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', padding: 16 }}>
      <TouchableOpacity activeOpacity={1} onPress={onContact}>
        <Image style={{ width: 92, height: 92, borderRadius: 32, borderWidth: 2, borderColor: entry.errorFlag ? '#ff8888' : '#00bb88' }} source={ imgSrc }/>
        <View style={{ position: 'absolute', bottom: 0, right: 0, alignItems: 'center', justifyContent: 'center', padding: 2 }}>
          <Icon name="star" style={{ fontSize: 32, color: '#222200' }} />
          <Icon name="star" style={{ position: 'absolute', fontSize: 28, color: '#ffffff' }} />
        </View>
      </TouchableOpacity>
      <Text style={{ fontSize: 16, color: '#444444' }}>{ entry.handle }</Text>
    </View>
  );
}

