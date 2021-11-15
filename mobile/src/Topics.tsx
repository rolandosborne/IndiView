import 'react-native-gesture-handler';
import React, { useEffect, forwardRef, useRef, useImperativeHandle } from 'react';
import { SafeAreaView, Modal, Alert, Animated, Dimensions, Platform, Clipboard, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, TextInput, Image, FlatList, Button, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View, ImageBackground, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import OptionsMenu from "react-native-option-menu";
import { useNavigation } from '@react-navigation/native';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';

import { Latch, useLatch } from './LatchContext';
import { Diatum, DiatumEvent } from '../diatum/Diatum';
import { AttachCode, getAttachCode } from '../diatum/DiatumUtil';
import { DiatumSession, LabelEntry, TopicView, Blurb } from '../diatum/DiatumTypes';
import { DiatumProvider, useDiatum } from "../diatum/DiatumContext";
import { IndiViewCom } from "./IndiViewCom";
import { TagUtil } from './TagUtil';
import { AppSupport, useApp } from './AppSupport';

export function Topics({ route, navigation }) {
  const [param, setParam] = React.useState(route.params);
  const [topics, setTopics] = React.useState([]);  
  const [message, setMessage] = React.useState(null);
  const [busy, setBusy] = React.useState(false);

  let revision = React.useRef(null);
  let diatum = useDiatum();

  const update = async () => {
    let conv = route.params;
    setTopics(await diatum.getTopicViews(conv.amigoId, conv.dialogueId, conv.hosting));
  }

  useEffect(() => {
    let conv = route.params;
    if(conv.appData != null) {
      revision.current = conv.appData.revision;
    }
    if(conv.blurbData != null && conv.blurbData.revision != null) {
      if(revision.current == null || conv.blurbData.revision > revision.current) {
        revision.current = conv.blurbData.revision;
        diatum.setConversationAppData(conv.amigoId, conv.dialogueId, conv.hosting, { revision: revision.current });
      }
    }
    diatum.setListener(DiatumEvent.Conversation, update);
    return () => {
      diatum.clearListener(DiatumEvent.Conversation, update);
    }
  }, []);

  const setRevision  = (r: number) => {
    if(revision.current == null || revision.current < r) {
      let conv = route.params;
      revision.current = r;
      diatum.setConversationAppData(conv.amigoId, conv.dialogueId, conv.hosting, { revision: revision.current });
    }
  }

  let app = useApp();
  let latch: Latch = useLatch();
  const onLatch = () => { };
  useEffect(() => {
    const unfocus = navigation.addListener('focus', () => {
      latch.setToggleListener(onLatch, '#aaaaaa');
    });
    return (() => {
      latch.clearToggleListener(onLatch);
      unfocus();
    })
  }, []);

  React.useLayoutEffect(() => {

    let imgSrc = {};
    if(route.params.imageUrl == null) {
      imgSrc = require('../assets/avatar.png');
    }
    else {
      imgSrc = { uri: route.params.imageUrl, cache: 'force-cache' };
    }

    let name;
    if(route.params.hosting) {
    }
    else {
    }

    let closed;
    if(route.params.active) {
      closed = (<></>);
    }
    else {
      closed = (<Icon name={'ban'} style={{ fontSize: 18, color: 'orange' }} />);
    }

    navigation.setOptions({
      title: <Text>
        <Icon name={ route.params.hosting ? 'home' : 'user'} style={{ fontSize: 18, color: '#555555' }} />&nbsp;&nbsp;
        { route.params.handle }&nbsp;&nbsp;{ closed }
      </Text>,
      headerRight: () => (<Image style={{ flexGrow: 1, width: null, height: null, marginRight: 8, marginTop: 4, marginBottom: 4, aspectRatio: 1, borderRadius: 8 }} source={ imgSrc } />)
    });
  }, [navigation]);

  const onSend = async () => {
    if(!busy && message != null && message != '') {
      setBusy(true);
      try {
        await diatum.addConversationBlurb(route.params.amigoId, route.params.dialogueId, route.params.hosting, TagUtil.MESSAGE, JSON.stringify({ message: message }));
        try {
          await IndiViewCom.setEvent(app.getToken(), route.params.amigoId, 'blurb');
        }
        catch(err) {
          console.log(err);
        }
        setMessage(null);
      }
      catch(err) {
        console.log(err);
        Alert.alert("Failed to send message");
      }
      setBusy(false);
    }
  }

  const Control = () => {
    if(busy) {
      return (<ActivityIndicator style={{ alignSelf: 'center' }} animating={true} size="small" color="#777777" />)
    }
    return (
      <TouchableOpacity style={{ alignSelf: 'center' }} onPress={onSend}>
        <Icon name="send-o" style={{ color: '#0072CC', fontSize: 24, paddingLeft: 16 }} />
      </TouchableOpacity>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 12, width: '100%', marginBottom: 8, backgroundColor: '#eeeeee', borderBottomWidth: 2, borderColor: '#dddddd', flexDirection: 'row' }}>
        <TextInput multiline={true} style={{ flex: 1, fontSize: 16, textAlignVertical: 'top', color: busy ? '#dddddd' : '#444444' }} autoCapitalize={'sentences'} value={message} onChangeText={setMessage} placeholder={'Message'} placeholderTextColor={'#888888'} editable={!busy} />
        <Control />
      </View>
      <FlatList data={topics} keyExtractor={item => item.topicId} renderItem={({item}) => <TopicEntry amigoId={param.amigoId} dialogueId={param.dialogueId} hosting={param.hosting} topic={item} setRevision={setRevision} />} />
    </View>
  );
}

function TopicEntry({ amigoId, dialogueId, hosting, topic, setRevision }) {
  const [blurbs, setBlurbs] = React.useState([]);

  diatum = useDiatum();
  useEffect(async () => {
    let b = await diatum.getTopicBlurbs(amigoId, dialogueId, hosting, topic.topicId);
    let m = [];
    for(let i = 0; i < b.length; i++) {
      let data;
      if(b[i].data != null) {
        data = JSON.parse(b[i].data);
      }
      else {
        data = {};
      }
      m.unshift(<BlurbEntry key={i} blurb={b[i]} data={data} amigoId={amigoId} dialogueId={dialogueId} hosting={hosting} />)
    }
    if(b.length > 0) {
      setRevision(b[b.length-1].revision);
    }
    setBlurbs(m);
  }, [topic]);

  return ( <View>{ blurbs }</View> );
}

function BlurbEntry({ blurb, data, amigoId, dialogueId, hosting }) {

  const [editable, setEditable] = React.useState(false);

  let diatum = useDiatum();
  const onRemove = () => {
    if(editable) {
      const title = 'Do you want to delete this message?';
      const message = '';
      const buttons = [
          { text: 'Yes, Delete', onPress: async () => {
            try {
              await diatum.removeConversationBlurb(amigoId, dialogueId, hosting, blurb.blurbId);
            }
            catch(err) {
              console.log(err);
              Alert.alert("failed to delete message");
            }
          }},
          { text: 'Cancel', type: 'cancel' }
      ];
      Alert.alert(title, message, buttons);
    }
  }

  let app = useApp();
  useEffect(() => {
    if(app.getAmigoId() == blurb.amigoId || hosting) {
      setEditable(true);
    }
  }, []);

  if(blurb.amigoId == app.getAmigoId()) {
    return (
      <TouchableOpacity activeOpacity={editable ? 0.5 : 1} style={{ flexDirection: 'row', justifyContent: 'flex-start' }} onLongPress={onRemove}>
        <View style={{ position: 'absolute', margin: 8, width: 24, height: 32, borderRadius: 8, backgroundColor: '#444444', bottom: 0, left: 0 }} />
        <View style={{ position: 'absolute', margin: 8, width: 18, height: 32, borderRadius: 16, backgroundColor: '#eeeeee', bottom: 0, left: -2 }} />
        <Text style={{ position: 'absolute', marginLeft: 40, marginBottom: 2, bottom: 0, left: 0, color: '#888888', fontSize: 12 }}>{ getTime(blurb.updated) }</Text>
        <View style={{ backgroundColor: '#444444', margin: 16, borderRadius: 8, paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8 }}>
          <Text style={{ color: '#ffffff', fontSize: 16 }}>{ data.message }</Text>
        </View>
      </TouchableOpacity>
    );
  }
  else {
    return (
      <TouchableOpacity activeOpacity={editable ? 0.5 : 1} style={{ flexDirection: 'row', justifyContent: 'flex-end' }} onLongPress={onRemove}>
        <View style={{ position: 'absolute', margin: 8, width: 24, height: 32, borderRadius: 8, backgroundColor: '#444444', bottom: 0, right: 0 }} />
        <View style={{ position: 'absolute', margin: 8, width: 18, height: 32, borderRadius: 16, backgroundColor: '#eeeeee', bottom: 0, right: -2 }} />
        <Text style={{ position: 'absolute', marginRight: 40, marginBottom: 2, bottom: 0, right: 0, color: '#888888', fontSize: 12 }}>{ getTime(blurb.updated) }</Text>
        <View style={{ backgroundColor: '#444444', margin: 16, borderRadius: 8, paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8 }}>
          <Text style={{ color: '#ffffff', fontSize: 16 }}>{ data.message }</Text>
        </View>
      </TouchableOpacity>
    );
  }
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

