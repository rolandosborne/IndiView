import 'react-native-gesture-handler';
import React, { useEffect, forwardRef, useRef, useImperativeHandle } from 'react';
import { Pressable, SafeAreaView, Modal, Alert, Animated, Dimensions, Platform, Clipboard, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, TextInput, Image, FlatList, Button, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View, ImageBackground, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import OptionsMenu from "react-native-option-menu";
import { useNavigation } from '@react-navigation/native';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import ImagePicker from 'react-native-image-crop-picker';

import { Latch, useLatch } from './LatchContext';
import { Diatum, DiatumEvent } from '../diatum/Diatum';
import { AttachCode, getAttachCode } from '../diatum/DiatumUtil';
import { DiatumSession, LabelEntry, TopicView, Blurb } from '../diatum/DiatumTypes';
import { DiatumProvider, useDiatum } from "../diatum/DiatumContext";
import { IndiViewCom } from "./IndiViewCom";
import { DialogueUtil } from './DialogueUtil';
import { AppSupport, useApp } from './AppSupport';

export function Topics({ route, navigation }) {
  const [param, setParam] = React.useState(route.params);
  const [topics, setTopics] = React.useState([]);  
  const [busy, setBusy] = React.useState(false);
  const [images, setImages] = React.useState([]);

  let text = React.useRef(null);
  let message = React.useRef(null);
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
    if(!busy && ((message.current != null && message.current != '') || images.length > 0)) {
      setBusy(true);
      try {
        await diatum.addConversationBlurb(route.params.amigoId, route.params.dialogueId, route.params.hosting, DialogueUtil.BLURB, JSON.stringify({ images: images, message: message.current }));
        try {
          await IndiViewCom.setEvent(app.getToken(), route.params.amigoId, 'blurb');
        }
        catch(err) {
          console.log(err);
        }
        message.current = null;
        text.current.clear();
        setImages([]);
      }
      catch(err) {
        console.log(err);
        Alert.alert("Failed to send message");
      }
      setBusy(false);
    }
  }

  const onAttach = async () => {
    try {
      let img = await ImagePicker.openPicker({ compressImageMaxWidth: 192, compressImageMaxHeight: 192, cropping: false, includeBase64: true});
      images.push({ mime: img.mime, data: img.data });
      setImages([...images]);
    }
    catch(err) {
      console.log(err);
      Alert.alert("failed select image");
    }
  }

  const onDetach = (index) => {
    images.splice(index, 1);
    setImages([...images]);
  }

  const Attach = () => {
    return (
      <TouchableOpacity style={{ alignSelf: 'center' }} onPress={onAttach}>
        <Icon name="paperclip" style={{ color: '#0072CC', fontSize: 24, paddingRight: 16 }} />
      </TouchableOpacity>
    );
  }

  const Send = () => {
    if(busy) {
      return (<ActivityIndicator style={{ alignSelf: 'center' }} animating={true} size="small" color="#777777" />)
    }
    return (
      <TouchableOpacity style={{ alignSelf: 'center' }} onPress={onSend}>
        <Icon name="send-o" style={{ color: '#0072CC', fontSize: 24, paddingLeft: 16 }} />
      </TouchableOpacity>
    )
  }

  const AttachImage = (item) => {
    return (
      <View style={{ width: 92, height: 92, marginRight: 8 }}>
        <Image style={{ width: 92, height: 92, resizeMode: 'contain' }} source={{uri: "data:" + item.mime + ";base64," + item.data }} onLongPress={() => item.detach()} />
        <View opacity={0.8} style={{ position: 'absolute', left: 36, top: 36, padding: 4, borderRadius: 4, backgroundColor: '#ffffff' }}>
          <Icon name="times" style={{ color: '#222222', fontSize: 18 }} onPress={() => item.detach()} />
        </View> 
      </View>
    );
  }

  const Images = () => {
    if(images.length == 0) {
      return (<></>);
    }
    return (
      <FlatList style={{ padding: 2 }} data={images} horizontal={true} keyExtractor={(item, index) => index} renderItem={({item,index}) => <AttachImage mime={item.mime} data={item.data} index={index} detach={() => { onDetach(index) }} /> } />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 8, width: '100%', marginBottom: 8, backgroundColor: '#eeeeee', borderBottomWidth: 2, borderColor: '#dddddd', flexDirection: 'row' }}>
        <Attach />
        <View style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <Images style={{ display: 'flex' }} />
          <TextInput multiline={true} style={{ display: 'flex', fontSize: 16, textAlignVertical: 'top', color: busy ? '#dddddd' : '#444444' }} autoCapitalize={'sentences'} onChangeText={val => { message.current=val; }} ref={input => text.current=input } placeholder={'Message'} placeholderTextColor={'#888888'} editable={!busy} />
        </View>
        <Send />
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

  useEffect(() => {
    if(data.images != null && data.images.length > 0) {
      for(let i = 0; i < data.images.length; i++) {
        data.images[i].key = i;
      } 
    }
  }, [data]);

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

  const AttachImage = (item) => {
    return (
      <Image style={{ width: 192, height: 192, resizeMode: 'contain', marginRight: 4, marginLeft: 4 }} source={{uri: "data:" + item.mime + ";base64," + item.data }} />
    );
  }

  const Images = () => {
    if(data.images == null || data.images.length == 0) {
      return (<></>);
    }
    return (
      <FlatList style={{ padding: 2, display: 'flex', flex: 1 }} data={data.images} horizontal={true} keyExtractor={(item, index) => index} renderItem={({item,index}) => <AttachImage mime={item.mime} data={item.data} /> } />
    );
  }

  const Message = () => {
    if(data.message == null || data.message == '') {
      return (<></>);
    }
    return (<Text style={{ color: '#ffffff', fontSize: 16 }}>{ data.message }</Text>);
  }

  let app = useApp();
  useEffect(() => {
    if(app.getAmigoId() == blurb.amigoId || hosting) {
      setEditable(true);
    }
  }, []);

  if(blurb.amigoId == app.getAmigoId()) {
    return (
      <View activeOpacity={editable ? 0.5 : 1} style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
        <View style={{ position: 'absolute', margin: 8, width: 24, height: 32, borderRadius: 8, backgroundColor: '#444444', bottom: 0, left: 0 }} />
        <View style={{ position: 'absolute', margin: 8, width: 18, height: 32, borderRadius: 16, backgroundColor: '#eeeeee', bottom: 0, left: -2 }} />
        <Pressable style={{ position: 'absolute', marginLeft: 40, marginBottonm: 2, bottom: 0, left: 0 }} onLongPress={onRemove}>
          <Text style={{ color: '#888888', fontSize: 12 }}>{ getTime(blurb.updated) }</Text>
        </Pressable>
        <View style={{ backgroundColor: '#444444', margin: 16, borderRadius: 8, paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8 }}>
          <Images style={{ flex: 1 }} />
          <Message />
        </View>
      </View>
    );
  }
  else {
    return (
      <View activeOpacity={editable ? 0.5 : 1} style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <View style={{ position: 'absolute', margin: 8, width: 24, height: 32, borderRadius: 8, backgroundColor: '#444444', bottom: 0, right: 0 }} />
        <View style={{ position: 'absolute', margin: 8, width: 18, height: 32, borderRadius: 16, backgroundColor: '#eeeeee', bottom: 0, right: -2 }} />
        <Pressable style={{ position: 'absolute', marginRight: 40, marginBottom: 2, bottom: 0, right: 0 }} onLongPress={onRemove}>
          <Text style={{ color: '#888888', fontSize: 12 }}>{ getTime(blurb.updated) }</Text>
        </Pressable>
        <View style={{ backgroundColor: '#444444', margin: 16, borderRadius: 8, paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8, display: 'flex' }}>
          <Images />
          <Message />
        </View>
      </View>
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

