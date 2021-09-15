import 'react-native-gesture-handler';
import React, { useEffect, forwardRef, useRef, useImperativeHandle } from 'react';
import { SafeAreaView, Alert, Dimensions, Platform, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, TextInput, Image, FlatList, Button, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View, ImageBackground, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import UserAvatar from 'react-native-user-avatar';
import OptionsMenu from "react-native-option-menu";
import { useNavigation } from '@react-navigation/native';
import Video from 'react-native-video';

export function FullScreenVideo({ route }) {

  const [pos, setPos] = React.useState('0%');
  const [mute, setMute] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const [show, setShow] = React.useState(false);
  let timeout = useRef(null);
  let player = useRef(null);
  let playing = useRef(true);
  let cur = useRef(0);

  let uri = route.params.uri;
  let navigation = useNavigation();

  useEffect(() => {
    return () => {
      if(timeout.current != null) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  const onBuffer = () => { };

  const onError = () => {
    Alert.alert("Playback failed, try again");
  }

  const onEnd = () => {
    navigation.goBack();
  };

  const onShow = () => {
    setShow(true);
    if(timeout.current != null) {
      clearTimeout(timeout.current);
    }
    timeout.current = setTimeout(() => {
      timeout.current = null;
      setShow(false);
    }, 5000);
  };

  const onStop = () => {
    navigation.goBack();
  };

  const onMute = () => {
    onShow();
    setMute(!mute);
  };

  const onProgress = (progress) => {
    let d: number = progress.playableDuration;
    if(d > 0) {
      let p: number = progress.currentTime;
      if(cur.current > p || cur.current + 1 < p) {
        setPos(Math.floor(100 * p / d) + "%");
        cur.current = p;
      }
    }
  }

  const onPlay = () => {
    if(playing.current) {
      playing.current = false;
      setPaused(true);
    }
    else {
      playing.current = true;
      setPaused(false);
    }
    onShow();

  } 

  const Action = () => {
    if(paused) {
      return (<Icon name="play-circle-o" style={{ fontSize: 64, color: '#ffffff' }} />);
    }
    return (<Icon name="pause-circle-o" style={{ fontSize: 64, color: '#ffffff' }} />);
  }

  const Controls = () => {
    if(show) {
      return (
        <View style={{ position: 'absolute', width: '100%', height: '100%' }}>
          <TouchableOpacity style={{ position: 'absolute', padding: 16, top: '7%', right: 0 }} onPress={onStop} >
            <View opacity={0.8} style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="times-circle-o" style={{ position: 'absolute', fontSize: 32, color: '#000000' }} />
              <Icon name="times-circle-o" style={{ fontSize: 36, color: '#ffffff' }} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={{ position: 'absolute', padding: 16, top: '7%', left: 0 }} onPress={onMute}>
            <View opacity={0.8} style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={mute ? 'volume-off' : 'volume-up'} style={{ position: 'absolute', fontSize: 24, color: '#000000' }} />
              <Icon name={mute ? 'volume-off' : 'volume-up'} style={{ fontSize: 28, color: '#ffffff' }} />
            </View>
          </TouchableOpacity>
          <View style={{ position: 'absolute', bottom: '10%', width: '100%' }}>
            <TouchableOpacity style={{ marginBottom: 32, width: '100%', alignItems: 'center' }} onPress={onPlay} >
              <View opacity={0.8}><Action /></View>
            </TouchableOpacity>
            <View style={{ position: 'absolute', bottom: 0, width: '100%', borderColor: '#ffffff', borderWidth: 1 }} />
            <View style={{ position: 'absolute', bottom: 0, left: pos, width: 8, height: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ffffff', backgroundColor: '#ffffff' }} />
          </View>
        </View>
      );
    }
    return (<></>);
  }
  return (
    <TouchableOpacity activeOpacity={1}  style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' }} onPress={onShow}>
      <ActivityIndicator animating={true} size="large" color="#ffffff" />
      <Video source={{uri: uri}} ref={(ref) => { player.current = ref }} onEnd={onEnd} onError={onError} onProgress={onProgress}
          resizeMode="contain" muted={mute} paused={paused} style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, alignSelf: 'center' }} />
      <Controls />
    </TouchableOpacity>
  )
}
