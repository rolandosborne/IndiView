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
import ImagePicker from 'react-native-image-crop-picker';

import { Latch, useLatch } from './LatchContext';
import { AppSupport, useApp } from './AppSupport';
import { Diatum, DiatumEvent } from '../diatum/Diatum';
import { LabelEntry } from '../diatum/DiatumTypes';
import { DiatumProvider, useDiatum } from "../diatum/DiatumContext";
import { SubjectUtil } from "./SubjectUtil";

const LabelDrawer = createDrawerNavigator();
let labelNav = null;

function LabelDrawerContent(props) {
  labelNav = props.navigation;
  const [labels, setLabels] = React.useState([]);
  const [refresh, setRefresh] = React.useState(null);
  let labelSet = React.useRef(new Set<string>());

  let diatum: Diatum = useDiatum();

  const updateSubject = async (objectId: string) => {
    if(objectId == props.subject.subjectId) {
      try {
        let l = await diatum.getSubjectLabels(props.subject.subjectId);
     
        // generate new set
        let set = new Set<string>();
        for(let i = 0; i < l.length; i++) {
          set.add(l[i]);
        }
        labelSet.current = set;
        props.label(set.size != 0);
        setRefresh(JSON.parse('{}'));
      }
      catch(err) {
        console.log(err);
      }
    }
  }

  const updateList = async () => {
    try {
      let l = await diatum.getLabels();
      setLabels(l);
    }
    catch(err) {
      console.log(err);
    }
  };

  useEffect(() => {
    diatum.setListener(DiatumEvent.Labels, updateList);
    diatum.setListener(DiatumEvent.Subjects, updateSubject);
    updateSubject(props.subject.subjectId);
    return () => {
      diatum.clearListener(DiatumEvent.Labels, updateList);
      diatum.clearListener(DiatumEvent.Subjects, updateSubject);
    }
  }, []);

  const setLabel = async (id: string) => {
    try {
      await diatum.setSubjectLabel(props.subject.subjectId, id);
    }
    catch(err) {
      console.log(err);
      Alert.alert("failed to set label");
    }
  }

  const clearLabel = async (id: string) => {
    try {
      await diatum.clearSubjectLabel(props.subject.subjectId, id);
    }
    catch(err) {
      console.log(err);
      Alert.alert("failed to clear label");
    }
  }

  const hasLabel = (id: string) => {
    return labelSet.current.has(id);
  }

  return (
      <View>
        <View style={{ width: '100%', backgroundColor: '#282827', alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
          <Icon name="tag" style={{ marginLeft: 16, fontSize: 18, color: '#ffffff' }} />
          <DrawerItem style={{ flex: 1 }} labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#ffffff', backgroundColor: '#282827', textAlign: 'left' }} label={'Assigned Labels'} />
        </View>
        <FlatList data={labels} extraData={refresh} keyExtractor={item => item.labelId} renderItem={({item,index}) => {
          if(hasLabel(item.labelId)) {
            return <DrawerItem labelStyle={{ fontSize: 18, color: '#0072CC' }} label={item.name} onPress={() => {clearLabel(item.labelId);} } />
          }
          else {
            return <DrawerItem labelStyle={{ fontSize: 18, color: '#282827' }} label={item.name} onPress={() => {setLabel(item.labelId);} } />
          }
        }} />
      </View>
  );
}

export function EditPhoto({ route, navigation }) {
  const [subjectLabels, setSubjectLabels] = React.useState([]);
  const [latchColor, setLatchColor] = React.useState('#282827');

  let latch: Latch = useLatch();
  const onLatch = () => {
    labelNav.toggleDrawer();
  };

  useEffect(() => {
    const unfocus = navigation.addListener('focus', () => {
      labelNav.closeDrawer();
      latch.setToggleListener(onLatch, latchColor);
    });
    return (() => {
      latch.clearToggleListener(onLatch);
      unfocus();
    })
  }, []);

  const onLabel = (set: boolean) => {
    if(set) {
      setLatchColor('#0077CC');
      latch.setColor('#0077CC');
    }
    else {
      setLatchColor('#282827');
      latch.setColor('#282827');
    }
  };

  return (
    <View style={{ flex: 1 }} >
      <LabelDrawer.Navigator navigationOptions={{title: 'ro'}} drawerPosition={'right'} drawerContent={(props) => <LabelDrawerContent {...props} {...{label: onLabel, subject: route.params}} />}>
        <LabelDrawer.Screen name="Subject">{(props) => {
          return (
            <View style={{ flex: 1 }}>
              <EditPhotoPage navigation={navigation} subject={route.params} />
            </View>
          )
        }}</LabelDrawer.Screen>
      </LabelDrawer.Navigator>
    </View>
  )
}

function EditPhotoPage({navigation, subject}) {
  const [placeholder, setPlaceholder ] = React.useState(require('../assets/placeholder.png'));
  const [selected, setSelected] = React.useState(null);
  const [gallery, setGallery] = React.useState([]);
  const [options, setOptions] = React.useState(['Open Gallery', 'Open Camera', 'Close Menu' ]);
  const [actions, setActions] = React.useState([ () => onGallery(0), () => onCamera(0) ]);
  const [location, setLocation] = React.useState(null);
  const [description, setDescription] = React.useState(null);
  const [mode, setMode] = React.useState(null);
  const [text, setText] = React.useState(null);
  const [color, setColor] = React.useState('#888888');

  let record = React.useRef({});
  let images = React.useRef([]);
  let data = React.useRef({ location: null, description: null, images: []});
  let listRef = React.useRef(null);

  const plus = (<Icon name="plus-square-o" style={{ color: '#0077CC', fontSize: 28, width: 48, textAlign: 'center' }} />);

  let diatum = useDiatum();

  const onShare = () => {
    onUpload(subject.subjectId);
    navigation.goBack();
  }

  const onUpload = async (subjectId) => {
    try {
      let img = [];
      for(let i = 0; i < images.current.length; i++) {

        if(images.current[i].local) {
          // upload thumb image
          let thumbdata = new FormData();
          thumbdata.append("file", {uri: 'file://' + images.current[i].thumb, name: 'asset', type: 'application/octent-stream'});
          let thumb = await fetch(record.current.upload(['P04']), { method: 'post', headers: { 'Content-Type': 'multipart/form-data' }, body: thumbdata });
          if(thumb.status >= 400 && thumb.status < 600) {
            throw new Error(thumb.url + " failed");
          }
          let thumbasset = await thumb.json();

          // upload full image
          let fulldata = new FormData();
          fulldata.append("file", {uri: 'file://' + images.current[i].full, name: 'asset', type: 'application/octent-stream'});
          let full = await fetch(record.current.upload(['P01']), { method: 'post', headers: { 'Content-Type': 'multipart/form-data' }, body: fulldata });
          if(full.status >= 400 && full.status < 600) {
            throw new Error(full.url + " failed");
          }
          let fullasset = await full.json();
       
          // append gallery entry 
          img.push({ thumb: thumbasset.assets[0].assetId, full: fullasset.assets[0].assetId }); 
        }
        else {
          img.push({ thumb: images.current[i].thumb, full: images.current[i].full });
        }    
      }
      data.current.images = img;
      await diatum.setSubjectData(subjectId, SubjectUtil.PHOTO, JSON.stringify(data.current));
      await diatum.setSubjectShare(subjectId, true);
    }
    catch(err) {
      console.log(err);
      Alert.alert("error posting photo");
    }
  }

  useEffect(async () => {
    try {
      record.current = await diatum.getSubject(subject.subjectId);
      if(record.current.data != null && record.current.share) {
        data.current = JSON.parse(record.current.data);
        setLocation(data.current.location);
        setDescription(data.current.description);
        if(record.current.ready) {
          if(data.current.images != null) {
            for(let i = 0; i < data.current.images.length; i++) {
              images.current.push({ local: false, uri: record.current.asset(data.current.images[i].thumb), thumb: data.current.images[i].thumb, full: data.current.images[i].full });
            }
            setGallery(images.current);
            setSelected(JSON.parse('{}'));
          }
        }
      }
      console.log(record.current);
    }
    catch(err) {
      console.log(err);
    }
  }, []);

  React.useLayoutEffect(() => {
    if(images.current.length == 0) {
      navigation.setOptions({
        headerRight: () => <OptionsMenu customButton={plus} options={options} actions={actions} />
      });
    }
    else {
      navigation.setOptions({
        headerRight: () => <Icon name="upload" style={{ color: color, fontSize: 24, width: 48, textAlign: 'center' }} onPress={onShare} />
      });
    }
  }, [color, navigation, selected]);

  let latch: Latch = useLatch();
  const onLatch = () => {
    profileNav.toggleDrawer();
  };

  const onRemove = (idx: number) => {
    setColor('#0077CC');
    images.current.splice(idx, 1);
    setGallery(images.current);
    setSelected(JSON.parse('{}'));
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
      let full = await ImagePicker.openPicker({ mediaType: 'photo', width: 512, height: 512 });
      let crop = await ImagePicker.openCropper({ path: full.path, width: 512, height: 512, cropperCircleOverlay: true });
      images.current.splice(idx, 0, { local: true, uri: 'file://' + crop.path, full: full.path, thumb: crop.path });
      setGallery(images.current);
      setColor('#0077CC');
      setSelected(JSON.parse('{}'));
      setTimeout(() => { listRef.current.scrollToIndex({ animated: true, index: idx }) }, 100);
    }
    catch(err) {
      console.log(err);
    }
  }

  const onCamera = async (idx: number) => {
    try {
      let full = await ImagePicker.openCamera({ mediaType: 'photo', width: 512, height: 512 });
      let crop = await ImagePicker.openCropper({ path: full.path, width: 512, height: 512, cropperCircleOverlay: true });
      images.current.splice(idx, 0, { local: true, uri: 'file://' + crop.path, full: full.path, thumb: crop.path });
      setGallery(images.current);
      setColor('#0077CC');
      setSelected(JSON.parse('{}'));
      setTimeout(() => { listRef.current.scrollToIndex({ animated: true, index: idx }) }, 100);
    }
    catch(err) {
      console.log(err);
    }
  }

  const Gallery = () => {
    if(!record.current.ready) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <Image style={{ resizeMode: 'contain', margin: 8, flex: 1, borderColor: '#dddddd', borderWidth: 2, borderRadius: 8, aspectRatio: 1 }} source={placeholder} />
          <View style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center' }}>
            <Icon name="refresh" style={{ color: '#FFFFFF', fontSize: 32 }} />
          </View>
          <View style={{ position: 'absolute', bottom: 0, alignItems: 'center' }}>
            <TouchableOpacity style={{ backgroundColor: '#ffffff', padding: 8, borderRadius: 8, margin: 16 }} onPress={onRemove}>
              <Icon name="trash-o" style={{ color: '#0077CC', fontSize: 24 }} />
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    else if(gallery.length == 0) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <Image style={{ resizeMode: 'contain', margin: 8, flex: 1, borderColor: '#dddddd', borderWidth: 2, borderRadius: 8, aspectRatio: 1 }} source={placeholder} />
        </View>
      );
    }
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <FlatList style={{ paddingTop: 16 }} ref={ref => { listRef.current = ref }} data={gallery} extraData={selected} horizontal={true} keyExtractor={item => item.uri} renderItem={({item, index}) => <PhotoEntry item={item} index={index} remove={onRemove} camera={onCamera} gallery={onGallery} />} />
      </View>
    );
  }

  const Location = () => {
    if(location != null) {
      return (
        <Text style={{ marginTop: 16 }}>
          <Text style={{ color: '#222222', fontSize: 20 }}>{ location }</Text>
          &nbsp;&nbsp;
          <Icon name="edit" style={{ color: '#0077CC', fontSize: 16 }} />
        </Text>
      );
    }
    else {
      return (
        <Text style={{ marginTop: 15 }}>
          <Text style={{ color: '#aaaaaa', fontSize: 20 }}>Location</Text>
          &nbsp;&nbsp;
          <Icon name="edit" style={{ color: '#0077CC', fontSize: 16 }} />
        </Text>
      );
    }
  }

  const Description = () => {
    if(description != null) {
      return (
        <Text style={{ marginTop: 32, textAlign: 'center' }}>
          <Text style={{ color: '#222222', fontSize: 18 }}>{ description }</Text>
          &nbsp;&nbsp;
          <Icon name="edit" style={{ color: '#0077CC', fontSize: 16 }} />
        </Text>
      );
    }
    else {
      return (
        <Text style={{ marginTop: 32, textAlign: 'center' }}>
          <Text style={{ color: '#aaaaaa', fontSize: 20 }}>Description</Text>
          &nbsp;&nbsp;
          <Icon name="edit" style={{ color: '#0077CC', fontSize: 16 }} />
        </Text>
      );
    }
  }

  const onLocation = () => {
    setMode('location');
    setText(location);
  }

  const onDescription = () => {
    setMode('description');
    setText(description);
  }

  const onSave = (value: string) => {
    setColor('#0077CC');
    if(mode == 'location') {
      setLocation(value);
      data.current.location = value;
    }
    if(mode == 'description') {
      setDescription(value);
      data.current.description = value;
    }
    setMode(null);
  }

  const onClosed = () => {
    setMode(null);
  }

  if(gallery.length == 0) {
    return (
      <View style={{ flex: 1}}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <Image style={{ resizeMode: 'contain', margin: 8, flex: 1, borderColor: '#dddddd', borderWidth: 2, borderRadius: 8, aspectRatio: 1 }} source={placeholder} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <TouchableOpacity onPress={onLocation}><Location /></TouchableOpacity>
          <TouchableOpacity onPress={onDescription}><Description /></TouchableOpacity>
        </View>
        <PromptText mode={mode} value={text} saved={onSave} closed={onClosed} />
      </View>
    );
  }
  
  return (
    <View style={{ flex: 1}}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <FlatList style={{ paddingTop: 16 }} ref={ref => { listRef.current = ref }} data={gallery} extraData={selected} horizontal={true} keyExtractor={item => item.uri} renderItem={({item, index}) => <PhotoEntry item={item} index={index} remove={onRemove} camera={onCamera} gallery={onGallery} />} />
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <TouchableOpacity onPress={onLocation}><Location /></TouchableOpacity>
        <TouchableOpacity onPress={onDescription}><Description /></TouchableOpacity>
      </View>
      <PromptText mode={mode} value={text} saved={onSave} closed={onClosed} />
    </View>
  );
}

function PhotoEntry({item, index, remove, camera, gallery}) {
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
      <Image style={{ resizeMode: 'contain', margin: 8, flex: 1, borderColor: '#dddddd', borderWidth: 2, borderRadius: 8, aspectRatio: 1 }} source={{ uri: item.uri }} />
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


function PromptText({ mode, value, saved, closed }) {
  const [text, setText] = React.useState(null);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [header, setHeader] = React.useState('');
  const [align, setAlign] = React.useState('center');
  const [height, setHeight] = React.useState(0);
  const [multiline, setMultiline] = React.useState(false);

  useEffect(() => {
    if(mode != null) {
      if(mode == 'location') {
        setHeader('Location');
        setAlign('center');
        setHeight('auto');
        setMultiline(false);
      }
      if(mode == 'description') {
        setHeader('Description');
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
            <TextInput multiline={multiline} style={{ textAlign: align, padding: 8, marginTop: 8, marginBottom: 8, borderRadius: 8, width: '100%', minHeight: height, backgroundColor: '#eeeeee', textAlignVertical: 'top' }} value={text} onChangeText={setText} />
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }}>
                <TouchableOpacity style={{ alignItems: 'center' }} onPress={onSave}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0077CC' }}>OK</Text>
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

