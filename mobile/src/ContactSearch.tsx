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
import { Diatum, DiatumEvent } from '../diatum/Diatum';
import { DiatumSession, LabelEntry } from '../diatum/DiatumTypes';
import { DiatumProvider, useDiatum } from "../diatum/DiatumContext";
import { IndiViewCom } from "./IndiViewCom";
import { AppSuppport, useApp } from './AppSupport';

function Prompt({ callback }) {
  const [search, setSearch] = React.useState("");
 
  const onSearchText = (val) => {
    setSearch(val);
  }

  const onSearch = () => {
    callback(search);
  }

  const onCancel = () => {
    callback(null);
  };
 
  return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 48 }}>
        <View style={{ width: '90%', borderWidth: 1, borderColor: '#aaaaaa', backgroundColor: '#ffffff', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
          <TextInput style={{ backgroundColor: '#444444', color: '#ffffff', borderRadius: 8, textAlign: 'center', fontSize: 18, width: '80%', height: 40, margin: 16 }} autoCapitalize="none" placeholder="Profile Name or Handle" placeholderTextColor='#ffffff' onSubmitEditing={onSearch} onChangeText={onSearchText}/>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Button title="Search" onPress={onSearch} />
            <View style={{ width: 32 }} />
            <Button title="Cancel" onPress={onCancel} />
          </View>
        </View>
      </View>
  );
}

export function ContactSearch({ navigation }) {
  const [prompt, setPrompt] = React.useState(true);

  let support: AppSupport = useApp();
  
  console.log("TOKEN: " + support.getToken());

  const onSearch = (value: string) => {
    console.log("----> " + value);
    IndiViewCom.search(support.getToken(), value).then(c => {
      console.log(c);
    }).catch(err => {
      console.log(err);
    });

    setPrompt(false);
  }

  const ShowPrompt = () => {
    if(!prompt) {
      return (<></>);
    }
    return (<Prompt callback={onSearch} />);
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={onPrompt}>
          <Icon name="search" style={{ color: '#0077CC', fontSize: 18, marginRight: 24 }} />
        </TouchableOpacity>
      )
    });
  }, [navigation]);

  const onPrompt = () => {
    setPrompt(true);
  };

  return (
    <View style={{ flex: 1, width: '100%' }}>
      <ShowPrompt />
    </View>
  )
}

