import 'react-native-gesture-handler';
import React, { useEffect, forwardRef, useRef, useImperativeHandle } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Animated, Dimensions, Platform, Clipboard, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, TextInput, Image, FlatList, Button, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View, ImageBackground, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import OptionsMenu from "react-native-option-menu";
import { useNavigation } from '@react-navigation/native';

import { Latch, useLatch } from './LatchContext';
import { Diatum, DiatumEvent } from '../diatum/Diatum';
import { AttachCode, getAttachCode } from '../diatum/DiatumUtil';
import { DiatumSession, LabelEntry, Attribute } from '../diatum/DiatumTypes';
import { DiatumProvider, useDiatum } from "../diatum/DiatumContext";
import { IndiViewCom } from "./IndiViewCom";
import { AttributeUtil } from './AttributeUtil';

const ProfileDrawer = createDrawerNavigator();
let profileNav = null;

export class ProfileView {
  amigoId: string;
  name: string;
  handle: string;
  imageUrl: string;
  location: string;
  description: string;
  saved: ProfileSavedView;
}

function ProfileDrawerContent(props) {
  profileNav = props.navigation;
  const [labelId, setLabelId] = React.useState(null);
  const [labels, setLabels] = React.useState(props.labels);

  let diatum: Diatum = useDiatum();
  const updateList = () => {
    diatum.getLabels().then(l => {
      setLabels(l);
    }).catch(err => {
      console.log(err);
    });
  };

  useEffect(() => {
    diatum.setListener(DiatumEvent.Labels, updateList);
    return () => {
      diatum.clearListener(DiatumEvent.Labels, updateList);
    }
  }, []);

  const setLabel = async (id: string) => {
    setLabelId(id);
    props.callback(id);
  }

  const clearLabel = async (id: string) => {
    setLabelId(null);
    props.callback(null);
  }

  return (
      <View>
        <DrawerItem labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#000000' }} label={'View as Label'} />
        <FlatList data={labels} keyExtractor={item => item.labelId} renderItem={({item,index}) => {
          if(labelId == item.labelId) {
            return <DrawerItem labelStyle={{ fontSize: 18, color: '#0072CC' }} label={item.name} onPress={() => {clearLabel(item.labelId);} } />
          }
          else {
            return <DrawerItem labelStyle={{ fontSize: 18, color: '#282827' }} label={item.name} onPress={() => {setLabel(item.labelId);} } />
          }
        }} />
      </View>
  );
}

export function MyProfile({ route, navigation }) {

  const latchColor = useRef('#282827');

  let latch: Latch = useLatch();
  const onLatch = () => {
    profileNav.toggleDrawer();
  };  

  useEffect(() => {
    const unfocus = navigation.addListener('focus', () => {
      profileNav.closeDrawer();
      latch.setToggleListener(onLatch, latchColor.current); 
    });
    return (() => {
      latch.clearToggleListener(onLatch);
      unfocus();
    }) 
  }, []);
 
  const onLabel = (label: string) => {
    if(label == null) {
      latchColor.current = '#282827';
      latch.setColor(latchColor.current);
    }
    else {
      latchColor.current = '#0077CC';
      latch.setColor(latchColor.current);
    }
  };

  return (
    <View style={{ flex: 1 }} >
      <ProfileDrawer.Navigator navigationOptions={{title: 'ro'}} drawerPosition={'right'} drawerContent={(props) => <ProfileDrawerContent {...props} {...{callback: onLabel}} />}>
        <ProfileDrawer.Screen name="Contacts">{(props) => {
          return (
            <View style={{ flex: 1 }}>
              <MyProfilePage navigation={navigation} />
            </View>
          )
        }}</ProfileDrawer.Screen>
      </ProfileDrawer.Navigator>
    </View>
  )
}

function MyProfilePage({ navigation }) {

  const [identity, setIdentity] = React.useState({});

  React.useLayoutEffect(() => {
    navigation.setOptions({ title: identity.handle });
  }, [navigation, identity]);

  let diatum: Diatum = useDiatum();
  const updateIdentity = () => {
    diatum.getIdentity().then(i => {
      setIdentity(i);
    }).catch(err => {
      console.log(err);
    });
  };

  useEffect(() => {
    diatum.setListener(DiatumEvent.Identity, updateIdentity);
    return () => {
      diatum.clearListener(DiatumEvent.Identity, updateIdentity);
    }
  }, []);

  const MyImage = () => {
    if(identity.imageUrl == null) {
      return (
        <ImageBackground style={{ aspectRatio: 1 }} source={ require('../assets/avatar.png') }>
          <View opacity={0.8} style={{ position: 'absolute', bottom: 4, right: 4, padding: 4, borderRadius: 4, backgroundColor: '#ffffff' }}>
            <Icon name="edit" style={{ color: '#0077CC', fontSize: 22 }} />
          </View>
        </ImageBackground>
      );
    }
    return (
      <ImageBackground style={{ aspectRatio: 1 }} source={{ uri: identity.imageUrl, cache: 'force-cache' }}>
        <View opacity={0.8} style={{ position: 'absolute', bottom: 4, right: 4, padding: 4, borderRadius: 4, backgroundColor: '#ffffff' }}>
          <Icon name="edit" style={{ color: '#0077CC', fontSize: 22 }} />
        </View>
      </ImageBackground>
    );
  };

  const MyName = () => {
    if(identity.name != null) {
      return (
        <Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#222222' }}>{ identity.name }</Text>
          &nbsp;&nbsp;
          <Icon name="edit" style={{ color: '#0077CC', fontSize: 18 }} />
        </Text>
      )
    }
    else {
      return (
        <Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#aaaaaa' }}>Name</Text>
          &nbsp;&nbsp;
          <Icon name="edit" style={{ color: '#0077CC', fontSize: 18 }} />
        </Text>
      );
    }
  }

  const MyLocation = () => {
    if(identity.location != null) {
      return (
        <Text style={{ marginTop: 16 }}>
          <Text style={{ color: '#222222' }}>{ identity.location }</Text>
          &nbsp;&nbsp;
          <Icon name="edit" style={{ color: '#0077CC', fontSize: 16 }} />
        </Text>
      );
    }
    else {
      return (
        <Text style={{ marginTop: 16 }}>
          <Text style={{ color: '#aaaaaa' }}>Location</Text>
          &nbsp;&nbsp;
          <Icon name="edit" style={{ color: '#0077CC', fontSize: 16 }} />
        </Text>
      );
    }
  }

  const MyDescription = () => {
    if(identity.description != null) {
      return (
        <Text style={{ marginTop: 16 }}>
          <Text style={{ textAlign: 'center', fontSize: 16, marginLeft: 8, marginRight: 8, color: '#222222' }}>{ identity.description }</Text>
          &nbsp;&nbsp;
          <Icon name="edit" style={{ color: '#0077CC', fontSize: 16 }} />
        </Text>
      );
    }
    else {
      return (
        <Text style={{ marginTop: 16 }}>
          <Text style={{ color: '#aaaaaa', fontSize: 16 }}>Description</Text>
          &nbsp;&nbsp;
          <Icon name="edit" style={{ color: '#0077CC', fontSize: 16 }} />
        </Text>
      );
    }
  }

  const onImage = () => {
    console.log("ON IMAGE");
  };

  const onName = () => {
    console.log("ON NAME");
  }

  const onLocation = () => {
    console.log("ON LOCATION");
  }

  const onDescription = () => {
    console.log("ON DESCRIPTION");
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#aaaaaa', alignItems: 'center' }}>
      <Text style={{ marginTop: 16, color: '#ffffff', fontWeight: 'bold' }}>My Profile</Text>
      <View style={{ flexDirection: 'row', padding: 12, marginLeft: 16, marginRight: 16, borderRadius: 8, backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#00bb88' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={{ flex: 2, maxWidth: 256 }} onPress={onImage}><MyImage /></TouchableOpacity>
            <View style={{ flex: 3, alignItems: 'center', justifyContent: 'center' }}>
              <TouchableOpacity onPress={onName}><MyName /></TouchableOpacity>
              <TouchableOpacity onPress={onLocation}><MyLocation /></TouchableOpacity>
              <TouchableOpacity onPress={onDescription}><MyDescription /></TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}




















    