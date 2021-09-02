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
  
  const onCheck = (set: boolean) => {
    console.log("CHECK");
  }

  return (
    <View style={{ padding: 16, alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Icon name="check-square" style={{ fontSize: 24, color: '#0072CC' }} onPress={onCheck(false)} />
        <Text style={{ fontSize: 16, color: '#444444', paddingLeft: 16, paddingRight: 16 }}>Searchable</Text>
      </View>
      <Text style={{ fontSize: 14, color: '#888888' }}>You are searchable within the 'Contact Search' page</Text>
    </View>
  );
}

