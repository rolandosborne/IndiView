import 'react-native-gesture-handler';
import React, { useEffect, forwardRef, useRef, useImperativeHandle } from 'react';
import { SafeAreaView, Modal, Alert, Animated, Dimensions, Platform, Clipboard, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, TextInput, Image, FlatList, Button, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View, ImageBackground, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import OptionsMenu from "react-native-option-menu";
import { useNavigation } from '@react-navigation/native';

import { Latch, useLatch } from './LatchContext';
import { Diatum, DiatumEvent } from '../diatum/Diatum';
import { AttachCode, getAttachCode } from '../diatum/DiatumUtil';
import { DiatumSession, LabelEntry, Attribute } from '../diatum/DiatumTypes';
import { DiatumProvider, useDiatum } from "../diatum/DiatumContext";
import { IndiViewCom } from "./IndiViewCom";
import { AttributeUtil } from './AttributeUtil';
import { AppSupport, useApp } from './AppSupport';

const ProfileDrawer = createDrawerNavigator();
let contactNav = null;

export class EntryView {
  notes: string;
  status: string;
  blocked: string;
  errorFlag: boolean;
}

export class ProfileView {
  amigoId: string;
  name: string;
  handle: string;
  imageUrl: string;
  location: string;
  description: string;
  showFooter: boolean;
  blocked: boolean;
  saved: ProfileSavedView;
}

function ProfileDrawerContent(props) {

  contactNav = props.navigation;
  const [amigoId, setAmigoId] = React.useState(props.amigoId);
  const [amigoLabels, setAmigoLabels] = React.useState([]);
  const [labels, setLabels] = React.useState(props.labels);

  let diatum: Diatum = useDiatum();

  const updateAssigned = () => {
    diatum.getContactLabels(amigoId).then(l => {
      setAmigoLabels(l);
      props.callback(l);
    }).catch(err => {
      console.log(err);
    });
  };

  const updateList = () => {
    diatum.getLabels().then(l => {
      setLabels(l);
    }).catch(err => {
      console.log(err);
    });
  };

  useEffect(() => {
    diatum.setListener(DiatumEvent.Labels, updateList);
    diatum.setListener(DiatumEvent.Amigos, updateAssigned);
    return () => {
      diatum.clearListener(DiatumEvent.Labels, updateList);
      diatum.clearListener(DiatumEvent.Amigos, updateAssigned);
    }
  }, []);

  const setLabel = async (id: string) => {
    try {
      await diatum.setContactLabel(amigoId, id);
    }
    catch(err) {
      console.log(err);
      Alert.alert("failed to set label");
    }
  }

  const clearLabel = async (id: string) => {
    try {
      await diatum.clearContactLabel(amigoId, id);
    }
    catch(err) {
      console.log(err);
      Alert.alert("failed to clear label");
    }
  }

  const hasLabel = (id: string) => {
    for(let i = 0; i < amigoLabels.length; i++) {
      if(amigoLabels[i] == id) {
        return true;
      }
    }
    return false;
  }

  return (
      <View>
        <View style={{ width: '100%', backgroundColor: '#282827', alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
          <Icon name="tag" style={{ marginLeft: 16, fontSize: 18, color: '#ffffff' }} />
          <DrawerItem style={{ flex: 1 }} labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#ffffff', backgroundColor: '#282827', textAlign: 'left' }} label={'Assigned Labels'} />
        </View>
        <FlatList data={labels} keyExtractor={item => item.labelId} renderItem={({item,index}) => {
          if(hasLabel(item.labelId)) {
            return <DrawerItem labelStyle={{ fontSize: 18, color: '#0072CC' }} label={item.name} onPress={() => {clearLabel(item.labelId);} } />
          }
          else {
            return <DrawerItem labelStyle={{ fontSize: 18, color: '#282827' }} label={item.name} onPress={() => {setLabel(item.labelId);} } />
          }
        }} />
      </View>
  );
}

export function ContactProfile({ route, navigation }) {
  const [contact, setContact] = React.useState(route.params);
  const [amigoLabels, setAmigoLabels] = React.useState([]);
  const [latchColor, setLatchColor] = React.useState('#282827');
  const [names, setNames] = React.useState(null);

  const labels = useRef([]);
  const ids = useRef([]);

  let latch: Latch = useLatch();
  const onLatch = () => {
    contactNav.toggleDrawer();
  };

  let diatum: Diatum = useDiatum();
  const updateList = () => {
    diatum.getLabels().then(l => {
      labels.current = l;
      if(contact.showFooter) {
        updateNames();
      }
    }).catch(err => {
      console.log(err);
    });
  };

  useEffect(() => {
    diatum.setListener(DiatumEvent.Labels, updateList);
    return () => {
      diatum.clearListener(DiatumEvent.Labels, updateList);
    }
  }, []);
  
  useEffect(() => {
    const unfocus = navigation.addListener('focus', () => {
      contactNav.closeDrawer();
      latch.setToggleListener(onLatch, latchColor);
    });
    return (() => {
      latch.clearToggleListener(onLatch);
      unfocus();
    }) 
  }, []);

  const updateNames = () => {
    if(ids.current.length == 0 || labels.current.length == 0) {
      setNames("None");
    }
    else {
      let name: string = "";
      for(let j = 0; j < labels.current.length; j++) {
        for(let i = 0; i < ids.current.length; i++) {
          let id = ids.current[i];
          let label = labels.current[j];
          if(id == label.labelId) {
            if(name != "") {
              name += ", ";
            }
            name += label.name;
          }
        }
      }
      setNames(name);
    }
  };
 
  const onLabel = (l: string[]) => {
    ids.current = l;
    if(l == null || l.length == 0) {
      setLatchColor('#282827');
      latch.setColor('#282827');
    }
    else {
      setLatchColor('#0077CC');
      latch.setColor('#0077CC');
    }
    if(contact.showFooter) {
      updateNames();
    }
  };

  return (
    <View style={{ flex: 1 }} >
      <ProfileDrawer.Navigator navigationOptions={{title: 'ro'}} drawerPosition={'right'} drawerContent={(props) => <ProfileDrawerContent {...props} {...{amigoId: contact.amigoId, callback: onLabel}} />}>
        <ProfileDrawer.Screen name="Contacts">{(props) => {
          return (
            <View style={{ flex: 1 }}>
              <ContactProfilePage contact={contact} navigation={navigation} names={names} />
            </View>
          )
        }}</ProfileDrawer.Screen>
      </ProfileDrawer.Navigator>
    </View>
  )
}

export function ContactProfilePage({ contact, navigation, names }) {

  const [prompt, setPrompt] = React.useState(false);
  const [entry, setEntry] = React.useState(null);
  const [attributes, setAttributes] = React.useState([]);
  const [profileColor, setProfileColor] = React.useState('#aaaaaa');

  let app = useApp();
  let diatum = useDiatum();
  const disconnectContact = async () => {
    const title = 'Are you sure you want to disconnect?';
    const message = '';
    const buttons = [
        { text: 'Yes, Disconnect', onPress: async () => {
          try {
            await diatum.closeContactConnection(contact.amigoId);
          }
          catch(err) {
            console.log(err);
            Alert.alert("failed to disconnect contact");
          }
        }},
        { text: 'Cancel', type: 'cancel' }
    ];
    Alert.alert(title, message, buttons);
  };
  const saveAcceptContact = async () => {
    await saveContact();
    await acceptContact();
  }
  const saveContact = async () => {
    try {
      await diatum.addContact(contact.amigoId, contact.registry);
    }
    catch(err) {
      console.log(err);
      Alert.alert("failed to save contact");
    }
  }
  const refreshContact = async () => {
    try {
      await diatum.syncContact(contact.amigoId);
    }
    catch(err) {
      console.log(err);
      Alert.alert("failed to refresh contact");
    }
  };
  const deleteContact = async () => {
    try {
      await diatum.removeContact(contact.amigoId);
    }
    catch(err) {
      console.log(err);
      Alert.alert("failed to delete contact");
    }
  };
  const acceptContact = async () => {
    try {
      await diatum.openContactConnection(contact.amigoId);
    }
    catch(err) {
      console.log(err);
      Alert.alert("failed to accept connection");
    }
  }
  const requestContact = async () => {
    try {
      await diatum.openContactConnection(contact.amigoId);
    }
    catch(err) {
      console.log(err);
      Alert.alert("failed to request connection");
    }
  }
  const cancelContact = async () => {
    try {
      await diatum.closeContactConnection(contact.amigoId);
    }
    catch(err) {
      console.log(err);
      Alert.alert("failed to cancel request");
    }
  }
  const reportContact = () => {
    const title = 'Do you want to flag this account for review?';
    const message = '';
    const buttons = [
        { text: 'Yes, Flag', onPress: async () => {
          try {
            await IndiViewCom.setAlert(app.getToken(), contact.amigoId);
          }
          catch(err) {
            console.log(err);
            Alert.alert("failed to flag account");
          }
        }},
        { text: 'Cancel', type: 'cancel' }
    ];
    Alert.alert(title, message, buttons);
  }
  const blockContact = async () => {
    const title = 'Are you sure you want to block this contact?';
    const message = '';
    const buttons = [
        { text: 'Yes, Block', onPress: async () => {
          try {
            await diatum.setBlockedContact(contact.amigoId, true);
          }
          catch(err) {
            console.log(err);
            Alert.alert("failed to block contact");
          }
        }},
        { text: 'Cancel', type: 'cancel' }
    ];
    Alert.alert(title, message, buttons);
  }
  const unblockContact = async () => {
    try {
      await diatum.setBlockedContact(contact.amigoId, false);
    }
    catch(err) {
      console.log(err);
      Alert.alert("failed to block contact");
    }
  }
  const addNotes = () => {
    setPrompt(true);
  }
  const editNotes = () => {
    setPrompt(true);
  }
  const deleteNotes = () => {
    const title = 'Do you want to delete the notes?';
    const message = '';
    const buttons = [
        { text: 'Cancel', type: 'cancel' },
        { text: 'Yes, Delete', onPress: async () => {
          try {
            await diatum.clearContactNotes(contact.amigoId);
          }
          catch(err) {
            console.log(err);
            Alert.alert("failed to delete notes");
          }
        }
      }
    ];
    Alert.alert(title, message, buttons);
  };

  const setHeader = (e: EntryView) => {
    let options = [];
    let actions = [];
    if(e != null) {
      if(e.notes == null) {
        options.push("Add Notes");
        actions.push(addNotes);
      }
    }
    if(e == null) {
      if(contact.requested) {
        options.push("Accept Connection");
        actions.push(saveAcceptContact);
      }
      options.push("Save Contact");
      actions.push(saveContact);
    }
    else if(e.status == 'connected') {
      options.push("Disconnect");
      actions.push(disconnectContact);
      options.push("Delete Contact");
      actions.push(deleteContact);
      options.push("Refresh Contact");
      actions.push(refreshContact);
    }
    else if(e.status == 'received') {
      options.push("Accept Connection");
      actions.push(acceptContact);
      options.push("Delete Contact");
      actions.push(deleteContact);
    }
    else if(e.status == 'requested') {
      options.push("Cancel Request");
      actions.push(cancelContact);
      options.push("Delete Contact");
      actions.push(deleteContact);
    }
    else {
      options.push("Request Connection");
      actions.push(requestContact);
      options.push("Delete Contact");
      actions.push(deleteContact);
    }
    if(e != null) {
      if(e.blocked) {
        options.push("Unblock Contact");
        actions.push(unblockContact);
      }
      else {
        options.push("Block Contact");
        actions.push(blockContact);
      }
    }
    options.push("Report Contact");
    actions.push(reportContact);
    options.push("Close Menu");
    const dots = (<Icon name="ellipsis-v" style={{ color: '#444444', fontSize: 24, paddingRight: 16, paddingLeft: 24, width: 48 }} />);

    navigation.setOptions({
      title: contact.handle,
      headerRight: () => (<OptionsMenu customButton={dots} options={options} actions={actions} />)
    });
  }

  // setup screen header
  React.useLayoutEffect(() => {
    setHeader(entry);
  }, [navigation]);

  // retrieve attributes
  const updateContact = async (amigoId: string) => {
    try {
      let a: Attribute[] = await diatum.getContactAttributes(contact.amigoId);
      setAttributes(a);
    }
    catch(err) {
      console.log(err);
      setAttributes([]);
    }
  };
  const updateAmigo = async () => {
    try {
      let c: ContactEntry = await diatum.getContact(contact.amigoId);
      if(c != null) {
        setEntry({ status: c.status, notes: c.notes, errorFlag: c.errorFlag, blocked: c.blocked });
        setHeader({ status: c.status, notes: c.notes, errorFlag: c.errorFlag, blocked: c.blocked });
      }
      else {
        setEntry(null);
        setHeader(null);
      }
    }
    catch(err) {
      console.log(err);
    }
  };

  // update border color on error
  useEffect(() => {
    if(entry != null && entry.errorFlag && entry.status == 'connected') {
      setProfileColor('#dd8888');
    }
    else {
      setProfileColor('#aaaaaa');
    }
  }); 

  // register event to update attributes
  useEffect(() => {
    diatum.setListener(DiatumEvent.Contact, updateContact);
    diatum.setListener(DiatumEvent.Share, updateAmigo);
    diatum.setListener(DiatumEvent.Amigos, updateAmigo);
    return async () => {
      await diatum.clearListener(DiatumEvent.Contact, updateContact);
      await diatum.clearListener(DiatumEvent.Share, updateAmigo);
      await diatum.clearListener(DiatumEvent.Amigos, updateAmigo);
    }
  }, []);

  let imgSrc = {};
  if(contact.imageUrl == null) {
    imgSrc = require('../assets/avatar.png');
  }
  else {
    imgSrc = { uri: contact.imageUrl, cache: 'force-cache' };
  }

  const ContactName = () => {
    if(contact.name != null) {
      return (<Text style={{ fontSize: 20, fontWeight: 'bold', color: '#222222' }}>{ contact.name }</Text>);
    }
    else {
      return (<Text style={{ fontSize: 20, fontWeight: 'bold', color: '#aaaaaa' }}>No Name</Text>);
    }
  }

  const ContactLocation = () => {
    if(contact.name != null) {
      return (<Text style={{ marginTop: 8, color: '#222222' }}>{ contact.location }</Text>);
    }
    else {
      return (<></>);
    }
  }

  const ContactStatus = () => {
    if(entry == null) {
      return (
        <Text style={{ marginTop: 16, color: "#ffffff", fontWeight: 'bold' }}>Contact Profile</Text>
      ); 
    }
    else if(entry.status == 'connected') {
      return (
        <Text style={{ marginTop: 16, color: "#ffffff", fontWeight: 'bold' }}>Connected</Text>
      ); 
    }
    else if(entry.status == 'received') {
      return (
        <Text style={{ marginTop: 16, color: "#ffffff", fontWeight: 'bold' }}>Request Received</Text>
      ); 
    }
    else if(entry.status == 'requested') {
      return (
        <Text style={{ marginTop: 16, color: "#ffffff", fontWeight: 'bold' }}>Request Sent</Text>
      ); 
    }
    else {
      return (
        <Text style={{ marginTop: 16, color: "#ffffff", fontWeight: 'bold' }}>Saved</Text>
      ); 
    }
  }

  const getNotes = () => {
    if(entry == null || entry.notes == null) {
      return "";
    }
    return entry.notes;
  }

  const ContactNotes = () => {
    if(entry != null && entry.notes != null) {
      return (
        <View style={{ marginTop: 16, width: '100%' }}>
          <View style={{ width: '100%', alignItems: 'center' }}><Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Notes</Text></View>
          <TouchableOpacity onLongPress={deleteNotes} onPress={editNotes} style={{ marginLeft: 32, marginRight: 32, marginTop: 0, paddingTop: 8, paddingBottom: 8, paddingLeft: 16, paddingRight: 16, flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#0077CC' }}>
            <Text style={{ color: '#222222' }}>{entry.notes}</Text>
          </TouchableOpacity>
        </View>
      ); 
    }
    else {
      return (<></>);
    }
  }

  const onAssign = () => {
    contactNav.toggleDrawer();
  };

  const ContactFooter = () => {
    if(contact.showFooter && entry != null && names != null) {
      return (
        <SafeAreaView style={{ marginTop: 16, width: '100%', flex: 1 }} forceInset={{ top: 'never' }}>
          <View style={{ width: '100%', alignItems: 'center' }}>
            <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Labels</Text>
          </View>
          <View style={{ marginTop: 4, paddingLeft: 16, paddingRight: 16 }}>
            <TouchableOpacity style={{ width: '100%', borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }} onPress={onAssign}>
              <Text style={{ margin: 8, color: '#0077CC' }}>{ names }</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )
    }
    return (<></>);
  }

  const ContactDescription = () => {
    if(contact.description == null) {
      return (<></>);
    }
    return (
      <Text style={{ marginTop: 16, marginLeft: 8, marginRight: 8, textAlign: 'center' }}>{ contact.description }</Text>
    );
  };

  const onSaveNotes = async (notes: string) => {
    setPrompt(false);
    try {
      await diatum.setContactNotes(contact.amigoId, notes);
    }
    catch(err) {
      console.log(err);
      Alert.alert("failed to save notes");
    }
  } 

  const onCloseNotes = () => {
    setPrompt(false);
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#aaaaaa', alignItems: 'center' }}>
      <ContactStatus style={{ marginTop: 16 }} />
      <View style={{ flexDirection: 'row', padding: 12, marginLeft: 16, marginRight: 16, borderRadius: 8, backgroundColor: '#ffffff', borderWidth: 2, borderColor: profileColor }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row' }}>
            <Image style={{ flex: 2, maxWidth: 256, borderRadius: 4, aspectRatio: 1 }} source={imgSrc}/>
            <View style={{ flex: 3, alignItems: 'center', justifyContent: 'center' }}>
              <ContactName />
              <ContactLocation />
              <ContactDescription />
            </View>
          </View>
        </View>
      </View>

      <ContactNotes />

      <View style={{ flex: 1, marginBottom: 16, marginTop: 16, width: '100%' }}>
        <View style={{ width: '100%', alignItems: 'center' }}><Text style={{ color: '#ffffff', fontWeight: 'bold', height: 18 }}>{ (attributes.length>0&&entry!=null&&entry.status=='connected')?'Contact Info':'' }</Text></View>
        <View style={{ marginBottom: 16 }}>
          <FlatList style={{ marginLeft: 32, marginRight: 32, marginTop: 0, backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#aaaaaa' }} data={attributes} keyExtractor={item => item.attributeId} renderItem={({item}) => <AttributeEntry item={item} /> } />
        </View>
      </View>

      <ContactFooter />

      <PromptNotes prompt={prompt} notes={getNotes()} saved={onSaveNotes} closed={onCloseNotes} />
    </View>
  )
}

function PromptNotes({ prompt, notes, saved, closed }) {
  const [text, setText] = React.useState(null); 
  const [modalVisible, setModalVisible] = React.useState(false); 
  
  useEffect(() => {
    if(prompt == true) {
      setModalVisible(prompt);
    }
    setText(notes);
  }, [notes, prompt]);

  const onSave = () => {
    setModalVisible(false);
    saved(text);
  };

  const onCancel = () => {
    setModalVisible(false);
    closed();
  };

  return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={onCancel}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: 'rgba(52, 52, 52, 0.8)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ padding: 16, width: '80%', borderRadius: 4, backgroundColor: '#ffffff' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#444444' }}>Contact Notes</Text>
            <TextInput multiline={true} style={{ padding: 8, marginTop: 8, marginBottom: 8, borderRadius: 8, width: '100%', minHeight: 96, backgroundColor: '#eeeeee', textAlignVertical: 'top' }} value={text} onChangeText={setText} />
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }}>
                <TouchableOpacity style={{ alignItems: 'center' }} onPress={onSave}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0077CC' }}>Save</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1 }}>
                <TouchableOpacity style={{ alignItems: 'center' }} onPress={onCancel}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#888888' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
  );
}

function AttributeEntry({item}) {
  const [data, setData] = React.useState({});

  useEffect(() => {
    if(item.data != null) {
      setData(JSON.parse(item.data));
    }
    else {
      setData({});
    }
  }, []);

  const onPhone = (data: string) => {
    if(data != null) {
      Linking.openURL("tel:" + data.replace(/[^0-9]/g,''));
    }
  }
  const onText = (data: string) => {
    if(data != null) {
      Linking.openURL("sms:" + data.replace(/[^0-9]/g,''));
    }
  }
  const onWebsite = (data: string) => {
    if(data != null) {
      Linking.openURL(data);
    }
  } 
  const onEmail = (data: string) => {
    if(data != null) {
      Linking.openURL("mailto:" + data);
    }
  }
  const onSocial = (data: string) => {
    if(data != null) {
      Clipboard.setString(data);
    }
  } 
  const onLocation = (loc) => {
    if(loc != null) {
      let location: string = "";
      if(loc.streetPo != null) {
        location += loc.streetPo + " ";
      }
      if(loc.cityTown != null) {
        location += loc.cityTown + " ";
      }
      if(loc.provinceState != null) {
        location += loc.provinceState + " ";
      }
      if(loc.postalCode != null) {
        location += loc.postalCode + " ";
      }
      if(loc.country != null) {
        location += loc.country + " ";
      }
      Linking.openURL("https://www.google.com/maps/search/?api=1&query=" + location.replace(/ /g, "+"));
    }
  }
  const CardCompanyName = () => {
    if(data.companyName != null) {
      return (<Text>{data.companyName}</Text>);
    }
    return (<></>);
  }
  const CardProfessionName = () => {
    if(data.professionName != null) {
      return (<Text>{data.professionName}</Text>);
    }
    return (<></>);
  }
  const CardTitle = () => {
    if(data.title != null) {
      return (<Text>{data.title}</Text>);
    }
    return (<></>);
  }
  const CardWebsite = () => {
    if(data.website != null) {
      return (
        <View style={{ flexDirection: 'row', paddingLeft: 4, paddingTop: 8 }}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="circle" style={{ color: '#888888', fontSize: 8, marginRight: 16 }} />
          </View>
          <Text style={{ flexGrow: 1 }}>{ data.website }</Text>
          <Icon name="external-link" style={{ color: '#0077CC', fontSize: 20 }} onPress={() => onWebsite(data.website)} />
        </View>
      );
    }
    return (<></>);
  }
  const CardAddress = () => {
    if(data.streetPo != null || data.cityTown != null || data.provinceStateCounty != null || data.postalCode != null || data.country != null) {
      return (
        <View style={{ flexDirection: 'row', paddingLeft: 4, paddingTop: 8 }}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="circle" style={{ color: '#888888', fontSize: 8, marginRight: 16 }} />
          </View>
          <View style={{ flexGrow: 1 }}>
            <Text>{ data.streetPo }</Text>
            <Text>{ data.cityTown }&nbsp;{ data.provinceStateCounty}&nbsp;&nbsp;{data.postalCode}</Text>
            <Text>{ data.country }</Text>
          </View>
          <View style={{ justifyContent: 'center' }}>
            <Icon name="map-marker" style={{ color: '#0077CC', fontSize: 20 }} onPress={() => onLocation(data)} />
          </View>
        </View>
      );
    }
    return (<></>);
  } 
  const CardEmail = () => {
    if(data.email != null) {
      return (
        <View style={{ flexDirection: 'row', paddingLeft: 4, paddingTop: 8 }}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="circle" style={{ color: '#888888', fontSize: 8, marginRight: 16 }} />
          </View>
          <Text style={{ flexGrow: 1 }}>{ data.email }</Text>
          <Icon name="envelope-o" style={{ color: '#0077CC', fontSize: 20 }} onPress={() => onEmail(data.email)} />
        </View>
      );
    }
    return (<></>);
  }
  const CardDirectPhoneSms = () => {
    if(data.directPhoneSms == true) {
      return (
        <Icon name="tty" style={{ color: '#0077CC', fontSize: 20, marginLeft: 32 }} onPress={() => onText(data.directPhone)} />
      );
    }
    return (<></>);
  }
  const CardDirectPhone = () => {
    if(data.directPhone != null) {
      return (
        <View style={{ flexDirection: 'row', paddingLeft: 4, paddingTop: 8 }}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="circle" style={{ color: '#888888', fontSize: 8, marginRight: 16 }} />
          </View>
          <View style={{ flexGrow: 1 }}>
            <Text>Direct Phone</Text>
            <Text style={{ color: '#444444' }}>{ data.directPhone }</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="phone" style={{ color: '#0077CC', fontSize: 20 }} onPress={() => onPhone(data.directPhone)} />
            <CardDirectPhoneSms />
          </View>
        </View>
      );
    }
    return (<></>);
  }
  const CardMainPhoneSms = () => {
    if(data.mainPhoneSms == true) {
      return (
        <Icon name="tty" style={{ color: '#0077CC', fontSize: 20, marginLeft: 32 }} onPress={() => onText(data.mainPhone)} />
      );
    }
    return (<></>);
  }
  const CardMainPhone = () => {
    if(data.mainPhone != null) {
      return (
        <View style={{ flexDirection: 'row', paddingLeft: 4, paddingTop: 8 }}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="circle" style={{ color: '#888888', fontSize: 8, marginRight: 16 }} />
          </View>
          <View style={{ flexGrow: 1 }}>
            <Text>Main Phone</Text>
            <Text style={{ color: '#444444' }}>{ data.mainPhone }</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="phone" style={{ color: '#0077CC', fontSize: 20 }} onPress={() => onPhone(data.mainPhone)} />
            <CardDirectPhoneSms />
          </View>
        </View>
      );
    }
    return (<></>);
  }
  const CardMobilePhoneSms = () => {
    if(data.mobilePhoneSms == true) {
      return (
        <Icon name="tty" style={{ color: '#0077CC', fontSize: 20, marginLeft: 32 }} onPress={() => onText(data.mobilePhone)} />
      );
    }
    return (<></>);
  }
  const CardMobilePhone = () => {
    if(data.mobilePhone != null) {
      return (
        <View style={{ flexDirection: 'row', paddingLeft: 4, paddingTop: 8 }}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="circle" style={{ color: '#888888', fontSize: 8, marginRight: 16 }} />
          </View>
          <View style={{ flexGrow: 1 }}>
            <Text>Mobile Phone</Text>
            <Text style={{ color: '#444444' }}>{ data.mobilePhone }</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="phone" style={{ color: '#0077CC', fontSize: 20 }} onPress={() => onPhone(data.mobilePhone)} />
            <CardDirectPhoneSms />
          </View>
        </View>
      );
    }
    return (<></>);
  }
  const HomePhoneSms = () => {
    if(data.phoneNumberSms == true) {
      return (
        <Icon name="tty" style={{ color: '#0077CC', fontSize: 20, marginLeft: 32 }} onPress={() => onText(data.phoneNumber)} />
      );
    }
    return (<></>);
  }
  const HomePhone = () => {
    if(data.phoneNumber != null) {
      return (
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flexGrow: 1 }}>
            <Text>Home Phone</Text>
            <Text style={{ color: '#444444' }}>{ data.phoneNumber }</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="phone" style={{ color: '#0077CC', fontSize: 20 }} onPress={() => onPhone(data.phoneNumber)} />
            <HomePhoneSms />
          </View>
        </View>
      );
    }
    return (<></>);
  }
  const HomeAddress = () => {
    if(data.homeAddress != null) {
      let a = data.homeAddress;
      if(a.streetPo != null || a.cityTown != null || a.provinceStateCounty != null || a.postalCode != null || a.country != null) {
        return (
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flexGrow: 1 }}>
              <Text>{ a.streetPo }</Text>
              <Text>{ a.cityTown }{ a.provinceStateCounty}&nbsp{a.postalCode}</Text>
              <Text>{ a.country }</Text>
            </View>
            <View style={{ justifyContent: 'center' }}>
              <Icon name="map-marker" style={{ color: '#0077CC', fontSize: 20 }} onPress={() => onLocation(a)} />
            </View>
          </View>
        );
      }
    }
    return (<></>);
  } 
  const PhoneSms = () => {
    if(data.phoneSms == true) {
      return (
        <Icon name="tty" style={{ color: '#0077CC', fontSize: 20, marginLeft: 32 }} onPress={() => onText(data.phone)} />
      );
    }
    return (<></>);
  }

  if(AttributeUtil.isHome(item)) {
    return (
      <View style={{ padding: 12 }}>
        <HomePhone />
        <HomeAddress />
      </View>
    );
  }
  else if(AttributeUtil.isSocial(item)) {
    return (
      <View style={{ flexDirection: 'row', padding: 12 }}>
        <View style={{ flexGrow: 1 }}>
          <Text>{data.category}</Text>
          <Text style={{ color: '#444444' }}>{data.link}</Text>
        </View>
        <View style={{ justifyContent: 'center' }}>
          <Icon name="copy" style={{ color: '#0077CC', fontSize: 20 }} onPress={() => onSocial(data.link)} />
        </View>
      </View>
    );
  }
  else if(AttributeUtil.isEmail(item)) {
    return (
      <View style={{ flexDirection: 'row', padding: 12 }}>
        <View style={{ flexGrow: 1 }}>
          <Text>{data.category} Email</Text>
          <Text style={{ color: '#444444' }}>{data.email}</Text>
        </View>
        <View style={{ justifyContent: 'center' }}>
          <Icon name="envelope-o" style={{ color: '#0077CC', fontSize: 20 }} onPress={() => onEmail(data.email)} />
        </View>
      </View>
    );
  }
  else if(AttributeUtil.isCard(item)) {
    return (
      <View style={{ padding: 12 }}>
        <CardCompanyName />
        <CardProfessionName />
        <CardTitle />
        <CardWebsite />
        <CardAddress />
        <CardEmail />
        <CardMainPhone />
        <CardDirectPhone />
        <CardMobilePhone />
      </View>
    );
  }
  else if(AttributeUtil.isPhone(item)) {
    return (
      <View style={{ flexDirection: 'row', padding: 12 }}>
        <View style={{ flexGrow: 1 }}>
          <Text>{data.category} Phone</Text>
          <Text style={{ color: '#444444' }}>{data.phone}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="phone" style={{ color: '#0077CC', fontSize: 20 }} onPress={() => onPhone(data.phone)} />
          <PhoneSms />
        </View>
      </View>
    );
  }
  else if(AttributeUtil.isWebsite(item)) {
    return (
      <View style={{ flexDirection: 'row', padding: 12 }}>
        <View style={{ flexGrow: 1 }}>
          <Text>{data.name}</Text>
          <Text style={{ color: '#444444' }}>{data.url}</Text>
        </View>
        <View style={{ justifyContent: 'center' }}>
          <Icon name="external-link" style={{ color: '#0077CC', fontSize: 20 }} onPress={() => onWebsite(data.url)} />
        </View>
      </View>
    );
  }
  else {
    return (<Text>TEXT</Text>);
  }
}

