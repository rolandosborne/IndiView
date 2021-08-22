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
import { SubjectUtil } from './SubjectUtil';

export function BlockedItems({ navigation }) {
  const [mode, setMode] = React.useState('contacts');

  const Blocked = () => {
    if(mode == 'contacts') {
      return (<BlockedContacts />);
    }
    if(mode == 'subjects') {
      return (<BlockedSubjects />);
    }
    if(mode == 'conversations') {
      return (<BlockedConversations />);
    }
    return (<></>);
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: 48, flexDirection: 'row', alignItems: 'flex-end', paddingBottom: 8, borderBottomWidth: 1, borderColor: '#aaaaaa', backgroundColor: '#dddddd' }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setMode('contacts')}>
            <Icon name="user" size={24} color={ mode=='contacts' ? '#0072CC' : '#444444' } solid />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setMode('subjects')}>
            <Icon name="file-picture-o" size={24} color={ mode=='subjects' ? '#0072CC' : '#444444' } solid />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setMode('conversations')}>
            <Icon name="comment-o" size={24} color={ mode=='conversations' ? '#0072CC' : '#444444' } solid />
          </TouchableOpacity>
        </View>
      </View>
      <Blocked />
    </View>
  );
}

function BlockedConversations() {
  return (<></>);
}

function BlockedSubjects() {
  const [subjects, setSubjects] = React.useState([]);
  
  const updateSubjects = async (amigoId: string) => {
    let s = await diatum.getBlockedSubjects();
    setSubjects(s);
  }

  let diatum = useDiatum();
  useEffect(() => {
    diatum.setListener(DiatumEvent.View, updateSubjects);
    return () => {
      diatum.clearListener(DiatumEvent.View, updateSubjects);
    }
  }, []);

  return (
    <FlatList data={subjects} keyExtractor={item => item.subjectId} renderItem={({item}) => {
      if(SubjectUtil.isPhoto(item)) {
        return (<PhotoSubject item={item} />);
      }
      if(SubjectUtil.isVideo(item)) {
        return (<VideoSubject item={item} />);
      }
      return (<></>);
    }} />
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

function PhotoSubject({item}) {
  const [data, setData] = React.useState({});
  const [source, setSource] = React.useState(require('../assets/placeholder.png'));
  const [defaultSource, setDefaultSource] = React.useState(require('../assets/placeholder.png'));
  const [index, setIndex] = React.useState(index);
  const [options, setOptions] = React.useState(<></>);

  let diatum = useDiatum();
  const onBlock = () => { 
    const title = 'Do you want to block this story?';
    const message = '';
    const buttons = [
      { text: 'Cancel', type: 'cancel' },
      { text: 'Yes, Block', onPress: async () => {
        try {
          await diatum.setBlockedSubject(item.amigoId, item.subjectId, true);
        }
        catch(err) {
          console.log(err);
          Alert.alert("failed to block story");
        }
      }}
    ];
    Alert.alert(title, message, buttons);
  };
  const onUnblock = () => {
    const title = 'Do you want to unblock this story?';
    const message = '';
    const buttons = [
      { text: 'Cancel', type: 'cancel' },
      { text: 'Yes, Unblock', onPress: async () => {
        try {
          await diatum.setBlockedSubject(item.amigoId, item.subjectId, false);
        }
        catch(err) {
          console.log(err);
          Alert.alert("failed to unblock story");
        }
      }}
    ];
    Alert.alert(title, message, buttons);
  };

  useEffect(() => {
    if(item.blocked) {
      let opt = [ "Unlock Story", "Close Menu" ];
      let act = [ onUnblock, ()=>{} ];
      let btn = (<Icon name="ellipsis-v" style={{ color: '#444444', fontSize: 18, padding: 8 }} />);
      setOptions(<OptionsMenu customButton={btn} options={opt} actions={act} />);
    }
    else {
      let opt = [ "Block Story", "Close Menu" ];
      let act = [ onBlock, ()=>{} ];
      let btn = (<Icon name="ellipsis-v" style={{ color: '#444444', fontSize: 18, padding: 8 }} />);
      setOptions(<OptionsMenu customButton={btn} options={opt} actions={act} />);
    }
  }, [item]);

  useEffect(() => {
    if(item.data != null) {
      let d = JSON.parse(item.data);
      setData(d);
      setIndex(0);
    } 
  }, []);

  useEffect(() => {
    if(index != null && data.images != null && data.images.length > 0) {
      setSource({ uri: item.asset(data.images[index].thumb), cache: 'force-cache' });
    } 
  }, [index]);

  const Dots = () => {

    // only dots for more than one
    if(data.images == null || data.images.length <= 1) {
      return (<></>);
    }

    // dot for each image
    let dot = []
    for(let i = 0; i < data.images.length; i++) {
      if(index == i) {
        dot.push(<View opacity={0.8} key={i} style={{ width: 16, height: 16, margin: 8, backgroundColor: '#0077CC', borderWidth: 1, borderColor: '#000000', borderRadius: 8 }} />);
      }
      else {
        dot.push(<View opacity={0.8} key={i} style={{ width: 16, height: 16, margin: 8, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#000000', borderRadius: 8 }} />);
      }
    }

    return (
      <TouchableOpacity activeOpacity={1} onPress={onNext} style={{ position: 'absolute', bottom: 0, width: '100%', justifyContent: 'center', padding: 16, flexDirection: 'row' }}>{dot}</TouchableOpacity>
    );
  };

  const onPrevious = () => {
    if(data.images != null && data.images.length > 1) {
      if(index > 1) {
        setIndex(index-1);
      }
      else {
        setIndex(data.images.length-1);
      }
      setSource({ uri: item.asset(data.images[index].thumb), cache: 'force-cache' });
    }
  };

  const onNext = () => {
    if(data.images != null && data.images.length > 1) {
      if(index < data.images.length - 1) {
        setIndex(index+1);
      }
      else {
        setIndex(0);
      }
    }
  };

  const swipeConfig = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80
  };

  return (
    <View style={{ flex: 1, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, marginBottom: 8, backgroundColor: '#eeeeee', borderWidth: 1, borderColor: '#aaaaaa' }}>
      <View>
        <Image style={{ flexGrow: 1, width: null, height: null, aspectRatio: 1 }} source={source} defaultSource={defaultSource} />
        <TouchableOpacity style={{ position: 'absolute', margin: 8, right: 0 }}>
          <View opacity={0.8} style={{ backgroundColor: '#ffffff', borderRadius: 8 }}>{ options }</View>
        </TouchableOpacity>
        <Dots />
      </View>
      <View style={{ padding: 8, flexDirection: 'row' }}>
        <View style={{ flexGrow: 1 }}>
          <Text>{ data.location }&nbsp;&nbsp;<Text style={{ color: '#888888' }}>{ getTime(item.modified) }</Text></Text>
          <Text style={{ paddingTop: 8, color: '#444444' }}>{ data.description }</Text>
        </View>
        <TouchableOpacity style={{ alignItems: 'flex-end' }}>
          <Icon name="comment-o" style={{ fontSize: 20, color: '#0072CC' }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function VideoSubject({item}) {
  const [data, setData] = React.useState({});
  const [source, setSource] = React.useState(require('../assets/placeholder.png'));
  const [defaultSource, setDefaultSource] = React.useState(require('../assets/placeholder.png'));
  const [options, setOptions] = React.useState(<></>);

  useEffect(() => {
    if(item.blocked) {
      let opt = [ "Unlock Story", "Close Menu" ];
      let act = [ onUnblock, ()=>{} ];
      let btn = (<Icon name="ellipsis-v" style={{ color: '#444444', fontSize: 18, padding: 8 }} />);
      setOptions(<OptionsMenu customButton={btn} options={opt} actions={act} />);
    }
    else {
      let opt = [ "Block Story", "Close Menu" ];
      let act = [ onBlock, ()=>{} ];
      let btn = (<Icon name="ellipsis-v" style={{ color: '#444444', fontSize: 18, padding: 8 }} />);
      setOptions(<OptionsMenu customButton={btn} options={opt} actions={act} />);
    }
  }, [item]);

  let diatum = useDiatum();
  const onBlock = () => {
    const title = 'Do you want to block this story?';
    const message = '';
    const buttons = [
      { text: 'Cancel', type: 'cancel' },
      { text: 'Yes, Block', onPress: async () => {
        try {
          await diatum.setBlockedSubject(item.amigoId, item.subjectId, true);
        }
        catch(err) {
          console.log(err);
          Alert.alert("failed to block story");
        }
      }}
    ];
    Alert.alert(title, message, buttons);
  };
  const onUnblock = () => {
    const title = 'Do you want to unblock this story?';
    const message = '';
    const buttons = [
      { text: 'Cancel', type: 'cancel' },
      { text: 'Yes, Unblock', onPress: async () => {
        try {
          await diatum.setBlockedSubject(item.amigoId, item.subjectId, false);
        }
        catch(err) {
          console.log(err);
          Alert.alert("failed to unblock story");
        }
      }}
    ];
    Alert.alert(title, message, buttons);
  };

  useEffect(() => {
    if(item.data != null) {
      let d = JSON.parse(item.data);
      setData(d);
      if(d.thumb != null) {
        setSource({ uri: item.asset(d.thumb), cache: 'force-cache' });
      } 
    } 
  }, []);

  return (
    <View style={{ flex: 1, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, marginBottom: 8, backgroundColor: '#eeeeee', borderWidth: 1, borderColor: '#888888' }}>
      <View>
        <Image style={{ flexGrow: 1, width: null, height: null, aspectRatio: 1 }} source={source} defaultSource={defaultSource} />
        <TouchableOpacity style={{ position: 'absolute', margin: 8, right: 0 }} onPress={onBlock}>
          <View opacity={0.8} style={{ backgroundColor: '#ffffff', borderRadius: 8 }}>{ options }</View>
        </TouchableOpacity>
        <TouchableOpacity style={{ position: 'absolute', padding: 16, bottom: 0, width: '100%', alignItems: 'center' }}>
          <View opacity={0.8}>
            <Icon name="play-circle-o" style={{ fontSize: 64, color: '#ffffff' }} />
          </View>
        </TouchableOpacity>
      </View>
      <View style={{ padding: 8, flexDirection: 'row' }}>
        <View style={{ flexGrow: 1 }}>
          <Text>{ data.location }&nbsp;&nbsp;<Text style={{ color: '#888888' }}>{ getTime(item.modified) }</Text></Text>
          <Text style={{ paddingTop: 8, color: '#444444' }}>{ data.description }</Text>
        </View>
        <TouchableOpacity style={{ alignItems: 'flex-end' }}>
          <Icon name="comment-o" style={{ fontSize: 20, color: '#0072CC' }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function BlockedContacts() {
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
      let c = await diatum.getBlockedContacts();
      setContacts(c);
    }
    catch(err) {
      console.log(err);
    }
  }

  return (
    <FlatList style={{ paddingTop: 16, flex: 1 }} data={contacts} keyExtractor={item => item.amigoId} renderItem={({item}) => <BlockedContact item={item} /> } />
  );
}

function BlockedContact({item}) {
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
