import 'react-native-gesture-handler';
import React, { useEffect, forwardRef, useRef, useImperativeHandle } from 'react';
import { SafeAreaView, Modal, Alert, Animated, Dimensions, Platform, Clipboard, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, TextInput, Image, FlatList, Button, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View, ImageBackground, Linking } from 'react-native';
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

const AttributeDrawer = createDrawerNavigator();
let attributeNav = null;

function AttributeDrawerContent(props) {
  
  attributeNav = props.navigation;
  const [attributeId, setAttributeId] = React.useState(props.attributeId);
  const [attributeLabels, setAttributeLabels] = React.useState([]);
  const [labels, setLabels] = React.useState(props.labels);

  let diatum: Diatum = useDiatum();

  const updateAssigned = () => {
    // get assigned list
  };

  const updateList = () => {
    diatum.getLabels().then(l => {
      setLabels(l);
    }).catch(err => {
      console.log(err);
    });
  };

  useEffect(() => {
    diatum.setListener(DiatumEvent.Labels, updateList);
    diatum.setListener(DiatumEvent.Attributes, updateAssigned);
    return () => {
      diatum.clearListener(DiatumEvent.Labels, updateList);
      diatum.clearListener(DiatumEvent.Attributes, updateAssigned);
    }
  }, []);

  const setLabel = async (id: string) => {
    try {
      // set attribute label
    }
    catch(err) {
      console.log(err);
      Alert.alert("failed to set label");
    }
  }

  const clearLabel = async (id: string) => {
    try {
      // clear attribute label
    }
    catch(err) {
      console.log(err);
      Alert.alert("failed to clear label");
    }
  }

  const hasLabel = (id: string) => {
    for(let i = 0; i < attributeLabels.length; i++) {
      if(attributeLabels[i] == id) {
        return true;
      }
    }
    return false;
  }

  return (
      <View>
        <DrawerItem labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#000000' }} label={'Assigned Labels'} />
        <FlatList data={labels} keyExtractor={item => item.labelId} renderItem={({item,index}) => {
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

export function MyAttribute({ route, navigation }) {
  const [attributeLabels, setAttributeLabels] = React.useState([]);
  const [latchColor, setLatchColor] = React.useState('#282827');

  const labels = useRef([]);
  const ids = useRef([]);

  let latch: Latch = useLatch();
  const onLatch = () => {
    attributeNav.toggleDrawer();
  };

  useEffect(() => {
    const unfocus = navigation.addListener('focus', () => {
      attributeNav.closeDrawer();
      latch.setToggleListener(onLatch, latchColor);
    });
    return (() => {
      latch.clearToggleListener(onLatch);
      unfocus();
    }) 
  }, []);
 
  const onLabel = (l: string[]) => {
    ids.current = l;
    if(l == null || l.length == 0) {
      setLatchColor('#282827');
      latch.setColor('#282827');
    }
    else {
      setLatchColor('#0077CC');
      latch.setColor('#0077CC');
    }
    updateNames();
  };

  return (
    <View style={{ flex: 1 }} >
      <AttributeDrawer.Navigator navigationOptions={{title: 'ro'}} drawerPosition={'right'} drawerContent={(props) => <AttributeDrawerContent {...props} {...{callback: onLabel}} />}>
        <AttributeDrawer.Screen name="Contacts">{(props) => {
          return (
            <View style={{ flex: 1 }}>
            </View>
          )
        }}</AttributeDrawer.Screen>
      </AttributeDrawer.Navigator>
    </View>
  )
}

