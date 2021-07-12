import 'react-native-gesture-handler';
import React, { useEffect, forwardRef, useRef, useImperativeHandle } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Dimensions, Platform, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, TextInput, Image, FlatList, Button, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View, ImageBackground, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import UserAvatar from 'react-native-user-avatar';
import OptionsMenu from "react-native-option-menu";
import { useNavigation } from '@react-navigation/native';

import { Latch, useLatch } from './LatchContext';
import { Diatum, DiatumEvent } from '../diatum/Diatum';
import { DiatumSession, LabelEntry } from '../diatum/DiatumTypes';
import { DiatumProvider, useDiatum } from "../diatum/DiatumContext";
import { IndiViewCom } from "./IndiViewCom";

export function Conversation({ navigation }) {
  
  const [latchColor, setLatchColor] = React.useState('#282827');
  const latchColorRef = useRef(latchColor);
  const _setLatchColor = color => {
    latchColorRef.current = color;
    setLatchColor(color);
    latch.setColor(color);
  };

  const latch = useLatch();
  const onLatch = () => {
    console.log("FEED LATCH");
  };

  useEffect(() => {
    _setLatchColor(latchColor);
    const unfocus = navigation.addListener('focus', () => {
      latch.setToggleListener(onLatch, latchColorRef.current);
    });
    return (() => {
      latch.clearToggleListener(onLatch);
      unfocus();
    }) 
  }, [navigation]);

  return (
    <View style={{ paddingTop: Platform.OS === 'ios' ? 48 : 0, flex: 1 }}>
      <Text>CONVERSATION</Text>
    </View>
  )
}

