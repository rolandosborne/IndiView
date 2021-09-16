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

export function ContactPhoto({item,handle,navigation}) {

  const [data, setData] = React.useState({});
  const [source, setSource] = React.useState(require('../assets/placeholder.png'));
  const [defaultSource, setDefaultSource] = React.useState(require('../assets/placeholder.png'));
  const [index, setIndex] = React.useState(index);
  const [options, setOptions] = React.useState(<></>);
  const [comment, setComment] = React.useState('comment-o');
  const [thumb, setThumb] = React.useState(null);

  let images = useRef([]);

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
    if(item.tagCount > 0) {
      setComment('commenting-o');
    }
    else {
      setComment('comment-o');
    }
  }, [item]);

  useEffect(() => {
    if(item.data != null) {
      let d = JSON.parse(item.data);
      images.current = d.images;
      setData(d);
      setIndex(0);
    } 
  }, []);

  useEffect(() => {
    if(index != null && data.images != null && data.images.length > 0) {
      setSource({ uri: item.asset(data.images[index].thumb), cache: 'force-cache' });
      setThumb(item.asset(data.images[index].thumb));
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
        dot.push(<View opacity={0.8} key={i} style={{ width: 16, height: 16, margin: 8, backgroundColor: '#0077CC', borderWidth: 1, borderColor: '#ffffff', borderRadius: 8 }} />);
      }
      else {
        dot.push(<View opacity={0.8} key={i} style={{ width: 16, height: 16, margin: 8, borderWidth: 1, borderColor: '#ffffff', borderRadius: 8 }} />);
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

  const onComment = () => {
    navigation.navigate('Comment', { handle: handle, thumb: thumb, subjectId: item.subjectId, amigoId: item.amigoId });
  }

  const onFull = () => {
    let photos = [];
    for(let i = 0; i < images.current.length; i++) {
      photos.push(item.asset(images.current[i].full));
    }
    navigation.navigate('FullScreenPhoto', { uri: photos });
  }

  return (
    <View style={{ flex: 1, marginBottom: 8, borderTopWidth: 1, borderColor: '#888888' }}>
      <TouchableOpacity activeOpacity={1} onLongPress={onFull}>
        <Image style={{ flexGrow: 1, width: null, height: null, aspectRatio: 1 }} source={source} defaultSource={defaultSource} />
        <TouchableOpacity style={{ position: 'absolute', margin: 8, right: 0 }}>
          <View opacity={0.8} style={{ backgroundColor: '#ffffff', borderRadius: 8 }}>{ options }</View>
        </TouchableOpacity>
        <Dots />
      </TouchableOpacity>
      <View style={{ flexGrow: 1, padding: 8, backgroundColor: '#ffffff', flexDirection: 'row', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, borderWidth: 1, borderColor: '#888888' }}>
        <View style={{ flexGrow: 1 }}>
          <Text>{ data.location }&nbsp;&nbsp;<Text style={{ color: '#888888' }}>{ getTime(item.modified) }</Text></Text>
          <Text style={{ paddingTop: 8, color: '#444444' }}>{ data.description }</Text>
        </View>
        <TouchableOpacity style={{ alignItems: 'flex-end' }}>
          <Icon name={comment} style={{ fontSize: 20, color: '#0072CC' }} onPress={onComment} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

