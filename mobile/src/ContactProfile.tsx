import 'react-native-gesture-handler';
import React, { useEffect, forwardRef, useRef, useImperativeHandle } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Platform, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, TextInput, Image, FlatList, Button, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View, ImageBackground, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import UserAvatar from 'react-native-user-avatar';
import OptionsMenu from "react-native-option-menu";

import { Diatum, DiatumEvent } from '../diatum/Diatum';
import { AttachCode, getAttachCode } from '../diatum/DiatumUtil';
import { DiatumSession, LabelEntry } from '../diatum/DiatumTypes';
import { DiatumProvider, useDiatum } from "../diatum/DiatumContext";
import { IndiViewCom } from "./IndiViewCom";

export function ContactProfile({ route, navigation }) {
  const [name, setName] = React.useState(route.params.name);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: route.params.handle, 
      headerRight: () => (
        <Icon name="save" style={{ color: '#444444', fontSize: 24, paddingRight: 16 }} onPress={() => console.log("TAPPED")} />
      ),
    });
  }, [navigation]);


  let imgSrc = {};
  if(route.params.imageUrl == null) {
    imgSrc = require('../assets/avatar.png');
  }
  else {
    imgSrc = { uri: route.params.imageUrl, cache: 'force-cache' };
  }

  const ContactName = () => {
    if(name != null) {
      return (<Text style={{ fontSize: 20, fontWeight: 'bold', color: '#222222' }}>{ name }</Text>);
    }
    else {
      return (<Text style={{ fontSize: 20, fontWeight: 'bold', color: '#aaaaaa' }}>No Name</Text>);
    }
  }

  let latchColor = "#282827";
  let toggleLabel = () => {
    console.log("label");
  }

  let ProfileDescription = () => {
    if(route.params.description == null) {
      return (<></>);
    }
    return (
      <Text style={{ marginTop: 16, marginLeft: 8, marginRight: 8, textAlign: 'center' }}>{ route.params.description }</Text>
    );
  };

  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', padding: 12, margin: 16, borderRadius: 8, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#aaaaaa' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row' }}>
            <Image style={{ flex: 2, borderRadius: 4, aspectRatio: 1 }} source={imgSrc}/>
            <View style={{ flex: 3, alignItems: 'center', justifyContent: 'center' }}>
              <ContactName />
              <Text style={{ color: '#222222' }}>{ route.params.location }</Text>
              <ProfileDescription />
            </View>
          </View>
        </View>
      </View>
      <Text>Contact Profile</Text>
      <TouchableOpacity style={{ alignItems: 'center', position: "absolute", right: -24, top: '50%', translateY: -32, width: 48, height: 64, borderRadius: 8 }} onPress={toggleLabel}>
        <View style={{ width: 16, height: 64, backgroundColor: latchColor, borderRadius: 8 }}></View>
      </TouchableOpacity>
    </View>
  )
}

