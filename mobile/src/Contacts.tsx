import 'react-native-gesture-handler';
import React, { useEffect, forwardRef, useRef, useImperativeHandle } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Platform, Linking, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, TextInput, Image, FlatList, Button, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View, ImageBackground } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import UserAvatar from 'react-native-user-avatar';

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
    <SafeAreaView style={{ flex: 1 }}>
      <View>
        <DrawerItem labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#000000' }} label={'Label View'} />
        <FlatList data={labels} keyExtractor={item => item.labelId} renderItem={({item,index}) => <DrawerItem labelStyle={{ fontSize: 18 }} label={item.name} onPress={() => {props.navigation.closeDrawer(); props.onLabel(item.labelId);} } />} />
      </View>
    </SafeAreaView>
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

  const [entries, setEntries] = React.useState([]);
  const [identity, setIdentity] = React.useState({});
  const [contacts, setContacts] = React.useState([]);

  let diatum: Diatum = useDiatum();
  const update = () => {
    diatum.getIdentity().then(i => {
      setEntries([ { type: 'identity', id: i.amigoId, name: i.name, handle: i.handle, imgUrl: i.imageUrl } ]);
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
    diatum.setListener(DiatumEvent.Identity, update);
    return () => {
      if(props.clearListener != null) {
        props.clearListener();
      }
      diatum.clearListener(DiatumEvent.Identity, update);
    }
  }, []);

  return (
      <FlatList data={entries} keyExtractor={item => item.id} renderItem={ContactEntry} />
  )
}

function ContactEntry({item}) {

  console.log("ITEM", item.imgUrl);

  if(item.type == 'identity') {
    return (
        <View style={{ height: 64, flexDirection: 'row' }}>
          <View style={{ width: 12, backgroundColor: 'green' }} />
          <View style={{ width: 64, height: 64, alignItems: 'center', justifyContent: 'center' }}>
            <Image style={{ width: 48, height: 48, borderRadius: 32 }} source={{ uri: item.imgUrl, cache: 'force-cache' }}/>
          </View>
          <View style={{ paddingLeft: 8, height: 64, justifyContent: 'center' }}>
            <Text style={{ fontSize: 18 }}><Icon name="user-o" style={{ fontSize: 16 }}/>&nbsp;{item.name}</Text>
            <Text>{item.handle}</Text>
          </View>
      </View>
    )
  }

}

