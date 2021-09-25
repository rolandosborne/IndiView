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
import LinearGradient from 'react-native-linear-gradient';

import { Latch, useLatch } from './LatchContext';
import { Diatum, DiatumEvent } from '../diatum/Diatum';
import { AttachCode, getAttachCode } from '../diatum/DiatumUtil';
import { DiatumSession, LabelEntry, Attribute } from '../diatum/DiatumTypes';
import { DiatumProvider, useDiatum } from "../diatum/DiatumContext";
import { IndiViewCom } from "./IndiViewCom";
import { SubjectUtil } from './SubjectUtil';
import { VideoPlayer } from './VideoPlayer';
import { AppSupport, useApp } from './AppSupport';

const ProfileDrawer = createDrawerNavigator();
let profileNav = null;

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
        <View style={{ width: '100%', backgroundColor: '#282827', alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
          <Icon name="tag" style={{ marginLeft: 16, fontSize: 18, color: '#ffffff' }} />
          <DrawerItem style={{ flex: 1 }} labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#ffffff', backgroundColor: '#282827', textAlign: 'left' }} label={'View as Label'} />
        </View>
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

export function MyFeed({ route, navigation }) {
  const [busy, setBusy] = React.useState(false);
  const [identity, setContact] = React.useState(route.params);
  const [labelId, setLabelId] = React.useState(null);
  const latchColor = useRef('#282827');

  let imgSrc = {};
  if(identity.imageUrl == null) {
    imgSrc = require('../assets/avatar.png');
  }
  else {
    imgSrc = { uri: identity.imageUrl, cache: 'force-cache' };
  }

  let diatum = useDiatum();
  const onPhoto = async () => {
    try {
      setBusy(true);
      let subjectId: string = await diatum.addSubject(SubjectUtil.PHOTO);
      setBusy(false);
      navigation.navigate('Post Photo', { subjectId: subjectId });
    }
    catch(err) {
      setBusy(false);
      console.log(err);
      Alert.alert("failed to create new post");
    }
  }
  const onVideo = async () => {
    try {
      setBusy(true);
      let subjectId: string = await diatum.addSubject(SubjectUtil.VIDEO);
      setBusy(false);
      navigation.navigate('Post Video', { subjectId: subjectId });
    }
    catch(err) {
      setBusy(false);
      console.log(err);
      Alert.alert("failed to create new post");
    }
  }

  React.useLayoutEffect(() => {
    let opt = [ "Post Photo", "Post Video", "Close Menu" ];
    let act = [ onPhoto, onVideo, ()=>{} ];
    const plus = (<Icon name="plus-square-o" style={{ color: '#0077CC', fontSize: 28, width: 48, textAlign: 'center' }} />);
    navigation.setOptions({
      title: <Text><Icon name="cog" style={{ fontSize: 18, color: '#444444' }} />&nbsp;&nbsp;{ identity.handle }</Text>,
      headerRight: () => (<OptionsMenu customButton={plus} options={opt} actions={act} />)
    });
  }, [navigation]);

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
    setLabelId(label);
    profileNav.closeDrawer();
  };

  const Working = () => {
    if(!busy) {
      return (<></>);
    }
    return (
      <View style={{ position: 'absolute', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ padding: 32, borderRadius: 8, backgroundColor: '#444444' }}>
          <ActivityIndicator animating={busy} size="large" color="#ffffff" /> 
        </View>
      </View>
    );
  }             

  return (
    <View style={{ flex: 1 }} >
      <ProfileDrawer.Navigator navigationOptions={{title: 'ro'}} drawerPosition={'right'} drawerContent={(props) => <ProfileDrawerContent {...props} {...{callback: onLabel}} />}>
        <ProfileDrawer.Screen name="Contacts">{(props) => {
          return (
            <View style={{ flex: 1 }}>
              <MyFeedPage navigation={navigation} handle={identity.handle} labelId={labelId} />
              <Working />
            </View>
          )
        }}</ProfileDrawer.Screen>
      </ProfileDrawer.Navigator>
    </View>
  )
}

function MyFeedPage({ navigation, handle, labelId }) {

  const [subjects, setSubjects] = React.useState([]);
  const [refresh, setRefresh] = React.useState(null);

  const label = React.useRef(labelId);

  let diatum = useDiatum();
  const updateSubjects = async (objectId: string) => {
    if(objectId == null) {
      let s = await diatum.getSubjects(label.current);
      setSubjects(s);
      setRefresh(JSON.parse('{}'));
    }
  }

  useEffect(() => {
    diatum.setListener(DiatumEvent.Subjects, updateSubjects);
    return () => {
      diatum.clearListener(DiatumEvent.Subjects, updateSubjects);
    }
  }, []);

  useEffect(() => {
    label.current = labelId;
    updateSubjects();
  }, [labelId]);

  const Instructions = () => {
    if(label.current == null && subjects.length == 0) {
      return (
        <View style={{ position: 'absolute', marginLeft: 32, marginRight: 32, marginBottom: 16, padding: 16, backgroundColor: '#dddddd', borderRadius: 8, bottom: 0 }}>
          <Text style={{ color: '#444444', fontSize: 16 }}>Use the plus icon in the top right to add posts to your feed.</Text>
        </View>
      );
    }
    return (<></>);
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList data={subjects} extraData={refresh} keyExtractor={item => item.subjectId} renderItem={({item}) => {
        if(SubjectUtil.isPhoto(item)) {
          return (<PhotoEntry navigation={navigation} handle={handle} item={item} />);
        }
        if(SubjectUtil.isVideo(item)) {
          return (<VideoEntry navigation={navigation} handle={handle} item={item} />);
        }
        return (<></>);
      }} />
      <Instructions />
    </View>
  );
}

function getTime(epoch: number): string {
  let d: Date = new Date();
  let offset = d.getTime() / 1000 - epoch;
  if(offset < 3600) {
    return Math.ceil(offset/60) + " min";
  }
  if(offset < 86400) {
    return Math.ceil(offset/3600) + " hr";
  }
  if(offset < 2592000) {
    return Math.ceil(offset/86400) + " d";
  }
  if(offset < 31536000) {
    return Math.ceil(offset/2592000) + " mth";
  }
  return Math.ceil(offset/31449600) + " y";
}

function PhotoEntry({navigation, handle, item}) {

  const [source, setSource] = React.useState(require('../assets/placeholder.png'));
  const [index, setIndex] = React.useState(index);
  const [options, setOptions] = React.useState(<></>);
  const [comment, setComment] = React.useState('comment-o');
  const [status, setStatus] = React.useState(<></>);
  const [thumb, setThumb] = React.useState(null);

  const data = React.useRef({});

  let diatum = useDiatum();
  const onUpdatePhoto = () => {
    navigation.navigate('Post Photo', { subjectId: item.subjectId });
  }
  const onDeletePhoto = async () => {
    const title = 'Are you sure you want to delete the post?';
    const message = '';
    const buttons = [
        { text: 'Yes, Delete', onPress: async () => {
          try {
            await diatum.removeSubject(item.subjectId);
          }
          catch(err) {
            console.log(err);
            Alert.alert("failed to delete post");
          }
        }},
        { text: 'Cancel', type: 'cancel' }
    ];
    Alert.alert(title, message, buttons);
  }

  useEffect(() => {
    if(item.share) {
      let opt = [ "Edit", "Delete", "Close Menu" ];
      let act = [ onUpdatePhoto, onDeletePhoto, ()=>{} ];
      let btn = (<Icon name="ellipsis-v" style={{ color: '#444444', fontSize: 18, padding: 8 }} />);
      setOptions(<OptionsMenu customButton={btn} options={opt} actions={act} />);
    }
    else {
      let opt = [ "Delete", "Close Menu" ];
      let act = [ onDeletePhoto, ()=>{} ];
      let btn = (<Icon name="ellipsis-v" style={{ color: '#444444', fontSize: 18, padding: 8 }} />);
      setOptions(<OptionsMenu customButton={btn} options={opt} actions={act} />);
    }

    if(!item.share) {
      setStatus(
        <View style={{ position: 'absolute', width: '100%', height: '100%' }}>
          <View style={{ position: 'absolute', width: '100%', alignItems: 'center', bottom: 0, paddingRight: 16, marginBottom: 64 }}> 
            <Icon name="wrench" style={{ transform: [{rotateY: '180deg'}], fontSize: 64, color: '#dddddd' }} />
          </View>
          <View style={{ position: 'absolute', width: '100%', alignItems: 'center', bottom: 0, paddingLeft: 16, marginBottom: 64 }}> 
            <Icon name="wrench" style={{ fontSize: 64, color: '#dddddd' }} />
          </View>
        </View>
      );
    }
    else if(!item.ready) {
      setStatus(
        <View style={{ position: 'absolute', width: '100%', alignItems: 'center', bottom: 0, marginBottom: 64 }}> 
          <Icon name="refresh" style={{ fontSize: 64, color: '#dddddd' }} />
        </View>
      );
    }
    else {
      setStatus(<></>);
    }

    if(item.share && item.ready && item.data != null) {
      data.current = JSON.parse(item.data);
      setIndex(0);
    } 
    if(item.tagCount > 0) {
      setComment('commenting-o');
    }
    else {
      setComment('comment-o');
    }
  }, [item]);

  useEffect(() => {
    if(index != null && data.current.images != null && data.current.images.length > 0) {
      if(index >= data.current.images.length) {
        setSource({ uri: item.asset(data.current.images[0].thumb), cache: 'force-cache' });
        setThumb(item.asset(data.current.images[0].thumb));
      }
      else {
        setSource({ uri: item.asset(data.current.images[index].thumb), cache: 'force-cache' });
        setThumb(item.asset(data.current.images[index].thumb));
      }
    }
    else {
      setSource(require('../assets/placeholder.png'));
    } 
  }, [item, index]);

  const Dots = () => {

    // only dots for more than one
    if(data.current.images == null || data.current.images.length <= 1) {
      return (<></>);
    }

    // dot for each image
    let dot = []
    for(let i = 0; i < data.current.images.length; i++) {
      if(index == i) {
        dot.push(<View opacity={0.8} key={i} style={{ width: 16, height: 16, margin: 8, backgroundColor: '#0077CC', borderWidth: 1, borderColor: '#ffffff', borderRadius: 8 }} />);
      }
      else {
        dot.push(<View opacity={0.8} key={i} style={{ width: 16, height: 16, margin: 8, borderWidth: 1, borderColor: '#ffffff', borderRadius: 8 }} />);
      }
    }

    return (
      <TouchableOpacity activeOpacity={1} onPress={onNext} style={{ position: 'absolute', bottom: 0, width: '100%', justifyContent: 'center', padding: 16, flexDirection: 'row' }}>{dot}</TouchableOpacity>
    );
  };

  const onPrevious = () => {
    if(data.current.images != null && data.current.images.length > 1) {
      if(index > 1) {
        setIndex(index-1);
      }
      else {
        setIndex(data.current.images.length-1);
      }
      setSource({ uri: item.asset(data.current.images[index].thumb), cache: 'force-cache' });
    }
  };

  const onNext = () => {
    if(data.current.images != null && data.current.images.length > 1) {
      if(index < data.current.images.length - 1) {
        setIndex(index+1);
      }
      else {
        setIndex(0);
      }
    }
  };

  const swipeConfig = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80
  };

  const onComment = () => {
    navigation.navigate('Comment', { handle: handle, thumb: thumb, subjectId: item.subjectId });
  };

  const onFull = () => {
    let photos = [];
    for(let i = 0; i < data.current.images.length; i++) {
      photos.push(item.asset(data.current.images[i].full));
    }
    navigation.navigate('FullScreenPhoto', { uri: photos });
  }

  return (
    <View style={{ flex: 1, marginBottom: 8, borderTopWidth: 1, borderColor: '#aaaaaa' }}>
      <TouchableOpacity activeOpacity={1} onLongPress={onFull}>
        <Image style={{ flexGrow: 1, width: null, height: null, aspectRatio: 1 }} source={source} />
        { status }
        <TouchableOpacity style={{ position: 'absolute', margin: 8, right: 0 }}>
          <View opacity={0.8} style={{ backgroundColor: '#ffffff', borderRadius: 8 }}>{ options }</View>
        </TouchableOpacity>
        <Dots />
      </TouchableOpacity>
      <View style={{ padding: 8, flexDirection: 'row', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#aaaaaa' }}>
        <View style={{ flexGrow: 1 }}>
          <Text>{ data.current.location }&nbsp;&nbsp;<Text style={{ color: '#888888' }}>{ getTime(item.modified) }</Text></Text>
          <Text style={{ paddingTop: 8, color: '#444444' }}>{ data.current.description }</Text>
        </View>
        <TouchableOpacity style={{ alignItems: 'flex-end' }} onPress={onComment}>
          <Icon name={comment} style={{ fontSize: 20, color: '#0072CC' }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function VideoEntry({navigation, handle, item}) {

  const [uri, setUri] = React.useState(null);
  const [data, setData] = React.useState({});
  const [source, setSource] = React.useState(require('../assets/placeholder.png'));
  const [options, setOptions] = React.useState(<></>);
  const [comment, setComment] = React.useState('comment-o');
  const [status, setStatus] = React.useState(<></>);
  const [thumb, setThumb] = React.useState(null);

  let dataRef = React.useRef(null);

  let diatum = useDiatum();
  const onUpdateVideo = () => {
    navigation.navigate('Post Video', { subjectId: item.subjectId });
  }
  const onDeleteVideo = async () => {
    const title = 'Are you sure you want to delete the post?';
    const message = '';
    const buttons = [
        { text: 'Yes, Delete', onPress: async () => {
          try {
            await diatum.removeSubject(item.subjectId);
          }
          catch(err) {
            console.log(err);
            Alert.alert("failed to delete post");
          }
        }},
        { text: 'Cancel', type: 'cancel' }
    ];
    Alert.alert(title, message, buttons);
  }

  useEffect(() => {
    if(item.share) {
      let opt = [ "Edit", "Delete", "Close Menu" ];
      let act = [ onUpdateVideo, onDeleteVideo, ()=>{} ];
      let btn = (<Icon name="ellipsis-v" style={{ color: '#444444', fontSize: 18, padding: 8 }} />);
      setOptions(<OptionsMenu customButton={btn} options={opt} actions={act} />);
    }
    else {
      let opt = [ "Delete", "Close Menu" ];
      let act = [ onDeleteVideo, ()=>{} ];
      let btn = (<Icon name="ellipsis-v" style={{ color: '#444444', fontSize: 18, padding: 8 }} />);
      setOptions(<OptionsMenu customButton={btn} options={opt} actions={act} />);
    }

    if(!item.share) {
      setStatus(
        <View style={{ position: 'absolute', width: '100%', height: '100%' }}>
          <View style={{ position: 'absolute', width: '100%', alignItems: 'center', bottom: 0, paddingRight: 16, marginBottom: 64 }}>
            <Icon name="wrench" style={{ transform: [{rotateY: '180deg'}], fontSize: 64, color: '#dddddd' }} />
          </View>
          <View style={{ position: 'absolute', width: '100%', alignItems: 'center', bottom: 0, paddingLeft: 16, marginBottom: 64 }}>
            <Icon name="wrench" style={{ fontSize: 64, color: '#dddddd' }} />
          </View>
        </View>
      );
    }
    else if(!item.ready) {
      setStatus(
        <View style={{ position: 'absolute', width: '100%', alignItems: 'center', bottom: 0, marginBottom: 64 }}>
          <Icon name="refresh" style={{ fontSize: 64, color: '#dddddd' }} />
        </View>
      );
    }
    else {
      setStatus(
        <TouchableOpacity style={{ position: 'absolute', padding: 16, bottom: 0, width: '100%', alignItems: 'center' }}>
          <View opacity={0.8}>
            <Icon name="play-circle-o" style={{ fontSize: 64, color: '#ffffff' }} onPress={onPlay}/>
          </View>
        </TouchableOpacity>
      );
    }

    if(item.share && item.ready && item.data != null) {
      let d = JSON.parse(item.data);
      setData(d);
      dataRef.current = d;
      if(d.thumb != null) {
        setSource({ uri: item.asset(d.thumb), cache: 'force-cache' });
        setThumb(item.asset(d.thumb));
      } 
    } 
    if(item.tagCount > 0) {
      setComment('commenting-o');
    }
    else {
      setComment('comment-o');
    }
  }, [item]);

  const getUri = (): string => {
    let config = app.getConfig();
    if(config != null && config.videoQuality == 'hd') {
      if(dataRef.current.high != null) {
        return item.asset(dataRef.current.high);
      }
      else if(dataRef.current.standard != null) {
        return item.asset(dataRef.current.standard);
      }
      else {
        return item.asset(dataRef.current.low);
      }
    }
    else if(config != null && config.videoQuality == 'lq') {
      if(dataRef.current.low != null) {
        return item.asset(dataRef.current.low);
      }
      else if(dataRef.current.standard != null) {
        return item.asset(dataRef.current.standard);
      }
      else {
        return item.asset(dataRef.current.high);
      }
    }
    else {
      if(dataRef.current.standard != null) {
        return item.asset(dataRef.current.standard);
      }
      else if(dataRef.current.high != null) {
        return item.asset(dataRef.current.high);
      }
      else {
        return item.asset(dataRef.current.low);
      }
    }
  }

  let app = useApp();
  const onPlay = () => {
    setUri(getUri());
  };

  const onDone = () => {
    setUri(null);
  };

  const MyVideo = () => {
    if(uri == null) {
      return (<></>);
    }
    return (<VideoPlayer uri={uri} done={onDone} />);
  }

  const onComment = () => {
    navigation.navigate('Comment', { handle: handle, thumb: thumb, subjectId: item.subjectId });
  }

  const onFull = () => {
    navigation.navigate('FullScreenVideo', { uri: getUri() });
  }

  return (
    <View style={{ flex: 1, marginBottom: 8, borderTopWidth: 1, borderColor: '#888888' }}>
      <TouchableOpacity activeOpacity={1} onLongPress={onFull}>
        <Image style={{ flexGrow: 1, width: null, height: null, aspectRatio: 1 }} source={source} />
        { status }
        <TouchableOpacity style={{ position: 'absolute', margin: 8, right: 0 }}>
          <View opacity={0.8} style={{ backgroundColor: '#ffffff', borderRadius: 8 }}>{ options }</View>
        </TouchableOpacity>
        <MyVideo />
      </TouchableOpacity>
      <View style={{ padding: 8, flexDirection: 'row', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#888888' }}>
        <View style={{ flexGrow: 1 }}>
          <Text>{ data.location }&nbsp;&nbsp;<Text style={{ color: '#888888' }}>{ getTime(item.modified) }</Text></Text>
          <Text style={{ paddingTop: 8, color: '#444444' }}>{ data.description }</Text>
        </View>
        <TouchableOpacity style={{ alignItems: 'flex-end' }} onPress={onComment}>
          <Icon name={comment} style={{ fontSize: 20, color: '#0072CC' }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}


    
