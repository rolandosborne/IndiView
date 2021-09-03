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

import Modal from 'react-native-modal';
import { IndiViewCom, Contact } from "./IndiViewCom";
import { AppSuppport, useApp } from './AppSupport';

export function Settings({ navigation }) {

  const [searchable, setSearchable] = React.useState(true);  
  const [muting, setMuting] = React.useState(true);  

  const onSearch = () => {
    setSearchable(!searchable);
  };

  const onMute = () => {
    setMuting(!muting);
  }

  return (
    <View style={{ marginTop: 8 }}>
      <View style={{ margin: 16, borderBottomWidth: 1, borderColor: '#888888' }}>
        <Text>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#222222', paddingLeft: 16, paddingRight: 16 }}>Searchable:</Text>
          <Text style={{ fontSize: 14, color: '#222222' }}> allow your account to be visible in the 'Contact Search' page.</Text>
        </Text>
        <View style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ width: 64, textAlign: 'right' }}>No</Text>
          <TouchableOpacity activeOpacity={1} style={{ margin: 16, width: 48, height: 24, borderRadius: 16, backgroundColor: searchable ? '#0072CC' : '#888888', justifyContent: 'center' }} onPress={onSearch}>
            <View style={{ margin: 1, borderRadius: 16, flex: 1, aspectRatio: 1, backgroundColor: '#ffffff', alignSelf: searchable ? 'flex-end' : 'flex-start' }}></View>
          </TouchableOpacity>
          <Text style={{ width: 64, textAlign: 'left' }}>Yes</Text>
        </View>
      </View>

      <View style={{ margin: 16, borderBottomWidth: 1, borderColor: '#888888' }}>
        <Text>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#222222', paddingLeft: 16, paddingRight: 16 }}>Muting:</Text>
          <Text style={{ fontSize: 14, color: '#222222' }}> default audio state for video playback in feed.</Text>
        </Text>
        <View style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ width: 64, textAlign: 'right' }}>Mute</Text>
          <TouchableOpacity activeOpacity={1} style={{ margin: 16, width: 48, height: 24, borderRadius: 16, backgroundColor: muting ? '#888888' : '#0072CE', justifyContent: 'center' }} onPress={onMute}>
            <View style={{ margin: 1, borderRadius: 16, flex: 1, aspectRatio: 1, backgroundColor: '#ffffff', alignSelf: muting ? 'flex-start' : 'flex-end' }}></View>
          </TouchableOpacity>
          <Text style={{ width: 64, textAlign: 'left' }}>Unmute</Text>
        </View>
      </View>
    </View>
  );
}

