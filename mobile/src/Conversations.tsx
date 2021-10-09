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
import { DiatumSession, LabelEntry, Conversation } from '../diatum/DiatumTypes';
import { DiatumProvider, useDiatum } from "../diatum/DiatumContext";
import { IndiViewCom } from "./IndiViewCom";
import { AppSupport, AppSupportProvider, useApp } from './AppSupport';

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

export function Conversations({ navigation }) {
  
  const [label, setLabel] = React.useState(null);

  const latchColorRef = useRef('#282827');

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
    setLabel(id);
  };

  return (
    <View style={{ flex: 1 }}>
      <ConversationDrawer.Navigator navigationOptions={{title: 'ro'}} drawerPosition={'right'} drawerContent={(props) => <ConversationDrawerContent {...props} {...{onLabel: selected}} />}>
        <ConversationDrawer.Screen name="Conversation">{(props) => { 
          return (
            <View style={{ flex: 1 }}>
              <ConversationList label={label} /> 
            </View>
          )
        }}</ConversationDrawer.Screen>
      </ConversationDrawer.Navigator>
    </View>
  )
}

function ConversationList({ label }) {

  const [start, setStart] = React.useState(false);
  const [selector, setSelector] = React.useState(false);
  const [conversations, setConversations] = React.useState([]);
  const [busy, setBusy] = React.useState(false);

  const labelRef = useRef(label);  
  
  let diatum: Diatum = useDiatum();

  const update = async () => {
    setConversations(await diatum.getConversations(labelRef.current));
  }

  useEffect(() => {
    labelRef.current = label;
    update();
  }, [label]);

  useEffect(() => {
    diatum.setListener(DiatumEvent.Conversation, update);
    return () => {
      diatum.clearListener(DiatumEvent.Conversation, update);
    }
  }, []);

  const onConversation = () => {
    setSelector(true);
  }

  const Active = () => {
    if(!busy) {
      return (<></>);
    }
    return (
      <View style={{ position: 'absolute', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ borderRadius: 8, padding: 16, backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator animating={true} size="large" color="#ffffff" />
        </View>
      </View>
    );
  }

  let app = useApp();
  let nav = useNavigation();
  const onSelect = async (amigo) => {
    setSelector(false);
    if(!busy) {
      if(amigo != null) {
        setBusy(true);
        try {
          let dialogue = await diatum.addConversation(amigo.amigoId);
          if(dialogue == null) {
            Alert.alert("failed to link conversation");
            setBusy(false);
            return;
          }
          try {
            await IndiViewCom.setEvent(app.getToken(), amigo.amigoId, 'dialogue');
          }
          catch(err) {
            console.log(err);
          }
          nav.navigate("Topics", { dialogueId: dialogue, amigoId: amigo.amigoId, hosting: true, active: true, handle: amigo.handle, imageUrl: amigo.imageUrl });
          setBusy(false);
        }
        catch(err) {
          console.log(err);
          setBusy(false);
          Alert.alert("failed to create conversation");
        }
      }
    }
  }

  const onClose = () => {
    setSelector(false);
  }

  return (
    <SafeAreaView style={{ flex: 1 }} forceInset={{ bottom: 'never' }}>
      <FlatList style={{ paddingLeft: 16, paddingRight: 16, padding: 8 }} data={conversations} keyExtractor={item => item.dialogueId} renderItem={({item}) => <ConversationEntry entry={item} />} />
      <TouchableOpacity style={{ position: 'absolute', bottom: 0, right: 0, margin: 16 }} onPress={onConversation}>
        <View opacity={0.8} style={{backgroundColor: '#0077CC', paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8, borderRadius: 16 }}>
          <Text style={{ fontSize: 18, color: '#ffffff' }}><Icon name="plus" style={{ fontSize: 14 }}/>&nbsp;Conversation</Text>
        </View>
      </TouchableOpacity>
      <SelectContact active={selector} selected={onSelect} closed={onClose} />
      <Active />
    </SafeAreaView>
  );
}

function ConversationEntry({ entry }) {
  const [source, setSource] = React.useState(require("../assets/avatar.png"));
  const [message, setMessage] = React.useState(null);
  const [blurbRevision, setBlurbRevision] = React.useState(null);
  const [appRevision, setAppRevision] = React.useState(null);
  const [options, setOptions] = React.useState(['Close Menu' ]);
  const [actions, setActions] = React.useState([]);

  useEffect(() => {
    if(entry.imageUrl != null) {
      setSource({ uri: entry.imageUrl, cache: 'force-cache' });
    }
    if(entry.blurbData != null) {
      setMessage(entry.blurbData.message);
      setBlurbRevision(entry.blurbData.revision);
    }
    if(entry.appData != null) {
      setAppRevision(entry.appData.revision);
    }
    let opt = [];
    let act = [];
    opt.push('Refresh Converstation');
    act.push(() => { onSync() });
    if(entry.active) {
      opt.push('End Converstation');
      act.push(() => { onClose() });
    }
    opt.push('Delete Converstation');
    act.push(() => { onDelete() });
    opt.push('Close Menu');
    setOptions(opt);
    setActions(act);
  }, [entry]);

  let nav = useNavigation();
  const onConversation = () => {
    nav.navigate("Topics", entry);
  }

  const Offsync = () => {
    if(entry.offsync) {
      return (<Icon name='flag' style={{ paddingRight: 8, color: 'orange' }}/>);
    }
    return (<></>);
  }

  const Connected = () => {
    if(!entry.linked) {
      return (<Icon name='flag' style={{ paddingRight: 8, color: 'red' }}/>);
    }
    return (<></>);
  }

  const Closed = () => {
    if(!entry.active) {
      return (<Icon name='ban' style={{ paddingRight: 8, color: 'orange' }} />);
    }
    return (<></>);
  }

  const Location = () => {
    if(entry.hosting) {
      return (<Icon name='home' style={{ paddingRight: 8, color: '#888888' }} />);
    }
    else {
      return (<Icon name='user' style={{ paddingRight: 8, color: '#888888' }} />);
    }
  }

  const Read = () => {
    if((blurbRevision != null && appRevision == null) || appRevision < blurbRevision) {
      return (<Icon name='star' style={{ paddingRight: 8, color: '#0077cc' }} />);
    }
    return (<></>);
  }

  const dots = (<Icon name='ellipsis-h' style={{ fontSize: 20, paddingLeft: 16, paddingTop: 1, paddingBottom: 1, color: '#0077CC' }}/>);

  let diatum = useDiatum();

  const onDelete = () => {
    const title = 'Are you sure you want to delete the converstaion?';
    const message = '';
    const buttons = [
        { text: 'Yes, Delete', onPress: async () => {
          try {
            await diatum.removeConversation(entry.amigoId, entry.dialogueId, entry.hosting);
          }
          catch(err) {
            console.log(err);
            Alert.alert("failed to delete converstation");
          }
        }},
        { text: 'Cancel', type: 'cancel' }
    ];
    Alert.alert(title, message, buttons);
  }

  const onClose = () => {
    const title = 'Are you sure you want to end the converstaion?';
    const message = '';
    const buttons = [
        { text: 'Yes, End', onPress: async () => {
          try {
            await diatum.closeConversation(entry.amigoId, entry.dialogueId, entry.hosting);
          }
          catch(err) {
            console.log(err);
            Alert.alert("failed to end converstation");
          }
        }},
        { text: 'Cancel', type: 'cancel' }
    ];
    Alert.alert(title, message, buttons);
  }
  const onSync = async () => {
    try {
      await diatum.syncConversation(entry.amigoId, entry.dialogueId, entry.hosting);
    }
    catch(err) {
      Alert.alert("failed to sync converstation");
    }
  }

  return (
    <TouchableOpacity activeOpacity={1} style={{ width: '100%', padding: 8, flexDirection: 'row', borderRadius: 8, borderBottomWidth: 1, borderColor: '#dddddd' }} onPress={onConversation}>
      <Image style={{ width: 48, height: 48, marginLeft: 8, borderRadius: 4 }} source={source} />
      <View style={{ marginLeft: 16, height: '100%' }}>
        <Text style={{ fontSize: 16, color: '#444444' }}>{ entry.name }</Text>
        <Text style={{ fontSize: 12, color: '#444444' }}>{ entry.handle }</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Read />
          <Location />
          <Closed />
          <Offsync />
          <Connected />
          <Text style={{ fontSize: 12, color: '#444444' }}>{ getTime(entry.modified) }</Text>
        </View>
      </View>
      <View style={{ marginLeft: 32, alignSelf: 'center', width: 1, flexGrow: 1, height: '100%' }}>
          <View style={{ flexGrow: 1, alignItems: 'flex-end' }}>
            <OptionsMenu customButton={dots} options={options} actions={actions} />
          </View>
          <View style={{ flexGrow: 1, justifyContent: 'flex-end' }}>
            <Text style={{ textAlign: 'right', color: '#444444', fontSize: 12 }} numberOfLines={2} >{ message }</Text>
          </View>
      </View>
    </TouchableOpacity>
  );
}

function SelectContact({ active, selected, closed }) {
  const [contacts, setContacts] = React.useState([]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [color, setColor] = React.useState('#444444');
  const [amigo, setAmigo] = React.useState(null);

  let item = React.useRef(null);

  const update = async () => {
    setContacts(await diatum.getContacts(null, "connected"));
  }

  let diatum = useDiatum();
  useEffect(async () => {
    diatum.setListener(DiatumEvent.Contact, update);
    diatum.setListener(DiatumEvent.Amigos, update);
    diatum.setListener(DiatumEvent.Share, update);
    return () => {
      diatum.clearListener(DiatumEvent.Contact, update);
      diatum.clearListener(DiatumEvent.Amigos, update);
      diatum.clearListener(DiatumEvent.Share, update);
    }
  }, []);

  useEffect(() => {
    if(active == true) {
      setModalVisible(true);
    }
    else {
      setModalVisible(false);
    }
    setAmigo(null);
    item.current = null;
    setColor('#444444');
  }, [active]);

  const onClose = () => {
    closed();
  }

  const onSelect = () => {
    selected(item.current); 
  }

  const onSelected = (contact) => {
    setColor('#0077CC');
    setAmigo(contact.amigoId);
    item.current = contact;
  }

  const ContactList = () => {
    if(contacts.length == 0) {
      return (
        <View style={{ alignSelf: 'center', marginTop: 8, marginBottom: 8, padding: 8, borderRadius: 4, width: '90%', backgroundColor: '#eeeeee' }}>
          <Text style={{ textAlign: 'center', fontSize: 16, color: '#444444' }}>You have no connected contacts</Text>
        </View>
      );
    }
    else {
      return (
        <FlatList style={{ alignSelf: 'center', marginTop: 8, marginBottom: 8, padding: 8, borderRadius: 4, width: '90%', backgroundColor: '#eeeeee' }} data={contacts} keyExtractor={item => item.amigoId} renderItem={({item}) => <ConnectedContact item={item} amigo={amigo} selected={onSelected} />} />
      );
    }
  }

  return (
    <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={onClose}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <View style={{ backgroundColor: '#ffffff', width: '80%', borderRadius: 8, maxHeight: '70%' }}>
          <Text style={{ fontSize: 18, color: '#444444', paddingLeft: 16, paddingTop: 16 }}>Start a Conversation With:</Text>
          <ContactList />
          <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', marginBottom: 8 }}>
            <TouchableOpacity style={{ margin: 8, borderRadius: 4, paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8, backgroundColor: '#888888' }} onPress={onClose}>
              <Text style={{ color: '#ffffff', fontSize: 18 }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ margin: 8, borderRadius: 4, paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8, backgroundColor: color }} onPress={onSelect}>
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
    selected(item);
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

function getTime(epoch: number): string {
  let d: Date = new Date();
  let offset = d.getTime() / 1000 - epoch;
  if(offset < 3600) {
    return Math.ceil(offset/60) + " min";
  }
  if(offset < 86400) {
    return Math.ceil(offset/3600) + " hr";
  }
  if(offset < 2592000) {
    return Math.ceil(offset/86400) + " d";
  }
  if(offset < 31536000) {
    return Math.ceil(offset/2592000) + " mth";
  }
  return Math.ceil(offset/31449600) + " y";
}

