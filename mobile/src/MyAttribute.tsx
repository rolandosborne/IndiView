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

export class AttributeParams {
  attributeId: string;
  schema: string;
  data: any;
}

function AttributeDrawerContent(props) {
 
  attributeNav = props.navigation;
  const [attributeId, setAttributeId] = React.useState(props.attributeId);
  const [attributeLabels, setAttributeLabels] = React.useState([]);
  const [labels, setLabels] = React.useState(props.labels);

  let diatum: Diatum = useDiatum();

  const updateAssigned = () => {
    diatum.getAttributeLabels(attributeId).then(l => {
      setAttributeLabels(l);
      props.callback(l);
    }).catch(err => {
      console.log(err);
    });
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
  const [params, setParams] = React.useState(route.params);

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
  };

  return (
    <View style={{ flex: 1 }} >
      <AttributeDrawer.Navigator navigationOptions={{title: 'ro'}} drawerPosition={'right'} drawerContent={(props) => <AttributeDrawerContent {...props} {...{attributeId: route.params.attributeId, callback: onLabel}} />}>
        <AttributeDrawer.Screen name="Contacts">{(props) => {
          if(AttributeUtil.isWebsite(params)) {
            return (<MyWebsite params={params} navigation={navigation} />)
          }
          return (
            <MyAttributePage params={params} navigation={navigation} />
          )
        }}</AttributeDrawer.Screen>
      </AttributeDrawer.Navigator>
    </View>
  )
}

function MyWebsite({params, navigation}) {
  const [name, setName] = React.useState(params.data.name);
  const [url, setUrl] = React.useState(params.data.url);

  const onSave = () => {
    console.log("SAVE WEBSITE");
  };

  React.useLayoutEffect(() => {
    const save = (<Icon name="save" onPress={onSave} style={{ color: '#0077CC', fontSize: 24, width: 48, textAlign: 'center' }} />);
    navigation.setOptions({ title: 'Website', headerRight: () => save });
  }, [navigation]);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#aaaaaa', alignItems: 'center', padding: 16 }}>
      <Text style={{ textAlign: 'center', fontSize: 18, color: '#222222' }}>Enter your contact data and assign lables from the right menu.</Text>
      <TextInput style={{ backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', padding: 8, marginTop: 16, width: '100%', borderRadius: 4 }} placeholder="Name" placeholderTextColor="#444444" onChangeText={setName} value={name} />
      <TextInput style={{ backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', padding: 8, marginTop: 16, width: '100%', borderRadius: 4 }} placeholder="URL" placeholderTextColor="#444444" onChangeText={setUrl} value={url} />
    </KeyboardAvoidingView>
  );
}

function MyAttributePage({params, navigation}) {
  const [data, setData] = React.useState(params.data);

  React.useLayoutEffect(() => {
    const save = (<Icon name="save" style={{ color: '#0077CC', fontSize: 24, width: 48, textAlign: 'center' }} />);
    if(AttributeUtil.isCard(params)) {
      navigation.setOptions({ title: 'Business Card', headerRight: () => save });
    }
    else if(AttributeUtil.isEmail(params)) {
      navigation.setOptions({ title: 'Email Address', headerRight: () => save });
    }
    else if(AttributeUtil.isPhone(params)) {
      navigation.setOptions({ title: 'Phone Number', headerRight: () => save });
    }
    else if(AttributeUtil.isHome(params)) {
      navigation.setOptions({ title: 'Home Address', headerRight: () => save });
    }
    else if(AttributeUtil.isSocial(params)) {
      navigation.setOptions({ title: 'Social & Messaging', headerRight: () => save });
    }
    else {
      navigation.setOptions({ title: 'Attribute', headerRight: () => save });
    }
  }, [navigation]);

  if(AttributeUtil.isCard(params)) {
    return (<></>);
  }
  if(AttributeUtil.isEmail(params)) {
    return (<></>);
  }
  if(AttributeUtil.isPhone(params)) {
    return (<></>);
  }
  if(AttributeUtil.isHome(params)) {
    return (<></>);
  }
  if(AttributeUtil.isSocial(params)) {
    return (<></>);
  }
  return (<></>);
}
