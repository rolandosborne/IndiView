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

import { Latch, useLatch } from './LatchContext';
import { Diatum, DiatumEvent } from '../diatum/Diatum';
import { AttachCode, getAttachCode } from '../diatum/DiatumUtil';
import { DiatumSession, LabelEntry } from '../diatum/DiatumTypes';
import { DiatumProvider, useDiatum } from "../diatum/DiatumContext";
import { IndiViewCom } from "./IndiViewCom";

const FeedDrawer = createDrawerNavigator();
let contactNav = null;

function FeedDrawerContent(props) {
  contactNav = props.navigation;
  const [labelId, setLabelId] = React.useState(null);
  const [labels, setLabels] = React.useState([]);
  let diatum: Diatum = useDiatum();
  const update = () => {
    diatum.getLabels().then(l => {
      setLabels(l);
    }).catch(err => {
      console.log(err);
    });
  };

  const setLabel = (id: string) => {
    setLabelId(id);
    props.onLabel(id);
  }

  const clearLabel = () => {
    setLabelId(null);
    props.onLabel(null);
  }

  useEffect(() => {
    diatum.setListener(DiatumEvent.Labels, update);
    return () => {
      diatum.clearListener(DiatumEvent.Labels, update);
    }
  }, []);

  return (
      <View style={{ flex: 1 }}>
        <View style={{ width: '100%', paddingTop: 32, backgroundColor: '#282827', alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
          <Icon name="tag" style={{ marginLeft: 16, fontSize: 18, color: '#ffffff' }} />
          <DrawerItem style={{ flex: 1 }} labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#ffffff', backgroundColor: '#282827', textAlign: 'left' }} label={'Contact Filter'} />
        </View>
        <FlatList data={labels} keyExtractor={item => item.labelId} renderItem={({item,index}) => { 
          if(labelId == item.labelId) {
            return <DrawerItem labelStyle={{ fontSize: 18, color: '#0072CC' }} label={item.name} onPress={() => {props.navigation.closeDrawer(); clearLabel();} } />
          }
          else {
            return <DrawerItem labelStyle={{ fontSize: 18, color: '#282827' }} label={item.name} onPress={() => {props.navigation.closeDrawer(); setLabel(item.labelId);} } />
          }
        }} />
      </View>
  );
}

export function Feed({ navigation }) {
  
  const latchColorRef = useRef('#282827');
  const callbackRef = useRef(null);

  const latch = useLatch();
  const onLatch = () => {
    contactNav.toggleDrawer();
  };

  useEffect(() => {
    const unfocus = navigation.addListener('focus', () => {
      contactNav.closeDrawer();
      latch.setToggleListener(onLatch, latchColorRef.current);
    });
    return (() => {
      latch.clearToggleListener(onLatch);
      unfocus();
    }) 
  }, []);

  const selected = (id: string) => {
    if(id == null) {
      latchColorRef.current = '#282827';
    }
    else {
      latchColorRef.current = '#0072CC';
    }
    latch.setColor(latchColorRef.current);
    if(callbackRef.current != null) {
      callbackRef.current(id);
    }
  };

  const setCallback = (cb: (id: string) => {}) => {
    callbackRef.current = cb;
  };

  const clearCallback = () => {
    callbackRef.current = null;
  };

  return (
    <View style={{ flex: 1 }}>
      <FeedDrawer.Navigator navigationOptions={{title: 'ro'}} drawerPosition={'right'} drawerContent={(props) => <FeedDrawerContent {...props} {...{onLabel: selected}} />}>
        <FeedDrawer.Screen name="Feed">{(props) => { 
          return (
            <View style={{ flex: 1 }}>
              <ContactList setListener={setCallback} clearListener={clearCallback} /> 
            </View>
          )
        }}</FeedDrawer.Screen>
      </FeedDrawer.Navigator>
    </View>
  )
}

function ContactList({ setListener, clearListener }) {

  const [refresh, setRefresh] = React.useState(null);
  const [contacts, setContacts] = React.useState([{ id: "" }]);
  const labelIdRef = useRef(null);
  
  let diatum: Diatum = useDiatum();
  const updateContacts = async () => {
    let c = await diatum.getContacts(labelIdRef.current, "connected");
    
    // sort by modified subject
    c.sort((a,b) => { 
      if(a.appSubject == null) {
        return 1;
      }
      if(b.appSubject == null) {
        return -1;
      }
      if(a.appSubject.subjectModified < b.appSubject.subjectModified) {
        return 1;
      }
      else {
        return -1;
      }
    });

    let grid = [];
    for(let i = -1; i < c.length; i+=3) {
      if(i < 0) {
        grid.push({ id: "", left: null, middle: c[i+1], right: c[i+2] });
      }
      else {
        grid.push({ id: c[i+0].amigoId, left: c[i+0], middle: c[i+1], right: c[i+2] });
      }
    }
    setContacts(grid);
  }

  const setLabel = (id: string) => {
    labelIdRef.current = id;
    updateContacts()
  };

  onRefresh = () => {
    setRefresh(JSON.parse('{}'));
  }

  const Instructions = () => {
    if(labelIdRef.current == null && contacts.length == 1 && contacts[0].middle == null) {
      return (
        <View style={{ position: 'absolute', marginLeft: 32, marginRight: 32, marginBottom: 16, padding: 16, backgroundColor: '#dddddd', borderRadius: 8, bottom: 0 }}>
          <Text style={{ color: '#444444', fontSize: 16 }}>Use the 'Contact Search' page from the left menu to find and connect with others</Text>
        </View>
      );
    }
    return (<></>);
  }

  useEffect(() => {
    setListener(setLabel);
    diatum.setListener(DiatumEvent.Contact, updateContacts);
    diatum.setListener(DiatumEvent.Amigos, updateContacts);
    diatum.setListener(DiatumEvent.Share, updateContacts);
    diatum.setListener(DiatumEvent.View, updateContacts);
    Dimensions.addEventListener('change', onRefresh);
    return () => {
      clearListener();
      diatum.clearListener(DiatumEvent.Contact, updateContacts);
      diatum.clearListener(DiatumEvent.Amigos, updateContacts);
      diatum.clearListener(DiatumEvent.Share, updateContacts);
      diatum.clearListener(DiatumEvent.View, updateContacts);
      Dimensions.removeEventListener('change', onRefresh);
    }
  }, []);

  return (
    <SafeAreaView style={{ flex: 1}} foctor={item => item.id} forceInset={{ bottom: 'never' }}>
      <FlatList data={contacts} extraData={refresh} keyExtractor={item => item.id} renderItem={({item}) => <ContactRow item={item} />} />
      <Instructions />
    </SafeAreaView>
  );
}

function ContactRow({item}) {

  if(item.left == null) {
    return (
      <View style={{ width: '100%', flexDirection: 'row' }}>
        <IdentityEntry style={{ flex: 1 }} />
        <ContactEntry style={{ flex: 1 }} entry={item.middle} />
        <ContactEntry style={{ flex: 1 }} entry={item.right} />
      </View>
    );
  }
  else {
    return (
      <View style={{ width: '100%', flexDirection: 'row' }}>
        <ContactEntry style={{ flex: 1 }} entry={item.left} />
        <ContactEntry style={{ flex: 1 }} entry={item.middle} />
        <ContactEntry style={{ flex: 1 }} entry={item.right} />
      </View>
    );
  }
}

function IdentityEntry() {
  const [identity, setIdentity] = React.useState({});
  const [flag, setFlag] = React.useState(false);
  const [handle, setHandle] = React.useState(null);
  const [dim, setDim] = React.useState(64);
  const [source, setSource] = React.useState(null);

  let diatum = useDiatum();
  const updateIdentity = async () => {
    let i = await diatum.getIdentity();
    setIdentity(i);
    if(i != null) {
      setFlag(i.errorFlag);
      setHandle(i.handle);
      if(i.imageUrl != null) {
        setSource({ uri: i.imageUrl, cache: 'force-cache' });
      }
      else {
        setSource(require('../assets/avatar.png'));
      }
    }
  };

  let navigation = useNavigation();
  const onIdentity = () => {
    navigation.navigate("MyFeed", identity);
  }

  const onRefresh = () => {
    setDim(Math.floor((Dimensions.get('screen').width / 3) - 32));
  }

  useEffect(() => {
    setDim(Math.floor((Dimensions.get('screen').width / 3) - 32));

    Dimensions.addEventListener('change', onRefresh);
    diatum.setListener(DiatumEvent.Identity, updateIdentity);
    return () => {
      diatum.clearListener(DiatumEvent.Identity, updateIdentity);
      Dimensions.removeEventListener('change', onRefresh);
    };
  }, []);  

  return (
    <View style={{ flex: 1, alignItems: 'center', padding: 16 }}>
      <TouchableOpacity activeOpacity={1} onPress={onIdentity}>
        <Image style={{ width: dim, height: dim, marginBottom: 18, aspectRatio: 1, borderRadius: 32, borderWidth: 2, borderColor: flag ? '#ff8888' : '#00bb88' }} source={source} />
        <View style={{ position: 'absolute', bottom: 16, right: 0, alignItems: 'center', justifyContent: 'center', padding: 2 }}>
          <Icon name="cog" style={{ fontSize: 32, color: '#222200' }} />
          <Icon name="cog" style={{ position: 'absolute', fontSize: 24, color: '#222200' }} />
          <Icon name="cog" style={{ position: 'absolute', fontSize: 28, color: '#ffffff' }} />
        </View>
        <Text style={{ position: 'absolute', bottom: 0, width: '100%', textAlign: 'center', fontSize: 12, paddingTop: 4, color: '#444444' }}>{ handle }</Text>
      </TouchableOpacity>
    </View>
  );
}

function ContactEntry({entry}) {

  const [source, setSource] = React.useState(require('../assets/avatar.png'));
  const [dim, setDim] = React.useState(64);
  
  const onRefresh = () => {
    setDim(Math.floor((Dimensions.get('screen').width / 3) - 32));
  }

  useEffect(() => {
    setDim(Math.floor((Dimensions.get('screen').width / 3) - 32));
    if(entry != null && entry.imageUrl != null) {
      setSource({ uri: entry.imageUrl, cache: 'force-cache' });
    }
    else {
      setSource(require('../assets/avatar.png'));
    }

    Dimensions.addEventListener('change', onRefresh);
    return () => {
      Dimensions.removeEventListener('change', onRefresh);
    }
  }, [entry]);

  let navigation = useNavigation();
  const onContact = () => {
    navigation.navigate("ContactFeed", entry);
  }

  if(entry == null) {
    return (<View style={{ flex: 1, alignItems: 'center', padding: 16 }}></View>);
  }

  const Star = () => {
    if(entry.appSubject != null && entry.appSubject.subjectRevision != null) {
      if(entry.appSubject.feedRevision == null || entry.appSubject.subjectRevision > entry.appSubject.feedRevision) {
        return (
          <View style={{ position: 'absolute', bottom: 16, right: 0, alignItems: 'center', justifyContent: 'center', padding: 2 }}>
            <Icon name="star" style={{ fontSize: 32, color: '#222200' }} />
            <Icon name="star" style={{ position: 'absolute', fontSize: 28, color: '#ffffff' }} />
          </View>
        );
      }
    }
    return (<></>);
  }

  let defaultSource = require('../assets/avatar.png');
  let onDefault = () => {
    setSource(defaultSource);
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', padding: 16 }}>
      <TouchableOpacity activeOpacity={1} onPress={onContact}>
        <Image style={{ width: dim, height: dim, marginBottom: 18, aspectRatio: 1, borderRadius: 32, borderWidth: 2, borderColor: entry.errorFlag ? '#ff8888' : '#00bb88' }}
            source={source} defaultSource={defaultSource} onError={onDefault} />
        <Star />
        <Text style={{ position: 'absolute', bottom: 0, width: '100%', textAlign: 'center', fontSize: 12, paddingTop: 4, color: '#444444' }}>{ entry.handle }</Text>
      </TouchableOpacity>
    </View>
  );
}

