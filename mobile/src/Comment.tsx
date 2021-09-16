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

import { TagUtil } from './TagUtil';
import { Diatum, DiatumEvent } from '../diatum/Diatum';
import { DiatumProvider, useDiatum } from "../diatum/DiatumContext";

export function Comment({ route,navigation }) {
  const [tags, setTags] = React.useState([]);
  const [message, setMessage] = React.useState(null);

  let busy = React.useRef(false);

  let diatum = useDiatum();

  const UpdateAmigoTag = async (objectId: string) => {
    if(objectId != null && objectId == route.params.amigoId) {
      setTags(await diatum.getContactSubjectTags(route.params.amigoId, route.params.subjectId));
    }
  }

  const UpdateMyTag = async (objectId: string) => {
    if(objectId == route.params.subjectId) {
      setTags(await diatum.getSubjectTags(route.params.subjectId));
    }
  }

  useEffect(() => {
    diatum.setListener(DiatumEvent.View, UpdateAmigoTag);
    diatum.setListener(DiatumEvent.Subjects, UpdateMyTag);
    return () => {
      diatum.clearListener(DiatumEvent.View, UpdateAmigoTag);
      diatum.clearListener(DiatumEvent.Subjects, UpdateMyTag);
    }
  }, []);

  useEffect(async () => {
    if(route.params.amigoId == null) {
      setTags(await diatum.getSubjectTags(route.params.subjectId));
    }
    else {
      setTags(await diatum.getContactSubjectTags(route.params.amigoId, route.params.subjectId));
    }
  }, []);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: route.params.handle,
      headerRight: () => (<Image style={{ flexGrow: 1, width: null, height: null, marginRight: 8, marginTop: 4, marginBottom: 4, aspectRatio: 1, borderRadius: 8 }} source={{ uri: route.params.thumb, cache: 'force-cache' }} />)
    });
  }, []);

  const onSend = async () => {
    if(message != null && busy.current == false) {
      busy.current = true;
      try {
        if(route.params.amigoId == null) {
          await diatum.addSubjectTag(route.params.subjectId, TagUtil.MESSAGE, JSON.stringify({ message: message }));
        }
        else {
          await diatum.addContactSubjectTag(route.params.amigoId, route.params.subjectId, TagUtil.MESSAGE, JSON.stringify({ message: message }));
        }
        setMessage(null);
      }
      catch(err) {
        console.log(err);
        Alert.alert("failed to add comment");
      }
      busy.current = false;
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 12, width: '100%', marginBottom: 8, backgroundColor: '#eeeeee', borderBottomWidth: 2, borderColor: '#dddddd', flexDirection: 'row' }}>
        <TextInput multiline={true} style={{ flex: 1, fontSize: 16, textAlignVertical: 'top' }} autoCapitalize={'sentences'} value={message} onChangeText={setMessage} placeholder={'Comment'} placeholderTextColor={'#888888'} />
        <TouchableOpacity style={{ alignSelf: 'center' }} onPress={onSend}>
          <Icon name="send-o" style={{ color: '#0072CC', fontSize: 24, paddingLeft: 16 }} />
        </TouchableOpacity>
      </View>
      <FlatList data={tags} keyExtractor={item => item.tagId} renderItem={({item}) => <CommentEntry tag={item} />} />
    </View>
  );
}

function CommentEntry({tag}) {
  const [message, setMessage] = React.useState(null);

  useEffect(() => {
    if(tag.data != null) {
      setMessage(JSON.parse(tag.data).message);
    }
  }, []);

  return (
    <View style={{ fontSize: 16, color: '#444444', padding: 8, margin: 8, borderColor: '#dddddd', borderRadius: 8, borderWidth: 1 }}>
      <Text><Text style={{ fontWeight: 'bold' }}>{ tag.amigoName }&nbsp;&nbsp;&nbsp;</Text><Text>{ getTime(tag.created) }</Text></Text>
      <Text style={{ paddingTop: 4 }}>{ message }</Text>
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
