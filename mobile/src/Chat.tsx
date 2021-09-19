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

export function Chat({ route, navigation }) {

  const [topics, setTopics] = React.useState([]);  

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

  return (
    <></>
  );
}

