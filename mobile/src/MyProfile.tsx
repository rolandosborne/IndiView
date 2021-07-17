import 'react-native-gesture-handler';
import React, { useEffect, forwardRef, useRef, useImperativeHandle } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Modal, Alert, Animated, Dimensions, Platform, Clipboard, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, TextInput, Image, FlatList, Button, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View, ImageBackground, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import OptionsMenu from "react-native-option-menu";
import { useNavigation } from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';

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
  const [mode, setMode] = React.useState(null);
  const [text, setText] = React.useState(null);

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
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#222222' }}>{ identity.name }</Text>
          &nbsp;&nbsp;
          <Icon name="edit" style={{ color: '#0077CC', fontSize: 18 }} />
        </Text>
      )
    }
    else {
      return (
        <Text>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#aaaaaa' }}>Name</Text>
          &nbsp;&nbsp;
          <Icon name="edit" style={{ color: '#0077CC', fontSize: 18 }} />
        </Text>
      );
    }
  }

  const MyLocation = () => {
    if(identity.location != null) {
      return (
        <Text style={{ marginTop: 15 }}>
          <Text style={{ color: '#222222' }}>{ identity.location }</Text>
          &nbsp;&nbsp;
          <Icon name="edit" style={{ color: '#0077CC', fontSize: 16 }} />
        </Text>
      );
    }
    else {
      return (
        <Text style={{ marginTop: 15 }}>
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
        <Text style={{ marginTop: 14 }}>
          <Text style={{ textAlign: 'center', fontSize: 12, marginLeft: 8, marginRight: 8, color: '#222222' }}>{ identity.description }</Text>
          &nbsp;&nbsp;
          <Icon name="edit" style={{ color: '#0077CC', fontSize: 12 }} />
        </Text>
      );
    }
    else {
      return (
        <Text style={{ marginTop: 14 }}>
          <Text style={{ color: '#aaaaaa', fontSize: 12 }}>Description</Text>
          &nbsp;&nbsp;
          <Icon name="edit" style={{ color: '#0077CC', fontSize: 12 }} />
        </Text>
      );
    }
  }

  const onImage = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
      cropperCircleOverlay: true,
      includeBase64: true
    }).then(async image => {
      console.log(image);
      try {
        await diatum.setProfileImage(image.data);
      }
      catch(err) {
        console.log(err);
        Alert.alert("failed to set profile image");
      }
    });
  };

  const onName = () => {
    setMode('name');
    setText(identity.name);
  }

  const onLocation = () => {
    setMode('location');
    setText(identity.location);
  }

  const onDescription = () => {
    setMode('description');
    setText(identity.description);
  }

  const onSave = async (value: string) => {
    try {
      if(mode == 'name') {
        await diatum.setProfileName(value);
      }
      else if(mode == 'location') {
        await diatum.setProfileLocation(value);
      }
      else if(mode == 'description') {
        await diatum.setProfileDescription(value);
      }
      else {
        throw new Error("unknown profile mode");
      }
    }
    catch(err) {
      console.log(err);
      Alert.alert("failed to set profile " + mode);
    }
    setMode(null);
  }

  const onClosed = () => {
    setMode(null);
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#aaaaaa', alignItems: 'center' }}>
      <Text style={{ marginTop: 16, color: '#ffffff', fontWeight: 'bold' }}>My Profile</Text>
      <View style={{ flexDirection: 'row', paddingLeft: 12, paddingTop: 12, paddingBottom: 12, marginLeft: 16, marginRight: 16, borderRadius: 8, backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#00bb88' }}>
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

      <PromptText mode={mode} value={text} saved={onSave} closed={onClosed} />
    </View>
  );
}

function PromptText({ mode, value, saved, closed }) {
  const [text, setText] = React.useState(null);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [header, setHeader] = React.useState('');
  const [align, setAlign] = React.useState('center');
  const [height, setHeight] = React.useState(0);
  const [multiline, setMultiline] = React.useState(false);

  useEffect(() => {
    if(mode != null) {
      if(mode == 'name') {
        setHeader('Profile Name');
        setAlign('center');
        setHeight('auto');
        setMultiline(false);
      }
      if(mode == 'location') {
        setHeader('Profile Location');
        setAlign('center');
        setHeight('auto');
        setMultiline(false);
      }
      if(mode == 'description') {
        setHeader('Profile Description');
        setAlign('left');
        setHeight(96);
        setMultiline(true);
      }
      setModalVisible(true);
    }
    setText(value);
  }, [mode, value]);

  const onSave = () => {
    setModalVisible(false);
    saved(text);
  };

  const onCancel = () => {
    setModalVisible(false);
    closed();
  };

  const onReset = () => {
    setText(null);
  }

  return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={onCancel}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: 'rgba(52, 52, 52, 0.8)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ padding: 16, width: '80%', borderRadius: 4, backgroundColor: '#ffffff' }}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ flex: 2, fontSize: 15, fontWeight: 'bold', color: '#444444' }}>{ header }</Text>
              <View style={{ flex: 1, alignItems: 'flex-end', paddingRight: 4 }}>
                <TouchableOpacity style={{ alignItems: 'flex-end' }} onPress={onReset}>
                  <Text style={{ fontSize: 12, color: '#222222' }}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TextInput multiline={multiline} style={{ textAlign: align, padding: 8, marginTop: 8, marginBottom: 8, borderRadius: 8, width: '100%', minHeight: height, backgroundColor: '#eeeeee' }} value={text} onChangeText={setText} />
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }}>
                <TouchableOpacity style={{ alignItems: 'center' }} onPress={onSave}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0077CC' }}>Save</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1 }}>
                <TouchableOpacity style={{ alignItems: 'center' }} onPress={onCancel}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#888888' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
  );
}





















    
