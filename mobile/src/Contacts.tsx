import 'react-native-gesture-handler';
import React, { useEffect, forwardRef, useRef, useImperativeHandle } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Platform, Linking, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, TextInput, Image, FlatList, Button, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import { Diatum, DiatumEvent } from '../diatum/Diatum';
import { AttachCode, getAttachCode } from '../diatum/DiatumUtil';
import { DiatumSession, LabelEntry } from '../diatum/DiatumTypes';
import { DiatumProvider, useDiatum } from "../diatum/DiatumContext";
import { IndiViewCom } from "./IndiViewCom";

const ContactDrawer = createDrawerNavigator();
let contactNav = null;

function ContactDrawerContent(props) {
  contactNav = props.navigation;
  const [labels, setLabels] = React.useState([]);
  let diatum: Diatum = useDiatum();
  const update = () => {
    diatum.getLabels().then(l => {
      setLabels(l);
    }).catch(err => {
      console.log(err);
    });
  };

  useEffect(() => {
        diatum.setListener(DiatumEvent.Labels, update);
        return () => {
          diatum.clearListener(DiatumEvent.Labels, update);
        }
    }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View>
        <DrawerItem labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#000000' }} label={'Label View'} />
        <FlatList data={labels} keyExtractor={item => item.labelId} renderItem={({item,index}) => <DrawerItem labelStyle={{ fontSize: 18 }} label={item.name} onPress={() => {props.navigation.closeDrawer(); props.onLabel(item.labelId);} } />} />
      </View>
    </SafeAreaView>
  );
}

export function ContactScreen() {
  let callack: (id: string) => {} = null;
  const selected = (id: string) => {
    console.log("SELECTED: " + id);
    if(callback != null) {
      callback(id);
    }
  };

  const setCallback = (cb: (id: string) => {}) => {
    callback = cb;
  };

  const clearCallback = () => {
    callback = null;
  };

  return (
    <ContactDrawer.Navigator navigationOptions={{title: 'ro'}} drawerPosition={'right'} drawerContent={(props) => <ContactDrawerContent {...props} {...{onLabel: selected}} />}>
      <ContactDrawer.Screen name="ContactNavScreen">{(props) => <ContactNavScreen {...props} {...{setListener: setCallback, clearListner: clearCallback}}/>}</ContactDrawer.Screen>
    </ContactDrawer.Navigator>
  )
}

function ContactNavScreen(props) {
  const toggleLabel = () => {
    contactNav.openDrawer();
  };
  return (
    <View style={{ flex: 1 }}>
      <Contacts {...props}></Contacts>

      <TouchableOpacity style={{ alignItems: 'center', position: "absolute", right: -24, top: '50%', translateY: -32, width: 48, height: 64, borderRadius: 8 }} onPress={toggleLabel}>
        <View style={{ width: 16, height: 64, backgroundColor: '#282827', borderRadius: 8 }}></View>
      </TouchableOpacity>
    </View>
  );
}

function Contacts(props) {

  const setLabel = (id: string) => {
    console.log("SET LABEL IN CONTACTS: " + id);
  };

  useEffect(() => {
    props.setListener(setLabel);
    return () => {
      props.clearListener();
    }
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>-- CONTACTS --</Text>
    </View>
  )
}

