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

import { Diatum, DiatumEvent } from '../diatum/Diatum';
import { DiatumProvider, useDiatum } from "../diatum/DiatumContext";
import { SubjectUtil } from './SubjectUtil';


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

export function ContactVideo({item}) {

  const [data, setData] = React.useState({});
  const [source, setSource] = React.useState(require('../assets/placeholder.png'));
  const [defaultSource, setDefaultSource] = React.useState(require('../assets/placeholder.png'));
  const [options, setOptions] = React.useState(<></>);

  useEffect(() => {
    if(item.blocked) {
      let opt = [ "Unlock Post", "Close Menu" ];
      let act = [ onUnblock, ()=>{} ];
      let btn = (<Icon name="ellipsis-v" style={{ color: '#444444', fontSize: 18, padding: 8 }} />);
      setOptions(<OptionsMenu customButton={btn} options={opt} actions={act} />);
    }
    else {
      let opt = [ "Block Post", "Close Menu" ];
      let act = [ onBlock, ()=>{} ];
      let btn = (<Icon name="ellipsis-v" style={{ color: '#444444', fontSize: 18, padding: 8 }} />);
      setOptions(<OptionsMenu customButton={btn} options={opt} actions={act} />);
    }
  }, [item]);

  let diatum = useDiatum();
  const onBlock = () => {
    const title = 'Do you want to block this post?';
    const message = '';
    const buttons = [
      { text: 'Cancel', type: 'cancel' },
      { text: 'Yes, Block', onPress: async () => {
        try {
          await diatum.setBlockedSubject(item.amigoId, item.subjectId, true);
        }
        catch(err) {
          console.log(err);
          Alert.alert("failed to block post");
        }
      }}
    ];
    Alert.alert(title, message, buttons);
  };
  const onUnblock = () => {
    const title = 'Do you want to unblock this post?';
    const message = '';
    const buttons = [
      { text: 'Cancel', type: 'cancel' },
      { text: 'Yes, Unblock', onPress: async () => {
        try {
          await diatum.setBlockedSubject(item.amigoId, item.subjectId, false);
        }
        catch(err) {
          console.log(err);
          Alert.alert("failed to unblock post");
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

