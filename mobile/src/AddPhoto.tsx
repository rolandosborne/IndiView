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
import { AppSupport, useApp } from './AppSupport';
import ImagePicker from 'react-native-image-crop-picker';

export function AddPhoto(props) {
  console.log("SUBJECT: ", props.route.params);
  
  const [placeholder, setPlaceholder ] = React.useState(require('../assets/placeholder.png'));
  const [selected, setSelected] = React.useState(0);
  const [gallery, setGallery] = React.useState([]);
  const [options, setOptions] = React.useState(['Open Gallery', 'Open Camera', 'Close Menu' ]);
  const [actions, setActions] = React.useState([ () => onGallery(0), () => onCamera(0) ]);
  let images = React.useRef([]);
  let listRef = React.useRef(null);
  const Plus = (<Text style={{ color: '#0077CC', fontSize: 18 }}>Add Photo</Text>);

  const onRemove = (idx: number) => {
    images.current.splice(idx, 1);
    setGallery(images.current);
    setSelected(images.current.length);
    setTimeout(() => { 
      if(listRef.current != null) {
        let val: number = images.current.length; 
        if(idx < val) {
          listRef.current.scrollToIndex({ animated: true, index: idx })
        }
        else {
          listRef.current.scrollToIndex({ animated: true, index: idx-1 })
        }
      } }, 100);
  }

  const onGallery = async (idx: number) => {
    try {
      let full = await ImagePicker.openPicker({ width: 512, height: 512 });
      let crop = await ImagePicker.openCropper({ path: full.path, width: 512, height: 512, cropperCircleOverlay: true });
      images.current.splice(idx, 0, { full: full.path, crop: crop.path });
      setGallery(images.current);
      setSelected(images.current.length);
      setTimeout(() => { listRef.current.scrollToIndex({ animated: true, index: idx }) }, 100);
    }
    catch(err) {
      console.log(err);
    }
  }

  const onCamera = async (idx: number) => {
    try {
      let full = await ImagePicker.openCamera({ width: 512, height: 512 });
      let crop = await ImagePicker.openCropper({ path: full.path, width: 512, height: 512, cropperCircleOverlay: true });
      images.current.splice(idx, 0, { full: full.path, crop: crop.path });
      setGallery(images.current);
      setSelected(images.current.length);
      setTimeout(() => { listRef.current.scrollToIndex({ animated: true, index: idx }) }, 100);
    }
    catch(err) {
      console.log(err);
    }
  }

  const Gallery = () => {
    if(gallery.length == 0) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Image style={{ resizeMode: 'contain', margin: 8, flex: 1, borderColor: '#dddddd', borderWidth: 2, borderRadius: 8, aspectRatio: 1 }} source={placeholder} />
          <View style={{ position: 'absolute', alignItems: 'center', bottom: 0, backgroundColor: '#ffffff', padding: 8, borderRadius: 8, margin: 32 }}>
            <OptionsMenu customButton={Plus} options={options} actions={actions} />
          </View>
        </View>
      );
    }
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <FlatList style={{ paddingTop: 16 }} ref={ref => { listRef.current = ref }} data={gallery} extraData={selected} horizontal={true} keyExtractor={item => item.crop} renderItem={({item, index}) => <PhotoEntry item={item} index={index} remove={onRemove} camera={onCamera} gallery={onGallery} />} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1}}>
      <Gallery style={{ flex: 1}} />
      <View style={{ flex: 1}} />
    </View>
  )
}

function PhotoEntry({item, index, remove, camera, gallery}) {
  console.log(item.crop);

  const [options, setOptions] = React.useState(['Open Gallery', 'Open Camera', 'Close Menu' ]);
  const [leftActions, setLeftActions] = React.useState([ () => gallery(index), () => camera(index) ]);
  const [rightActions, setRightActions] = React.useState([ () => gallery(index+1), () => camera(index+1) ]);
  const InsertLeft = (
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 8, borderRadius: 8, margin: 16 }}>
        <Icon name="chevron-left" style={{ color: '#0077CC', fontSize: 14 }} />
        <Icon name="plus" style={{ color: '#0077CC', fontSize: 14 }} />
      </View>
    );
  const InsertRight = (
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 8, borderRadius: 8, margin: 16 }}>
        <Icon name="plus" style={{ color: '#0077CC', fontSize: 14 }} />
        <Icon name="chevron-right" style={{ color: '#0077CC', fontSize: 14 }} />
      </View> 
    );
  const onRemove = () => {
    remove(index);
  }

  return (
    <View>
      <Image style={{ resizeMode: 'contain', margin: 8, flex: 1, borderColor: '#dddddd', borderWidth: 2, borderRadius: 8, aspectRatio: 1 }} source={{ uri: 'file://' + item.crop }} />
      <View opacity={0.8} style={{ position: 'absolute', width: '100%', bottom: 0, flexDirection: 'row', justifyContent: 'center' }}>
        <OptionsMenu customButton={InsertLeft} options={options} actions={leftActions} />
        <TouchableOpacity style={{ backgroundColor: '#ffffff', padding: 8, borderRadius: 8, margin: 16 }} onPress={onRemove}>
          <Icon name="trash-o" style={{ color: '#0077CC', fontSize: 24 }} />
        </TouchableOpacity>
        <OptionsMenu customButton={InsertRight} options={options} actions={rightActions} />
      </View>
    </View>
  );
}

