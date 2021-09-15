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

export function FullScreenPhoto({ route }) {
  const [source, setSource] = React.useState(null);
  let idx = useRef(0);

  useEffect(() => {
    if(route.params.uri.length == 0) {
      setSource(require('../assets/placeholder.png'));
    }
    else {
      setSource({ uri: route.params.uri[0], cache: 'force-cache' });
    }
  }, []);

  let navigation = useNavigation();
  onLeft = () => {
    if(idx.current > 0) {
      setSource({ uri: route.params.uri[--idx.current], cache: 'force-cache' });
    }
    else {
      navigation.goBack();
    }
  }
  onRight = () => {
    if(idx.current + 1 < route.params.uri.length) {
      setSource({ uri: route.params.uri[++idx.current], cache: 'force-cache' });
    }
    else {
      navigation.goBack();
    }
  }

  Dots = () => {
    if(route.params.uri.length > 1) {
      let dot = [];
      for(let i = 0; i < route.params.uri.length; i++) {
        if(i == idx.current) {
          dot.push(<View key={i} style={{ width: 12, height: 12, backgroundColor: '#888888', margin: 6, borderRadius: 6, borderWidth: 1, borderColor: '#ffffff' }} />);
        }
        else {
          dot.push(<View key={i} style={{ width: 12, height: 12, margin: 6, borderRadius: 6, borderWidth: 1, borderColor: '#ffffff' }} />);
        }
      }
      return (
        <View style={{ position: 'absolute', bottom: '10%', width: '100%', flexDirection: 'row', justifyContent: 'center' }} >
          { dot }
        </View>
      );
    }
    return (<></>);
  }

  const Controls = () => {
    return (
      <View style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <Dots />
        <TouchableOpacity style={{ position: 'absolute', bottom: '10%', left: 0, padding: 32 }} onPress={onLeft}>
          <Icon name="arrow-circle-o-left" style={{ fontSize: 32, color: '#ffffff' }} />
        </TouchableOpacity>
        <TouchableOpacity style={{ position: 'absolute', bottom: '10%', right: 0, padding: 32 }} onPress={onRight}>
          <Icon name="arrow-circle-o-right" style={{ fontSize: 32, color: '#ffffff' }} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000000', width: '100%', height: '100%' }}>
      <Image style={{ flex: 1, resizeMode: 'contain' }} source={source} />
      <Controls /> 
    </View>
  );
}

