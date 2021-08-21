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
import { SubjectUtil } from './SubjectUtil';

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
      <FlatList data={subjects} keyExtractor={item => item.subjectId} renderItem={({item}) => {
        if(SubjectUtil.isPhoto(item)) {
          return (<PhotoEntry item={item} />);
        }
        if(SubjectUtil.isVideo(item)) {
          return (<VideoEntry item={item} />);
        }
        return (<></>);
      }} />
    </View>
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

function PhotoEntry({item}) {

  const [data, setData] = React.useState({});
  const [source, setSource] = React.useState(require('../assets/placeholder.png'));
  const [index, setIndex] = React.useState(0);

  useEffect(() => {
    if(item.data != null) {
      let d = JSON.parse(item.data);
      setData(d);
      if(d.images != null && d.images.length > 0) {
        setSource({ uri: item.asset(d.images[0].thumb), cache: 'force-cache' });
      } 
    } 
  }, []);

  const Dots = () => {

    // only dots for more than one
    if(data.images == null || data.images.length <= 1) {
      return (<></>);
    }

    // dot for each image
    let dot = []
    for(let i = 0; i < data.images.length; i++) {
      dot.push(<View key={i} style={{ width: 16, height: 16, margin: 8, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#000000', borderRadius: 8 }} />);
    }

    return (
      <View style={{ position: 'absolute', bottom: 0, width: '100%', justifyContent: 'center', paddingBottom: 16, flexDirection: 'row' }}>{dot}</View>
    );
  };

  const onNext = () => {
    console.log("NEXT");
  };

  return (
    <View style={{ flex: 1, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, marginBottom: 4, backgroundColor: '#eeeeee', borderWidth: 1, borderColor: '#aaaaaa' }}>
      <TouchableOpacity activeOpacity={1}>
        <Image style={{ flexGrow: 1, width: null, height: null, aspectRatio: 1 }} source={source} />
        <Dots />
      </TouchableOpacity>
      <View style={{ padding: 8, flexDirection: 'row' }}>
        <View style={{ flexGrow: 1 }}>
          <Text>{ data.location }&nbsp;&nbsp;<Text style={{ color: '#888888' }}>{ getTime(item.modified) }</Text></Text>
          <Text style={{ paddingTop: 8, color: '#444444' }}>{ data.description }</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Icon name="comment-o" style={{ fontSize: 20, color: '#0072CC' }} />
        </View>
      </View>
    </View>
  );
}

function VideoEntry({item}) {

  const [data, setData] = React.useState({});
  const [source, setSource] = React.useState(require('../assets/placeholder.png'));

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
    <View style={{ flex: 1, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, marginBottom: 4, backgroundColor: '#eeeeee', borderWidth: 1, borderColor: '#888888' }}>
      <Image style={{ flexGrow: 1, width: null, height: null, aspectRatio: 1 }} source={source} />
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

