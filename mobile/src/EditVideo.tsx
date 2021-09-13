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
import Video from 'react-native-video';

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

export function EditVideo({ route, navigation }) {
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
              <EditVideoPage navigation={navigation} subject={route.params} />
            </View>
          )
        }}</LabelDrawer.Screen>
      </LabelDrawer.Navigator>
    </View>
  )
}

function EditVideoPage({navigation, subject}) {
  const [placeholder, setPlaceholder ] = React.useState(require('../assets/placeholder.png'));
  const [options, setOptions] = React.useState(['Open Gallery', 'Open Camera', 'Close Menu' ]);
  const [actions, setActions] = React.useState([ () => onGallery(0), () => onCamera(0) ]);
  const [location, setLocation] = React.useState(null);
  const [description, setDescription] = React.useState(null);
  const [mode, setMode] = React.useState(null);
  const [text, setText] = React.useState(null);
  const [color, setColor] = React.useState('#888888');
  const [thumb, setThumb] = React.useState(null);
  const [video, setVideo] = React.useState(null);

  let pos = React.useRef(0);
  let duration = React.useRef(0);
  let player = React.useRef(null);
  let record = React.useRef({});
  let data = React.useRef({ location: null, description: null });
  let remote = React.useRef(null);
  let path = React.useRef(null);

  const plus = (<Icon name="plus-square-o" style={{ color: '#0077CC', fontSize: 28, width: 48, textAlign: 'center' }} />);

  let diatum = useDiatum();

  const onShare = () => {
    onUpload(subject.subjectId);
    navigation.goBack();
  }

  const onUpload = async (subjectId) => {
    try {
      if(path.current != null) {
        let formdata = new FormData();
	if(path.current.startsWith("file://")) {
	  formdata.append("file", {uri: path.current, name: 'asset', type: 'application/octent-stream'});
	}
	else {
	  formdata.append("file", {uri: 'file://' + path.current, name: 'asset', type: 'application/octent-stream'});
	}
        let vid = await fetch(record.current.upload(['V01', 'V03', 'V04', 'F01-' + pos.current]), { method: 'post', headers: { 'Content-Type': 'multipart/form-data' }, body: formdata });
        if(vid.status >= 400 && vid.status < 600) {
          throw new Error(vid.url + " failed");
        }
        let asset = await vid.json();
        remote.current = {};
        for(let i = 0; i < asset.assets.length; i++) {
          if(asset.assets[i].transform == 'V01') {
            remote.current.standard = asset.assets[i].assetId;
          }
          if(asset.assets[i].transform == 'V03') {
            remote.current.high = asset.assets[i].assetId;
          }
          if(asset.assets[i].transform == 'V04') {
            remote.current.low = asset.assets[i].assetId;
          }
          if(asset.assets[i].transform == 'F01-' + pos.current) {
            remote.current.thumb = asset.assets[i].assetId;
          }
        }
      }
      data.current.thumb = remote.current.thumb;
      data.current.low = remote.current.low;
      data.current.high = remote.current.high;
      data.current.standard = remote.current.standard;
      await diatum.setSubjectData(subjectId, SubjectUtil.VIDEO, JSON.stringify(data.current));
      await diatum.setSubjectShare(subjectId, true);
    }
    catch(err) {
      console.log(err);
      Alert.alert("failed to post video");
    }
  }

  useEffect(async () => {
    try {
      record.current = await diatum.getSubject(subject.subjectId);
      if(record.current.data != null && record.current.share) {
        data.current = JSON.parse(record.current.data);
        setLocation(data.current.location);
        setDescription(data.current.description);
        if(record.current.ready && data.current.thumb != null && data.current.standard != null && 
            data.current.low != null && data.current.high != null) {
          remote.current = { thumb: data.current.thumb, high: data.current.high, standard: data.current.standard, low: data.current.low };
          setThumb(record.current.asset(data.current.thumb));
        }
      }
    }
    catch(err) {
      console.log(err);
    }
  }, []);

  React.useLayoutEffect(() => {
    if(video == null && thumb == null) {
      navigation.setOptions({
        headerRight: () => <OptionsMenu customButton={plus} options={options} actions={actions} />
      });
    }
    else {
      navigation.setOptions({
        headerRight: () => <Icon name="upload" style={{ color: color, fontSize: 24, width: 48, textAlign: 'center' }} onPress={onShare} />
      });
    }
  }, [color, navigation, video, thumb]);

  let latch: Latch = useLatch();
  const onLatch = () => {
    profileNav.toggleDrawer();
  };

  const onGallery = async (idx: number) => {
    try {
      let vid = await ImagePicker.openPicker({ mediaType: 'video' });
      setThumb(null);
      setVideo(vid.path);
      path.current = vid.path;
      setColor('#0077CC');
    }
    catch(err) {
      console.log(err);
    }
  }

  const onCamera = async (idx: number) => {
    try {
      let vid = await ImagePicker.openCamera({ mediaType: 'video' });
      setThumb(null);
      setVideo(vid.path);
      path.current = vid.path;
      setColor('#0077CC');
    }
    catch(err) {
      console.log(err);
    }
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

  const onEnd = () => {
    console.log("VIDEO END");
  }

  const onError = () => {
    console.log("VIDEO ERROR");
  }

  const Thumb = () => {
    if(thumb == null) {
      return (<></>);
    }
    return (        
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <Image style={{ resizeMode: 'contain', margin: 8, flex: 1, borderColor: '#dddddd', borderWidth: 2, borderRadius: 8, aspectRatio: 1 }} source={{ uri: thumb }} />
      </View>
    );
  }

  const onRemove = () => {
    setVideo(null);
  }

  const onLoad = (params) => {
    duration.current = params.duration;
    player.current.seek(0);
  }

  const onLeft = () => {
    if(pos.current > 0) {
      pos.current -= 1;
    }
    player.current.seek(pos.current);
  }

  const onRight = () => {
    if(pos.current < duration.current) {
      pos.current += 1;
    }    
    player.current.seek(pos.current);
  }

  const Select = () => {
    if(video == null) {
      return (<></>);
    }
    return (
      <View style={{ flex: 1, padding: 8, alignItems: 'center', justifyContent: 'center', aspectRatio: 1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%', backgroundColor: '#000000' }}>
          <Video source={{uri: video}} ref={(ref) => { player.current = ref }} onLoad={onLoad} onEnd={onEnd} onError={onError} resizeMode="contain"
              muted={true} paused={true} style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, alignSelf: 'center' }} />
          <TouchableOpacity style={{ position: 'absolute', backgroundColor: '#ffffff', left: 0, padding: 8, borderRadius: 8, margin: 16 }} onPress={onLeft}>
            <Icon name="chevron-left" style={{ color: '#0077CC', fontSize: 24 }} />
          </TouchableOpacity>
          <TouchableOpacity style={{ position: 'absolute', backgroundColor: '#ffffff', bottom: 0, padding: 8, borderRadius: 8, margin: 16 }} onPress={onRemove}>
            <Icon name="trash-o" style={{ color: '#0077CC', fontSize: 24 }} />
          </TouchableOpacity>
          <TouchableOpacity style={{ position: 'absolute', backgroundColor: '#ffffff', right: 0, padding: 8, borderRadius: 8, margin: 16 }} onPress={onRight}>
            <Icon name="chevron-right" style={{ color: '#0077CC', fontSize: 24 }} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const Placeholder = () => {
    if(video == null && thumb == null) {
      return (        
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <Image style={{ resizeMode: 'contain', margin: 8, flex: 1, borderColor: '#dddddd', borderWidth: 2, borderRadius: 8, aspectRatio: 1 }} source={placeholder} />
        </View>
      );
    }
    return (<></>);
  }  

  return (
    <View style={{ flex: 1}}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Select />
        <Thumb />
        <Placeholder />
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <TouchableOpacity onPress={onLocation}><Location /></TouchableOpacity>
        <TouchableOpacity onPress={onDescription}><Description /></TouchableOpacity>
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

