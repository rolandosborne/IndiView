import 'react-native-gesture-handler';
import React, { useEffect, forwardRef, useRef, useImperativeHandle } from 'react';
import { SafeAreaView, Modal, Alert, Animated, Dimensions, Platform, Clipboard, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, TextInput, Image, FlatList, Button, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View, ImageBackground, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import OptionsMenu from "react-native-option-menu";
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

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
      await diatum.setAttributeLabel(attributeId, id);
    }
    catch(err) {
      console.log(err);
      Alert.alert("failed to set label");
    }
  }

  const clearLabel = async (id: string) => {
    try {
      await diatum.clearAttributeLabel(attributeId, id);
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
        <View style={{ width: '100%', backgroundColor: '#282827', alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
          <Icon name="tag" style={{ marginLeft: 16, fontSize: 18, color: '#ffffff' }} />
          <DrawerItem style={{ flex: 1 }} labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#ffffff', backgroundColor: '#282827', textAlign: 'left' }} label={'Assigned Labels'} />
        </View>
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
            return (
              <View style={{ flex: 1, backgroundColor: '#aaaaaa' }}>
                <MyWebsite params={params} navigation={navigation} />
              </View>
            );
          }
          else if(AttributeUtil.isSocial(params)) {
            return (
              <View style={{ flex: 1, backgroundColor: '#aaaaaa' }}>
                <MySocial params={params} navigation={navigation} />
              </View>
            );
          }
          else if(AttributeUtil.isPhone(params)) {
            return (
              <View style={{ flex: 1, backgroundColor: '#aaaaaa' }}>
                <MyPhone params={params} navigation={navigation} />
              </View>
            );
          }
          else if(AttributeUtil.isEmail(params)) {
            return (
              <View style={{ flex: 1, backgroundColor: '#aaaaaa' }}>
                <MyEmail params={params} navigation={navigation} />
              </View>
            );
          }
          else if(AttributeUtil.isHome(params)) {
            return (
              <View style={{ flex: 1, backgroundColor: '#aaaaaa' }}>
                <MyHome params={params} navigation={navigation} />
              </View>
            );
          }
          else if(AttributeUtil.isCard(params)) {
            return (
              <View style={{ flexGrow: 1, backgroundColor: '#aaaaaa', paddingLeft: 16, paddingRight: 16 }}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={128} style={{ flex: 1 }} >
                  <MyCard params={params} navigation={navigation} />
                </KeyboardAvoidingView>
                <LinearGradient colors={['rgba(176,176,176,0)', 'rgba(176,176,176,1)']} style={{ position: 'absolute', width: '100%', height: 32, left: 0, bottom: 0 }} />
              </View>
            );
          }
          return (<></>)
        }}</AttributeDrawer.Screen>
      </AttributeDrawer.Navigator>
    </View>
  )
}

function MyWebsite({params, navigation}) {
  const [attributeId, setAttributeId] = React.useState(params.attributeId);
  const [schema, setSchema] = React.useState(params.schema);
  const [name, setName] = React.useState(params.data.name);
  const [url, setUrl] = React.useState(params.data.url);
  const [busy, setBusy] = React.useState(false);

  let nameRef = useRef(params.data.name);
  let urlRef = useRef(params.data.url);

  let diatum = useDiatum();
  const onSave = async () => {
    setBusy(true);
    try {
      await diatum.setAttribute(attributeId, schema, JSON.stringify({ name: nameRef.current, url: urlRef.current }));
    }
    catch(err) {
      console.log(err);
      Alert.alert("Failed to save attribute");
    }
    setBusy(false);
  };

  React.useLayoutEffect(() => {
    let save;
    if(busy) {
      save = (<ActivityIndicator style={{ alignSelf: 'center', width: 48 }} animating={true} size="small" color="#777777" />)
    }
    else {
      save = (
        <TouchableOpacity onPress={onSave}>
          <Icon name="save" style={{ color: '#0077CC', fontSize: 24, width: 48, textAlign: 'center' }} />
        </TouchableOpacity>
      );
    }
    navigation.setOptions({ title: 'Website', headerRight: () => save });
  }, [navigation, busy]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ alignItems: 'center', padding: 16 }}>
      <TextInput style={{ backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', padding: 8, marginTop: 16, width: '100%', borderRadius: 4 }} placeholder="Name" placeholderTextColor="#444444" onChangeText={value => {nameRef.current=value; setName(value)}} value={name} />
      <TextInput style={{ backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', padding: 8, marginTop: 16, width: '100%', borderRadius: 4 }} placeholder="URL" placeholderTextColor="#444444" onChangeText={value => {urlRef.current=value; setUrl(value)}} value={url} />
    </KeyboardAvoidingView>
  );
}

function MySocial({params, navigation}) {
  const [attributeId, setAttributeId] = React.useState(params.attributeId);
  const [schema, setSchema] = React.useState(params.schema);
  const [category, setCategory] = React.useState(params.data.category);
  const [link, setLink] = React.useState(params.data.link);
  const [busy, setBusy] = React.useState(false);

  let categoryRef = useRef(params.data.category);
  let linkRef = useRef(params.data.link);

  let diatum = useDiatum();
  const onSave = async () => {
    setBusy(true);
    try {
      await diatum.setAttribute(attributeId, schema, JSON.stringify({ category: categoryRef.current, link: linkRef.current }));
    }
    catch(err) {
      console.log(err);
      Alert.alert("Failed to save attribute");
    }
    setBusy(false);
  };

  React.useLayoutEffect(() => {
    let save;
    if(busy) {
      save = (<ActivityIndicator style={{ alignSelf: 'center', width: 48 }} animating={true} size="small" color="#777777" />)
    }
    else {
      save = (
        <TouchableOpacity onPress={onSave}>
          <Icon name="save" style={{ color: '#0077CC', fontSize: 24, width: 48, textAlign: 'center' }} />
        </TouchableOpacity>
      );
    }
    navigation.setOptions({ title: 'Social & Messaging', headerRight: () => save });
  }, [navigation]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ alignItems: 'center', padding: 16 }}>
      <TextInput style={{ backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', padding: 8, marginTop: 16, width: '100%', borderRadius: 4 }} placeholder="Category" placeholderTextColor="#444444" onChangeText={value => {categoryRef.current=value; setCategory(value)}} value={category} />
      <TextInput style={{ backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', padding: 8, marginTop: 16, width: '100%', borderRadius: 4 }} placeholder="Handle" placeholderTextColor="#444444" onChangeText={value => {linkRef.current=value; setLink(value)}} value={link} />
    </KeyboardAvoidingView>
  );
}

function MyEmail({params, navigation}) {
  const [attributeId, setAttributeId] = React.useState(params.attributeId);
  const [schema, setSchema] = React.useState(params.schema);
  const [category, setCategory] = React.useState(params.data.category);
  const [email, setEmail] = React.useState(params.data.email);
  const [busy, setBusy] = React.useState(false);

  let categoryRef = useRef(params.data.category);
  let emailRef = useRef(params.data.email);

  let diatum = useDiatum();
  const onSave = async () => {
    setBusy(true);
    try {
      await diatum.setAttribute(attributeId, schema, JSON.stringify({ category: categoryRef.current, email: emailRef.current }));
    }
    catch(err) {
      console.log(err);
      Alert.alert("Failed to save attribute");
    }
    setBusy(false);
  };

  React.useLayoutEffect(() => {
    let save;
    if(busy) {
      save = (<ActivityIndicator style={{ alignSelf: 'center', width: 48 }} animating={true} size="small" color="#777777" />)
    }
    else {
      save = (
        <TouchableOpacity onPress={onSave}>
          <Icon name="save" style={{ color: '#0077CC', fontSize: 24, width: 48, textAlign: 'center' }} />
        </TouchableOpacity>
      );
    }
    navigation.setOptions({ title: 'Email Address', headerRight: () => save });
  }, [navigation, busy]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ alignItems: 'center', padding: 16 }}>
      <TextInput style={{ backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', padding: 8, marginTop: 16, width: '100%', borderRadius: 4 }} placeholder="Category" placeholderTextColor="#444444" onChangeText={value => {categoryRef.current=value; setCategory(value)}} value={category} />
      <TextInput style={{ backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', padding: 8, marginTop: 16, width: '100%', borderRadius: 4 }} placeholder="Email Address" autoCorrect={false} autoCapitalize="none" placeholderTextColor="#444444" onChangeText={value => {emailRef.current=value; setEmail(value)}} value={email} />
    </KeyboardAvoidingView>
  );
}


function MyPhone({params, navigation}) {
  const [attributeId, setAttributeId] = React.useState(params.attributeId);
  const [schema, setSchema] = React.useState(params.schema);
  const [category, setCategory] = React.useState(params.data.category);
  const [phone, setPhone] = React.useState(params.data.phone);
  const [sms, setSms] = React.useState(params.data.phoneSms);
  const [busy, setBusy] = React.useState(false);

  let categoryRef = useRef(params.data.category);
  let phoneRef = useRef(params.data.phone);
  let smsRef = useRef(params.data.phoneSms);

  let diatum = useDiatum();
  const onSave = async () => {
    setBusy(true);
    try {
      await diatum.setAttribute(attributeId, schema, JSON.stringify({ category: categoryRef.current, phone: phoneRef.current, phoneSms: smsRef.current }));
    }
    catch(err) {
      console.log(err);
      Alert.alert("Failed to save attribute");
    }
    setBusy(false);
  };

  const PhoneSms = () => {
    if(sms) {
      return (
        <TouchableOpacity onPress={() => {smsRef.current=false; setSms(false)}}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="check-square-o" style={{ marginRight: 8, fontSize: 20, width: 16, color: '#0077CC' }} />
            <Text style={{ color: '#444444', fontSize: 14 }}>SMS</Text>
          </View>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity onPress={() => {smsRef.current=true; setSms(true)}}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="square-o" style={{ marginRight: 8, fontSize: 20, width: 16, color: '#0077CC' }} />
          <Text style={{ color: '#444444', fontSize: 14 }}>SMS</Text>
        </View>
      </TouchableOpacity>
    );
  };

  React.useLayoutEffect(() => {
    let save;
    if(busy) {
      save = (<ActivityIndicator style={{ alignSelf: 'center', width: 48 }} animating={true} size="small" color="#777777" />)
    }
    else {
      save = (
        <TouchableOpacity onPress={onSave}>
          <Icon name="save" style={{ color: '#0077CC', fontSize: 24, width: 48, textAlign: 'center' }} />
        </TouchableOpacity>
      );
    }
    navigation.setOptions({ title: 'Phone Number', headerRight: () => save });
  }, [navigation, busy]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ alignItems: 'center', padding: 16 }}>
      <TextInput style={{ backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', padding: 8, marginTop: 16, width: '100%', borderRadius: 4 }} placeholder="Category (Mobile, Personal, Work)" placeholderTextColor="#444444" onChangeText={value => {categoryRef.current=value; setCategory(value)}} value={category} />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, marginRight: 16 }}>
        <TextInput style={{ flexGrow: 1, backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', padding: 8, marginRight: 16, borderRadius: 4 }} placeholder="Phone Number" placeholderTextColor="#444444" onChangeText={value => {phoneRef.current=value; setPhone(value)}} value={phone} />
        <PhoneSms />
      </View>
    </KeyboardAvoidingView>
  );
}

function MyHome({params, navigation}) {
  const [attributeId, setAttributeId] = React.useState(params.attributeId);
  const [schema, setSchema] = React.useState(params.schema);
  const [name, setName] = React.useState(params.data.name);
  const [phone, setPhone] = React.useState(params.data.phoneNumber);
  const [sms, setSms] = React.useState(params.data.phoneNumberSms);
  const [street, setStreet] = React.useState(params.data.homeAddress==null?null:params.data.homeAddress.streetPo);
  const [city, setCity] = React.useState(params.data.homeAddress==null?null:params.data.homeAddress.cityTown);
  const [state, setState] = React.useState(params.data.homeAddress==null?null:params.data.homeAddress.provinceStateCounty);
  const [code, setCode] = React.useState(params.data.homeAddress==null?null:params.data.homeAddress.postalCode);
  const [country, setCountry] = React.useState(params.data.homeAddress==null?null:params.data.homeAddress.country);
  const [busy, setBusy] = React.useState(false);

  let nameRef = useRef(name);
  let phoneRef = useRef(phone);
  let smsRef = useRef(sms);
  let streetRef = useRef(street); 
  let cityRef = useRef(city); 
  let stateRef = useRef(state); 
  let codeRef = useRef(code); 
  let countryRef = useRef(country); 

  let diatum = useDiatum();
  const onSave = async () => {
    setBusy(true);
    try {
      await diatum.setAttribute(attributeId, schema, JSON.stringify({ name: nameRef.current, phoneNumber: phoneRef.current, phoneNumberSms: smsRef.current, homeAddress: {
        streetPo: streetRef.current, cityTown: cityRef.current, provinceStateCounty: stateRef.current, postalCode: codeRef.current, country: countryRef.current } }));
    }
    catch(err) {
      console.log(err);
      Alert.alert("Failed to save attribute");
    }
    setBusy(false);
  };

  const PhoneSms = () => {
    if(sms) {
      return (
        <TouchableOpacity onPress={() => {smsRef.current=false; setSms(false)}}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="check-square-o" style={{ marginRight: 8, fontSize: 20, width: 16, color: '#0077CC' }} />
            <Text style={{ color: '#444444', fontSize: 14 }}>SMS</Text>
          </View>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity onPress={() => {smsRef.current=true; setSms(true)}}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="square-o" style={{ marginRight: 8, fontSize: 20, width: 16, color: '#0077CC' }} />
          <Text style={{ color: '#444444', fontSize: 14 }}>SMS</Text>
        </View>
      </TouchableOpacity>
    );
  };

  React.useLayoutEffect(() => {
    let save;
    if(busy) {
      save = (<ActivityIndicator style={{ alignSelf: 'center', width: 48 }} animating={true} size="small" color="#777777" />)
    }
    else {
      save = (
        <TouchableOpacity onPress={onSave}>
          <Icon name="save" style={{ color: '#0077CC', fontSize: 24, width: 48, textAlign: 'center' }} />
        </TouchableOpacity>
      );
    }
    navigation.setOptions({ title: 'Home Location', headerRight: () => save });
  }, [navigation, busy]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ alignItems: 'center', padding: 16 }}>
      <TextInput style={{ backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', padding: 8, marginTop: 16, width: '100%', borderRadius: 4 }} placeholder="Location Name" placeholderTextColor="#444444" onChangeText={value => {nameRef.current=value; setName(value)}} value={name} />
      <TextInput style={{ backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', padding: 8, marginTop: 16, width: '100%', borderRadius: 4 }} placeholder="Street or PO Box" placeholderTextColor="#444444" onChangeText={value => {streetRef.current=value; setStreet(value)}} value={street} />
      <TextInput style={{ backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', padding: 8, marginTop: 16, width: '100%', borderRadius: 4 }} placeholder="City or Town" placeholderTextColor="#444444" onChangeText={value => {cityRef.current=value; setCity(value)}} value={city} />
      <TextInput style={{ backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', padding: 8, marginTop: 16, width: '100%', borderRadius: 4 }} placeholder="State, Province, or County" placeholderTextColor="#444444" onChangeText={value => {stateRef.current=value; setState(value)}} value={state} />
      <TextInput style={{ backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', padding: 8, marginTop: 16, width: '100%', borderRadius: 4 }} placeholder="Postal Code" placeholderTextColor="#444444" onChangeText={value => {codeRef.current=value; setCode(value)}} value={code} />
      <TextInput style={{ backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', padding: 8, marginTop: 16, width: '100%', borderRadius: 4 }} placeholder="Country" placeholderTextColor="#444444" onChangeText={value => {countryRef.current=value; setCountry(value)}} value={country} />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, marginRight: 16 }}>
        <TextInput style={{ flexGrow: 1, backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', padding: 8, marginRight: 16, borderRadius: 4 }} placeholder="Phone Number" placeholderTextColor="#444444" onChangeText={value => {phoneRef.current=value; setPhone(value)}} value={phone} />
        <PhoneSms />
      </View>
    </KeyboardAvoidingView>
  );
}

function MyCard({params, navigation}) {
  const [attributeId, setAttributeId] = React.useState(params.attributeId);
  const [schema, setSchema] = React.useState(params.schema);
  const [name, setName] = React.useState(params.data.companyName);
  const [title, setTitle] = React.useState(params.data.title);
  const [formal, setFormal] = React.useState(params.data.professionName);
  const [description, setDescription] = React.useState(params.data.companyDescription);
  const [email, setEmail] = React.useState(params.data.email);
  const [website, setWebsite] = React.useState(params.data.website);
  const [direct, setDirect] = React.useState(params.data.directPhone);
  const [directSms, setDirectSms] = React.useState(params.data.directPhoneSms);
  const [mobile, setMobile] = React.useState(params.data.mobilePhone);
  const [mobileSms, setMobileSms] = React.useState(params.data.mobilePhoneSms);
  const [main, setMain] = React.useState(params.data.mainPhone);
  const [mainSms, setMainSms] = React.useState(params.data.mainPhoneSms);
  const [street, setStreet] = React.useState(params.data.streetPo);
  const [city, setCity] = React.useState(params.data.cityTown);
  const [state, setState] = React.useState(params.data.provinceStateCounty);
  const [code, setCode] = React.useState(params.data.postalCode);
  const [country, setCountry] = React.useState(params.data.country);
  const [busy, setBusy] = React.useState(false);

  let nameRef = useRef(name);
  let titleRef = useRef(title);
  let formalRef = useRef(formal);
  let descriptionRef = useRef(description);
  let emailRef = useRef(email);
  let websiteRef = useRef(website);
  let directRef = useRef(direct);
  let directSmsRef = useRef(directSms);
  let mainRef = useRef(main);
  let mainSmsRef = useRef(mainSms);
  let mobileRef = useRef(mobile);
  let mobileSmsRef = useRef(mobileSms);
  let streetRef = useRef(street); 
  let cityRef = useRef(city); 
  let stateRef = useRef(state); 
  let codeRef = useRef(code); 
  let countryRef = useRef(country); 

  let diatum = useDiatum();
  const onSave = async () => {
    setBusy(true);
    try {
      await diatum.setAttribute(attributeId, schema, JSON.stringify({ companyName: nameRef.current, companyDescription: descriptionRef.current, title: titleRef.current, professionName: formalRef.current, mainPhone: mainRef.current, mainPhoneSms: mainSmsRef.current, mobilePhone: mobileRef.current, mobilePhoneSms: mobileSmsRef.current, directPhone: directRef.current, directPhoneSms: directSmsRef.current, streetPo: streetRef.current, cityTown: cityRef.current, provinceStateCounty: stateRef.current, postalCode: codeRef.current, country: countryRef.current, email: emailRef.current, website: websiteRef.current }));
    }
    catch(err) {
      console.log(err);
      Alert.alert("Failed to save attribute");
    }
    setBusy(false);
  };

  const MainPhoneSms = () => {
    if(mainSms) {
      return (
        <TouchableOpacity onPress={() => {mainSmsRef.current=false; setMainSms(false)}}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="check-square-o" style={{ marginRight: 8, fontSize: 20, width: 16, color: '#0077CC' }} />
            <Text style={{ color: '#444444', fontSize: 14 }}>SMS</Text>
          </View>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity onPress={() => {mainSmsRef.current=true; setMainSms(true)}}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="square-o" style={{ marginRight: 8, fontSize: 20, width: 16, color: '#0077CC' }} />
          <Text style={{ color: '#444444', fontSize: 14 }}>SMS</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const DirectPhoneSms = () => {
    if(directSms) {
      return (
        <TouchableOpacity onPress={() => {directSmsRef.current=false; setDirectSms(false)}}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="check-square-o" style={{ marginRight: 8, fontSize: 20, width: 16, color: '#0077CC' }} />
            <Text style={{ color: '#444444', fontSize: 14 }}>SMS</Text>
          </View>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity onPress={() => {directSmsRef.current=true; setDirectSms(true)}}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="square-o" style={{ marginRight: 8, fontSize: 20, width: 16, color: '#0077CC' }} />
          <Text style={{ color: '#444444', fontSize: 14 }}>SMS</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const MobilePhoneSms = () => {
    if(mobileSms) {
      return (
        <TouchableOpacity onPress={() => {mobileSmsRef.current=false; setMobileSms(false)}}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="check-square-o" style={{ marginRight: 8, fontSize: 20, width: 16, color: '#0077CC' }} />
            <Text style={{ color: '#444444', fontSize: 14 }}>SMS</Text>
          </View>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity onPress={() => {mobileSmsRef.current=true; setMobileSms(true)}}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="square-o" style={{ marginRight: 8, fontSize: 20, width: 16, color: '#0077CC' }} />
          <Text style={{ color: '#444444', fontSize: 14 }}>SMS</Text>
        </View>
      </TouchableOpacity>
    );
  };

  React.useLayoutEffect(() => {
    const save;
    if(busy) {
      save = (<ActivityIndicator style={{ alignSelf: 'center', width: 48 }} animating={true} size="small" color="#777777" />)
    }
    else {
      save = (
        <TouchableOpacity onPress={onSave}>
          <Icon name="save" style={{ color: '#0077CC', fontSize: 24, width: 48, textAlign: 'center' }} />
        </TouchableOpacity>
      );
    }
    navigation.setOptions({ title: 'Business Card', headerRight: () => save });
  }, [navigation, busy]);

  return (
      <ScrollView style={{ paddingTop: 16 }}>
      <TextInput style={{ backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', padding: 8, marginTop: 16, width: '100%', borderRadius: 4 }} placeholder="Company Name" placeholderTextColor="#444444" onChangeText={value => {nameRef.current=value; setName(value)}} value={name} />
      <TextInput style={{ backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', padding: 8, marginTop: 16, width: '100%', borderRadius: 4 }} placeholder="Job Title" placeholderTextColor="#444444" onChangeText={value => {titleRef.current=value; setTitle(value)}} value={title} />
      <TextInput style={{ backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', padding: 8, marginTop: 16, width: '100%', borderRadius: 4 }} placeholder="Professional Name" placeholderTextColor="#444444" onChangeText={value => {formalRef.current=value; setFormal(value)}} value={formal} />
      <TextInput multiline={true} style={{ backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', padding: 8, marginTop: 16, width: '100%', borderRadius: 4 }} placeholder="Company Description" placeholderTextColor="#444444" onChangeText={value => {descriptionRef.current=value; setDescription(value)}} value={description} />
      <TextInput style={{ backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', padding: 8, marginTop: 16, width: '100%', borderRadius: 4 }} autoCapitalize="none" placeholder="Email Address" placeholderTextColor="#444444" onChangeText={value => {emailRef.current=value; setEmail(value)}} value={email} />
      <TextInput style={{ backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', padding: 8, marginTop: 16, width: '100%', borderRadius: 4 }} autoCapitalize="none" placeholder="Website" placeholderTextColor="#444444" onChangeText={value => {websiteRef.current=value; setWebsite(value)}} value={website} />
      <TextInput style={{ backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', padding: 8, marginTop: 16, width: '100%', borderRadius: 4 }} placeholder="Street or PO Box" placeholderTextColor="#444444" onChangeText={value => {streetRef.current=value; setStreet(value)}} value={street} />
      <TextInput style={{ backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', padding: 8, marginTop: 16, width: '100%', borderRadius: 4 }} placeholder="City or Town" placeholderTextColor="#444444" onChangeText={value => {cityRef.current=value; setCity(value)}} value={city} />
      <TextInput style={{ backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', padding: 8, marginTop: 16, width: '100%', borderRadius: 4 }} placeholder="State, Province, or County" placeholderTextColor="#444444" onChangeText={value => {stateRef.current=value; setState(value)}} value={state} />
      <TextInput style={{ backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', padding: 8, marginTop: 16, width: '100%', borderRadius: 4 }} placeholder="Postal Code" placeholderTextColor="#444444" onChangeText={value => {codeRef.current=value; setCode(value)}} value={code} />
      <TextInput style={{ backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', padding: 8, marginTop: 16, width: '100%', borderRadius: 4 }} placeholder="Country" placeholderTextColor="#444444" onChangeText={value => {countryRef.current=value; setCountry(value)}} value={country} />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, marginRight: 16 }}>
        <TextInput style={{ flexGrow: 1, backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', marginRight: 16, padding: 8, borderRadius: 4 }} placeholder="Main Phone Number" placeholderTextColor="#444444" onChangeText={value => {mainRef.current=value; setMain(value)}} value={main} />
        <MainPhoneSms />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, marginRight: 16 }}>
        <TextInput style={{ flexGrow: 1, backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', marginRight: 16, padding: 8, borderRadius: 4 }} placeholder="Direct Phone Number" placeholderTextColor="#444444" onChangeText={value => {directRef.current=value; setDirect(value)}} value={direct} />
        <DirectPhoneSms />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, marginRight: 16 }}>
        <TextInput style={{ flexGrow: 1, backgroundColor: '#ffffff', fontSize: 16, color: '#222222', textAlign: 'left', marginRight: 16, padding: 8, borderRadius: 4 }} placeholder="Mobile Phone Number" placeholderTextColor="#444444" onChangeText={value => {mobileRef.current=value; setMobile(value)}} value={mobile} />
        <MobilePhoneSms />
      </View>
      <View style={{ width: '100%', height: 128 }} />
      </ScrollView>
  );
}
