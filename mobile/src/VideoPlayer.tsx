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

export function VideoPlayer({uri}) {

  const onBuffer = () => {
    console.log("ON  BUFFER");
  };

  const onError = () => {
    console.log("ON ERROR");
  }

  return (
    <View style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' }}>
      <Video source={{uri: uri}} ref={(ref) => { console.log(ref) }} onBuffer={onBuffer} onError={onError} resizeMode="contain"
          style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, alignSelf: 'center' }} />
    </View>
  )
}
