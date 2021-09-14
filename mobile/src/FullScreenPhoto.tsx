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

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <Image style={{ flex: 1, resizeMode: 'contain' }} source={source} />
    </View>
  );
}

