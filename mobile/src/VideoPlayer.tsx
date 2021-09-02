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
import Video from 'react-native-video';

export function VideoPlayer({uri, done}) {
  const [show, setShow] = React.useState(false);
  let timeout = useRef(null);

  useEffect(() => {
    return () => {
      if(timeout.current != null) {
        clearTimeout(timeout.current);
      }
      if(done != null) {
        done();
      }
    };
  }, []);

  const onBuffer = () => { };

  const onError = () => {
    Alert.alert("Playback failed, try again");
  }

  const onEnd = () => {
    if(done != null) {
      done();
    }
  }

  const onShow = () => {
    setShow(true);
    if(timeout.current != null) {
      clearTimeout(timeout.current);
    }
    timeout.current = setTimeout(() => {
      timeout.current = null;
      setShow(false);
    }, 5000);
  }

  const onStop = () => {
    if(done != null) {
      done();
    }
  }

  const Controls = () => {
    if(show) {
      return (
        <TouchableOpacity style={{ position: 'absolute', padding: 16, bottom: 0, width: '100%', alignItems: 'center' }}>
          <View opacity={0.8}>
            <Icon name="times-circle-o" style={{ fontSize: 48, color: '#ffffff' }} onPress={onStop} />
          </View>
        </TouchableOpacity>
      );
    }
    return (<></>);
  }

  return (
    <TouchableOpacity activeOpacity={1}  style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' }} onPress={onShow}>
      <ActivityIndicator animating={true} size="large" color="#ffffff" />
      <Video source={{uri: uri}} ref={(ref) => { }} onEnd={onEnd} onError={onError} resizeMode="contain"
          style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, alignSelf: 'center' }} />
      <Controls />
    </TouchableOpacity>
  )
}
