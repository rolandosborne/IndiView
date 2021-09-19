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

export function Topics({ route, navigation }) {
  const [param, setParam] = React.useState(route.params);
  const [topics, setTopics] = React.useState([]);  
  const [message, setMessage] = React.useState(null);

  let diatum = useDiatum();

  const update = async () => {
    let conv = route.params;
    setTopics(await diatum.getTopicViews(conv.amigoId, conv.dialogueId, conv.hosting));
  }

  useEffect(() => {
    diatum.setListener(DiatumEvent.Conversation, update);
    return () => {
      diatum.clearListener(DiatumEvent.Conversation, update);
    }
  }, []);

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

    navigation.setOptions({
      title: route.params.handle,
      headerRight: () => (<Image style={{ flexGrow: 1, width: null, height: null, marginRight: 8, marginTop: 4, marginBottom: 4, aspectRatio: 1, borderRadius: 8 }} source={ imgSrc } />)
    });
  }, [navigation]);

  const onSend = async () => {
    try {
      await diatum.addConversationBlurb(route.params.amigoId, route.params.dialogueId, route.params.hosting, TagUtil.MESSAGE, JSON.stringify({ message: message }));
      setMessage(null);
    }
    catch(err) {
      console.log(err);
      Alert.alert("Failed to send message");
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 12, width: '100%', marginBottom: 8, backgroundColor: '#eeeeee', borderBottomWidth: 2, borderColor: '#dddddd', flexDirection: 'row' }}>
        <TextInput multiline={true} style={{ flex: 1, fontSize: 16, textAlignVertical: 'top' }} autoCapitalize={'sentences'} value={message} onChangeText={setMessage} placeholder={'Message'} placeholderTextColor={'#888888'} />
        <TouchableOpacity style={{ alignSelf: 'center' }} onPress={onSend}>
          <Icon name="send-o" style={{ color: '#0072CC', fontSize: 24, paddingLeft: 16 }} />
        </TouchableOpacity>
      </View>
      <FlatList data={topics} keyExtractor={item => item.topicId} renderItem={({item}) => <TopicEntry amigoId={param.amigoId} dialogueId={param.dialogueId} hosting={param.hosting} topic={item} />} />
    </View>
  );
}

function TopicEntry({ amigoId, dialogueId, hosting, topic }) {
  const [blurbs, setBlurbs] = React.useState([]);

  diatum = useDiatum();
  useEffect(async () => {
    let b = await diatum.getTopicBlurbs(amigoId, dialogueId, hosting, topic.topicId);
    let m = [];
    for(let i = 0; i < b.length; i++) {
      m.unshift(<Text key={i}>{ b[i].data }</Text>);
    }
    setBlurbs(m);
  }, [topic]);
    

  return ( <View>{ blurbs }</View> );
}

