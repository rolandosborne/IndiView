import 'react-native-gesture-handler';
import React, { useEffect, forwardRef, useRef, useImperativeHandle } from 'react';
import { SafeAreaView, Modal, Alert, Dimensions, Platform, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, TextInput, Image, FlatList, Button, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View, ImageBackground, Linking } from 'react-native';
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

const ConversationDrawer = createDrawerNavigator();
let labelNav = null;

function ConversationDrawerContent(props) {
  labelNav = props.navigation;
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

export function Conversation({ navigation }) {
  
  const latchColorRef = useRef('#282827');
  const callbackRef = useRef(null);

  const latch = useLatch();
  const onLatch = () => {
    labelNav.toggleDrawer();
  };

  useEffect(() => {
    const unfocus = navigation.addListener('focus', () => {
      labelNav.closeDrawer();
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
      latchColorRef.current = '#0072CC';
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
      <ConversationDrawer.Navigator navigationOptions={{title: 'ro'}} drawerPosition={'right'} drawerContent={(props) => <ConversationDrawerContent {...props} {...{onLabel: selected}} />}>
        <ConversationDrawer.Screen name="Conversation">{(props) => { 
          return (
            <View style={{ flex: 1 }}>
              <ConversationList setListener={setCallback} clearListener={clearCallback} /> 
            </View>
          )
        }}</ConversationDrawer.Screen>
      </ConversationDrawer.Navigator>
    </View>
  )
}

function ConversationList({ setListener, clearListener }) {

  const [start, setStart] = React.useState(false);
  const [selector, setSelector] = React.useState(false);

  const labelIdRef = useRef(null);  
  
  let diatum: Diatum = useDiatum();

  const onConversation = () => {
    setSelector(true);
  }

  const onSelect = async (amigoId: string) => {
    setSelector(false);
    if(amigoId != null) {
      await diatum.addConversation(amigoId); 
    } 
  }

  const onClose = () => {
    setSelector(false);
  }

  const setLabel = (id: string) => {
    labelIdRef.current = id;
  };

  useEffect(() => {
    setListener(setLabel);
    return () => {
      clearListener();
    }
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }} forceInset={{ bottom: 'never' }}>
      <TouchableOpacity style={{ position: 'absolute', bottom: 0, right: 0, margin: 16 }} onPress={onConversation}>
        <View opacity={0.8} style={{backgroundColor: '#0077CC', paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8, borderRadius: 16 }}>
          <Text style={{ fontSize: 18, color: '#ffffff' }}><Icon name="plus" style={{ fontSize: 14 }}/>&nbsp;Conversation</Text>
        </View>
      </TouchableOpacity>
      <SelectContact active={selector} selected={onSelect} closed={onClose} />
    </SafeAreaView>
  );
}

function SelectContact({ active, selected, closed }) {
  const [contacts, setContacts] = React.useState([]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [color, setColor] = React.useState('#444444');
  const [amigo, setAmigo] = React.useState(null);

  let id = React.useRef(null);

  let diatum = useDiatum();
  useEffect(async () => {
    setContacts(await diatum.getContacts(null, "connected"));
  }, []);

  useEffect(() => {
    if(active == true) {
      setModalVisible(true);
    }
    else {
      setModalVisible(false);
    }
    setAmigo(null);
    id.current = null;
    setColor('#444444');
  }, [active]);

  const onClose = () => {
    closed();
  }

  const onSelect = () => {
    selected(id.current); 
  }

  const onSelected = (amigoId) => {
    setColor('#0077CC');
    setAmigo(amigoId);
    id.current = amigoId;
  }

  return (
    <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={onClose}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <View style={{ backgroundColor: '#ffffff', width: '80%', borderRadius: 8, maxHeight: '60%' }}>
          <Text style={{ fontSize: 18, color: '#444444', paddingLeft: 16, paddingTop: 16 }}>Start a Conversation With:</Text>
          <FlatList style={{ alignSelf: 'center', marginTop: 8, marginBottom: 8, padding: 8, borderRadius: 4, width: '90%', backgroundColor: '#eeeeee' }} data={contacts} keyExtractor={item => item.amigoId} renderItem={({item}) => <ConnectedContact item={item} amigo={amigo} selected={onSelected} />} />
          <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', marginBottom: 8 }}>
            <TouchableOpacity style={{ margin: 8, borderRadius: 4, paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4, backgroundColor: '#888888' }} onPress={onClose}>
              <Text style={{ color: '#ffffff', fontSize: 18 }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ margin: 8, borderRadius: 4, paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4, backgroundColor: color }} onPress={onSelect}>
              <Text style={{ color: '#ffffff', fontSize: 18 }}>Select</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ConnectedContact({item, amigo, selected}) {

  const [color, setColor] = React.useState('#eeeeee');

  useEffect(() => {
    if(item.amigoId == amigo) {
      setColor('#aaddff');
    }
    else {
      setColor('#eeeeee');
    }
  }, [item, amigo]);

  const onSelect = () => {
    selected(item.amigoId);
  }

  return (
    <TouchableOpacity activeOpacity={1} style={{ backgroundColor: color, width: '100%', padding: 8, flexDirection: 'row', alignItems: 'center', borderRadius: 8, borderBottomWidth: 1, borderColor: '#dddddd' }} onPress={onSelect}>
      <Image style={{ width: 32, height: 32, marginLeft: 8, borderRadius: 4 }} source={{ uri: item.imageUrl, cache: 'force-cache' }} />
      <View style={{ marginLeft: 16 }}>
        <Text style={{ fontSize: 18, color: '#444444' }}>{ item.name }</Text>
        <Text style={{ fontSize: 12, color: '#444444' }}>{ item.handle }</Text>
      </View>
    </TouchableOpacity>
  );
}

