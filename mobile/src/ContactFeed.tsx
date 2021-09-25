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
import { DiatumSession, LabelEntry, Attribute } from '../diatum/DiatumTypes';
import { DiatumProvider, useDiatum } from "../diatum/DiatumContext";
import { IndiViewCom } from "./IndiViewCom";
import { SubjectUtil } from './SubjectUtil';
import { ContactVideo } from './ContactVideo';
import { ContactPhoto } from './ContactPhoto';

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

  const updateSubjects = async (amigoId: string) => {
    if(amigoId == null || amigoId == contact.amigoId) {
      setSubjects(await diatum.getContactSubjects(contact.amigoId));
    }
  }

  let diatum = useDiatum();
  useEffect(() => {
    diatum.setListener(DiatumEvent.View, updateSubjects);
    return () => {
      diatum.clearListener(DiatumEvent.View, updateSubjects);
    }
  }, []);

  useEffect(async () => {
    let data = await diatum.getContact(contact.amigoId);
    if(data != null && data.appSubject != null) {
      data.appSubject.feedRevision = data.appSubject.subjectRevision;
      let appSubject = { feedRevision: data.appSubject.subjectRevision, subjectRevision: data.appSubject.subjectRevision, subjectModified: data.appSubject.subjectModified };
      await diatum.setContactSubjectData(contact.amigoId, appSubject); 
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
    navigation.setOptions({
      title: contact.handle,
      headerRight: () => (<Image style={{ flexGrow: 1, width: null, height: null, marginRight: 8, marginTop: 4, marginBottom: 4, aspectRatio: 1, borderRadius: 8 }} source={ imgSrc } />)
    });
  }, [navigation, contact]);

  const Instructions = () => {
    if(subjects.length == 0) {
      return (
        <View style={{ position: 'absolute', flexDirection: 'row', marginLeft: 32, marginRight: 32, marginBottom: 16, padding: 16, backgroundColor: '#dddddd', borderRadius: 8, bottom: 0 }}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: '#444444', fontSize: 16, textAlign: 'center' }}>This contact has not shared any posts.</Text>
          </View>
        </View>
      );
    }
    return (<></>);
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList data={subjects} keyExtractor={item => item.subjectId} renderItem={({item}) => {
        if(SubjectUtil.isPhoto(item)) {
          return (<ContactPhoto item={item} handle={contact.handle} navigation={navigation} />);
        }
        if(SubjectUtil.isVideo(item)) {
          return (<ContactVideo item={item} handle={contact.handle} navigation={navigation} />);
        }
        return (<></>);
      }} />
      <Instructions />
    </View>
  );
}

