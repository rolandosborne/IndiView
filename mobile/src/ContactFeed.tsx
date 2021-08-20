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

export function ContactFeed({ route, navigation }) {

  const [contact, setContact] = React.useState(route.params);
  const [subjects, setSubjects] = React.useState([]);

  let imgSrc = {};
  if(contact.imageUrl == null) {
    imgSrc = require('../assets/avatar.png');
  }
  else {
    imgSrc = { uri: contact.imageUrl, cache: 'force-cache' };
  }

  let diatum = useDiatum();
  useEffect(() => {
    diatum.getContactSubjects(contact.amigoId).then(s => {
      setSubjects(s);
    });
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
    navigation.setOptions({
      title: contact.handle,
      headerRight: () => (<Image style={{ flexGrow: 1, width: 32, marginRight: 8, marginTop: 4, marginBottom: 4, aspectRatio: 1, borderRadius: 8 }} source={ imgSrc } />)
    });
  }, [navigation, contact]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList data={subjects} keyExtractor={item => item.subjectId} renderItem={({item}) => <ContactSubject item={item} />} />
    </View>
  );
}

function ContactSubject({item}) {
  
  console.log("ITEM:", item);
  let assetUrl = item.asset();
  console.log(assetUrl);

  return (<Text>{ item.subjectId }</Text>);
}

