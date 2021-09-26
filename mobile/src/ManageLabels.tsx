import 'react-native-gesture-handler';
import React, { useEffect, forwardRef, useRef, useImperativeHandle } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Dimensions, Platform, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, TextInput, Image, FlatList, Button, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View, ImageBackground, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import UserAvatar from 'react-native-user-avatar';
import OptionsMenu from "react-native-option-menu";
import { useNavigation } from '@react-navigation/native';

import Modal from 'react-native-modal';
import { Diatum, DiatumEvent } from '../diatum/Diatum';
import { DiatumSession, LabelEntry } from '../diatum/DiatumTypes';
import { DiatumProvider, useDiatum } from "../diatum/DiatumContext";
import { IndiViewCom, Contact } from "./IndiViewCom";
import { AppSuppport, useApp } from './AppSupport';

export function ManageLabels({ navigation }) {
  const [labels, setLabels] = React.useState([]);
  const [prompt, setPrompt] = React.useState(false);
  const [label, setLabel] = React.useState(null);

  let diatum = useDiatum();
  useEffect(() => {
    diatum.setListener(DiatumEvent.Labels, updateLabels);
    return () => {
      diatum.clearListener(DiatumEvent.Labels, updateLabels);
    }
  }, []);

  const updateLabels = async () => {
    setLabels(await diatum.getLabels());
  }

  const onAdd = () => {
    setLabel(null);
    setPrompt(true);
  }

  const onEdit = (entry: LabelEntry) => {
    setLabel(entry);
    setPrompt(true);
  }

  const onDelete = (entry: LabelEntry) => {
    const title = "Do you want to delete '" + entry.name + "'?";
    const message = '';
    const buttons = [
        { text: 'Yes, Delete', onPress: async () => {
          try {
            await diatum.removeLabel(entry.labelId);
          }
          catch(err) {
            console.log(err);
            Alert.alert("failed to delete label");
          }
        }},
        { text: 'Cancel', type: 'cancel' }
    ];
    Alert.alert(title, message, buttons);
  }

  const onSave = async (name: string) => {
    setPrompt(false);
  }

  const onClose = () => {
    setPrompt(false);
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={onAdd}>
          <Icon name="plus-square-o" style={{ color: '#0077CC', fontSize: 28, width: 48, textAlign: 'center' }} />
        </TouchableOpacity>
      )
    });
  }, [navigation]);

  const Instructions = () => {
    if(labels.length == 0) {
      return (
        <View style={{ position: 'absolute', marginLeft: 32, marginRight: 32, marginBottom: 16, padding: 16, backgroundColor: '#dddddd', borderRadius: 8, bottom: 0, flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#444444', fontSize: 16 }}>Use the plus icon in the top right to add labels for your contacts and data.</Text>
          </View>
        </View>
      );
    }
    return (<></>);
  }

  return (
    <View style={{ flex: 1, width: '100%' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', paddingTop: 8, paddingBottom: 8, paddingLeft: 16, paddingRight: 16, borderBottomWidth: 2, borderColor: '#dddddd', backgroundColor: '#dddddd' }}>
        <Text style={{ color: '#444444', fontSize: 16, flexGrow: 1 }}>Name</Text>
        <View style={{ width: 48, alignItems: 'center' }}>
          <Icon name="user" size={16} color={'#444444'} solid />
        </View>
        <View style={{ width: 48, alignItems: 'center' }}>
          <Icon name="file-text-o" size={16} color={'#444444'} solid />
        </View>
        <View style={{ width: 48, alignItems: 'center' }}>
          <Icon name="file-picture-o" size={16} color={'#444444'} solid />
        </View>
      </View>
      <FlatList style={{ paddingLeft: 16, paddingRight: 16 }} data={labels} keyExtractor={item => item.labelId} renderItem={({item}) => <LabelName item={item} set={onEdit} clear={onDelete} /> } />
      <Instructions />
      <PromptLabel prompt={prompt} label={label} saved={onSave} closed={onClose} />
    </View>
  )
}

function PromptLabel({ prompt, label, saved, closed }) {
  const [text, setText] = React.useState(null);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [title, setTitle] = React.useState(null);
 
  useEffect(() => {
    if(prompt == true) {
      setModalVisible(prompt);
    }
    if(label == null) {
      setText("");
      setTitle("New Label");
    }
    else {
      setText(label.name);
      setTitle("Edit Label");
    }
  }, [label, prompt]);

  let diatum = useDiatum();
  const onSave = async () => {
    try {
      if(label == null) {
        await diatum.addLabel(text);
      }
      else {
        await diatum.updateLabel(label.labelId, text);
      }
      setModalVisible(false);
      saved(text);
    }
    catch(err) {
      console.log(err);
      Alert.alert("failed to save label");
    }
  };

  const onCancel = () => {
    setModalVisible(false);
    closed();
  };

  return (
      <Modal style={{ margin: 0 }} animationType="fade" transparent={true} visible={modalVisible} onRequestClose={onCancel} >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: 'rgba(52, 52, 52, 0.8)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ padding: 16, width: '80%', borderRadius: 4, backgroundColor: '#ffffff' }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#444444' }}>{ title }</Text>
            <TextInput style={{ padding: 8, marginTop: 8, marginBottom: 8, borderRadius: 8, width: '100%', backgroundColor: '#eeeeee', textAlignVertical: 'top' }} value={text} onChangeText={setText} />
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

function LabelName({item, set, clear}) {
  const [count, setCount] = React.useState({});
  const [id, setId] = React.useState(item.labelId);

  let diatum = useDiatum();
  useEffect(async () => {
    let c = await diatum.getLabelCount(item.labelId);
    setCount(c);
  }, []);

  const onEdit = (item: LabelEntry) => {
    set(item)
  }

  const onDelete = (item: LabelEntry) => {
    clear(item);
  }

  return (
    <TouchableOpacity style={{ height: 64, flexDirection: 'row', borderBottomWidth: 1, borderColor: '#dddddd', alignItems: 'center' }} onPress={() => onEdit(item)} onLongPress={() => onDelete(item)}>
      <Text style={{ color: '#0072CC', fontSize: 18, flexGrow: 1 }}>{item.name}</Text>
      <View style={{ width: 48, alignItems: 'center' }}>
        <Text style={{ color: '#444444', fontSize: 16, paddingLeft: 2 }}>{ count.contact }</Text>
      </View>
      <View style={{ width: 48, alignItems: 'center' }}>
        <Text style={{ color: '#444444', fontSize: 16, paddingLeft: 2 }}>{ count.attribute }</Text>
      </View>
      <View style={{ width: 48, alignItems: 'center' }}>
        <Text style={{ color: '#444444', fontSize: 16, paddingLeft: 2 }}>{ count.story }</Text>
      </View>
    </TouchableOpacity>
  )
}
