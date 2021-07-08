import 'react-native-gesture-handler';
import React, { useEffect, forwardRef, useRef, useImperativeHandle } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Animated, Dimensions, Platform, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, TextInput, Image, FlatList, Button, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View, ImageBackground, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import OptionsMenu from "react-native-option-menu";

import { Latch, useLatch } from './LatchContext';
import { Diatum, DiatumEvent } from '../diatum/Diatum';
import { AttachCode, getAttachCode } from '../diatum/DiatumUtil';
import { DiatumSession, LabelEntry, Attribute } from '../diatum/DiatumTypes';
import { DiatumProvider, useDiatum } from "../diatum/DiatumContext";
import { IndiViewCom } from "./IndiViewCom";
import { AttributeUtil } from './AttributeUtil';

const ProfileDrawer = createDrawerNavigator();
let contactNav = null;

function ProfileDrawerContent(props) {

  contactNav = props.navigation;
  const [amigoId, setAmigoId] = React.useState(props.amigoId);
  const [amigoLabels, setAmigoLabels] = React.useState([]);
  const [labels, setLabels] = React.useState(props.labels);

  let diatum: Diatum = useDiatum();

  const updateAssigned = () => {
    diatum.getContactLabels(amigoId).then(l => {
      setAmigoLabels(l);
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
    diatum.setListener(DiatumEvent.Amigos, updateAssigned);
    return () => {
      diatum.clearListener(DiatumEvent.Labels, updateList);
      diatum.clearListener(DiatumEvent.Amigos, updateAssigned);
    }
  }, []);

  const setLabel = async (id: string) => {
    try {
      await diatum.setContactLabel(amigoId, id);
    }
    catch(err) {
      console.log(err);
      Alert.alert("failed to set label");
    }
  }

  const clearLabel = async (id: string) => {
    try {
      await diatum.clearContactLabel(amigoId, id);
    }
    catch(err) {
      console.log(err);
      Alert.alert("failed to clear label");
    }
  }

  const hasLabel = (id: string) => {
    for(let i = 0; i < amigoLabels.length; i++) {
      if(amigoLabels[i] == id) {
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

export function ContactProfile({ route, navigation }) {
  const [contact, setContact] = React.useState(route.params);
  const [amigoLabels, setAmigoLabels] = React.useState([]);
  const [labels, setLabels] = React.useState([]);
  const [amigoId, setAmigoId] = React.useState(route.params.amigoId);
  const [latchColor, setLatchColor] = React.useState('#282827');

  // setup screen header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: contact.handle,
      headerRight: () => (
        <Icon name="ellipsis-v" style={{ color: '#444444', fontSize: 24, paddingRight: 16 }} onPress={() => console.log("TAPPED")} />
      ),
    });
  }, [navigation]);

 let latch: Latch = useLatch();
  
  const onLatch = () => {
    contactNav.toggleDrawer();
  };
  
  useEffect(() => { 
    const unfocus = navigation.addListener('focus', () => {
      latch.setToggleListener(onLatch, latchColor);
    });
    return (() => {
      latch.clearToggleListener(onLatch);
      unfocus();
    }) 
  }, [navigation]);
 
  const onLabel = (labels: string[]) => {
    if(labels == null || labels.length == 0) {
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
      <ProfileDrawer.Navigator navigationOptions={{title: 'ro'}} drawerPosition={'right'} drawerContent={(props) => <ProfileDrawerContent {...props} {...{amigoId: amigoId, callback: onLabel}} />}>
        <ProfileDrawer.Screen name="Contacts">{(props) => {
          return (
            <View style={{ flex: 1 }}>
              <ContactProfilePage entry={contact} />
            </View>
          )
        }}</ProfileDrawer.Screen>
      </ProfileDrawer.Navigator>
    </View>
  )
}

export function ContactProfilePage({ entry }) {

  const [contact, setContact] = React.useState(entry);
  const [attributes, setAttributes] = React.useState([]);
  const [profileColor, setProfileColor] = React.useState('#aaaaaa');

  // retrieve attributes
  let diatum: Diatum = useDiatum();
  const updateContact = async (amigoId: string) => {
    try {
      let a: Attribute[] = await diatum.getContactAttributes(contact.amigoId);
      setAttributes(a);
    }
    catch(err) {
      console.log(err);
      setAttributes([]);
    }
  };
  const updateAmigo = async () => {
    try {
      let c: ContactEntry = await diatum.getContact(contact.amigoId);
      setContact(c);
    }
    catch(err) {
      console.log(err);
    }
  };

  // update border color on error
  useEffect(() => {
    if(contact.errorFlag) {
      setProfileColor('#dd8888');
    }
    else {
      setProfileColor('#aaaaaa');
    }
  }); 

  // register event to update attributes
  useEffect(() => {
    diatum.setListener(DiatumEvent.Contact, updateContact);
    diatum.setListener(DiatumEvent.Amigos, updateAmigo);
    return async () => {
      await diatum.clearListener(DiatumEvent.Contact, updateContact);
      await diatum.clearListener(DiatumEvent.Amigos, updateAmigo);
    }
  }, []);

  let imgSrc = {};
  if(contact.imageUrl == null) {
    imgSrc = require('../assets/avatar.png');
  }
  else {
    imgSrc = { uri: contact.imageUrl, cache: 'force-cache' };
  }

  const ContactName = () => {
    if(contact.name != null) {
      return (<Text style={{ fontSize: 20, fontWeight: 'bold', color: '#222222' }}>{ contact.name }</Text>);
    }
    else {
      return (<Text style={{ fontSize: 20, fontWeight: 'bold', color: '#aaaaaa' }}>No Name</Text>);
    }
  }

  const ContactStatus = () => {
    if(contact.status == 'connected') {
      return (
        <Text style={{ fontSize: 12 }}>
          <Text style={{ color: "#0077CC" }}>[Connected]</Text>
        </Text>
      ); 
    }
    else if(contact.status == 'received') {
      return (
        <Text style={{ fontSize: 12 }}>
          <Text style={{ color: "#FF8000" }}>(Request Received)</Text>
        </Text>
      ); 
    }
    else if(contact.status == 'requested') {
      return (
        <Text style={{ fontSize: 12 }}>
          <Text style={{ color: "#FF8000" }}>(Request Sent)</Text>
        </Text>
      ); 
    }
    else {
      return (
        <Text style={{ fontSize: 12 }}>
          <Text style={{ color: "#444444" }}>(Profile Saved)</Text>
        </Text>
      ); 
    }
  }

  const ContactNotes = () => {
    if(contact.notes != null) {
      return (
        <View style={{ marginTop: 16, width: '100%' }}>
          <View style={{ width: '100%', alignItems: 'center' }}><Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Notes</Text></View>
          <View style={{ marginLeft: 32, marginRight: 32, marginTop: 0, paddingTop: 8, paddingBottom: 8, paddingLeft: 16, paddingRight: 16, flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#aaaaaa' }}>
            <Text style={{ color: '#222222' }}>{contact.notes}</Text>
          </View>
        </View>
      ); 
    }
    else {
      return (<></>);
    }
  }

  const ContactAttributes = () => {
    if(attributes.length > 0) { 
      return (
        <View style={{ flex: 1, marginBottom: 16, marginTop: 16, width: '100%' }}>
          <View style={{ width: '100%', alignItems: 'center' }}><Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Contact Info</Text></View>
          <View style={{ marginBottom: 16 }}>
            <FlatList style={{ marginLeft: 32, marginRight: 32, marginTop: 0, backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#aaaaaa' }} data={attributes} keyExtractor={item => item.attributeId} renderItem={({item}) => <AttributeEntry item={item} /> } />
          </View>
        </View>
      )
    }
    else {
      return (<></>)
    }
  }

  const ProfileDescription = () => {
    if(entry.description == null) {
      return (<></>);
    }
    return (
      <Text style={{ marginTop: 16, marginLeft: 8, marginRight: 8, textAlign: 'center' }}>{ contact.description }</Text>
    );
  };
  
  return (
    <View style={{ flex: 1, backgroundColor: '#aaaaaa', alignItems: 'center' }}>

      <View style={{ flexDirection: 'row', padding: 12, marginTop: 16, marginLeft: 16, marginRight: 16, borderRadius: 8, backgroundColor: '#ffffff', borderWidth: 2, borderColor: profileColor }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row' }}>
            <Image style={{ flex: 2, maxWidth: 256, borderRadius: 4, aspectRatio: 1 }} source={imgSrc}/>
            <View style={{ flex: 3, alignItems: 'center', justifyContent: 'center' }}>
              <ContactName />
              <ContactStatus />
              <Text style={{ color: '#222222', marginTop: 8 }}>{ entry.location }</Text>
              <ProfileDescription />
            </View>
          </View>
        </View>
      </View>

      <ContactNotes />

      <ContactAttributes />
    </View>
  )
}

function AttributeEntry({item}) {
  const [data, setData] = React.useState({});

  useEffect(() => {
    if(item.data != null) {
      setData(JSON.parse(item.data));
    }
    else {
      setData({});
    }
  }, []);

  const CardCompanyName = () => {
    if(data.companyName != null) {
      return (<Text>{data.companyName}</Text>);
    }
    return (<></>);
  }
  const CardProfessionName = () => {
    if(data.professionName != null) {
      return (<Text>{data.professionName}</Text>);
    }
    return (<></>);
  }
  const CardTitle = () => {
    if(data.title != null) {
      return (<Text>{data.title}</Text>);
    }
    return (<></>);
  }
  const CardWebsite = () => {
    if(data.website != null) {
      return (
        <View style={{ flexDirection: 'row', paddingLeft: 4, paddingTop: 8 }}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="circle" style={{ color: '#888888', fontSize: 8, marginRight: 16 }} />
          </View>
          <Text style={{ flexGrow: 1 }}>{ data.website }</Text>
          <Icon name="external-link" style={{ color: '#0077CC', fontSize: 20 }} onPress={() => console.log("TAPPED")} />
        </View>
      );
    }
    return (<></>);
  }
  const CardAddress = () => {
    if(data.streetPo != null || data.cityTown != null || data.provinceStateCounty != null || data.postalCode != null || data.country != null) {
      return (
        <View style={{ flexDirection: 'row', paddingLeft: 4, paddingTop: 8 }}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="circle" style={{ color: '#888888', fontSize: 8, marginRight: 16 }} />
          </View>
          <View style={{ flexGrow: 1 }}>
            <Text>{ data.streetPo }</Text>
            <Text>{ data.cityTown }&nbsp;{ data.provinceStateCounty}&nbsp;&nbsp;{data.postalCode}</Text>
            <Text>{ data.country }</Text>
          </View>
          <View style={{ justifyContent: 'center' }}>
            <Icon name="map-marker" style={{ color: '#0077CC', fontSize: 20 }} onPress={() => console.log("TAPPED")} />
          </View>
        </View>
      );
    }
    return (<></>);
  } 
  const CardEmail = () => {
    if(data.email != null) {
      return (
        <View style={{ flexDirection: 'row', paddingLeft: 4, paddingTop: 8 }}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="circle" style={{ color: '#888888', fontSize: 8, marginRight: 16 }} />
          </View>
          <Text style={{ flexGrow: 1 }}>{ data.email }</Text>
          <Icon name="envelope-o" style={{ color: '#0077CC', fontSize: 20 }} onPress={() => console.log("TAPPED")} />
        </View>
      );
    }
    return (<></>);
  }
  const CardDirectPhoneSms = () => {
    if(data.directPhoneSms == true) {
      return (
        <Icon name="tty" style={{ color: '#0077CC', fontSize: 20, marginLeft: 32 }} onPress={() => console.log("TAPPED")} />
      );
    }
    return (<></>);
  }
  const CardDirectPhone = () => {
    if(data.directPhone != null) {
      return (
        <View style={{ flexDirection: 'row', paddingLeft: 4, paddingTop: 8 }}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="circle" style={{ color: '#888888', fontSize: 8, marginRight: 16 }} />
          </View>
          <View style={{ flexGrow: 1 }}>
            <Text>Direct Phone</Text>
            <Text style={{ color: '#444444' }}>{ data.directPhone }</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="phone" style={{ color: '#0077CC', fontSize: 20 }} onPress={() => console.log("TAPPED")} />
            <CardDirectPhoneSms />
          </View>
        </View>
      );
    }
    return (<></>);
  }
  const CardMainPhoneSms = () => {
    if(data.mainPhoneSms == true) {
      return (
        <Icon name="tty" style={{ color: '#0077CC', fontSize: 20, marginLeft: 32 }} onPress={() => console.log("TAPPED")} />
      );
    }
    return (<></>);
  }
  const CardMainPhone = () => {
    if(data.mainPhone != null) {
      return (
        <View style={{ flexDirection: 'row', paddingLeft: 4, paddingTop: 8 }}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="circle" style={{ color: '#888888', fontSize: 8, marginRight: 16 }} />
          </View>
          <View style={{ flexGrow: 1 }}>
            <Text>Main Phone</Text>
            <Text style={{ color: '#444444' }}>{ data.mainPhone }</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="phone" style={{ color: '#0077CC', fontSize: 20 }} onPress={() => console.log("TAPPED")} />
            <CardDirectPhoneSms />
          </View>
        </View>
      );
    }
    return (<></>);
  }
  const CardMobilePhoneSms = () => {
    if(data.mobilePhoneSms == true) {
      return (
        <Icon name="tty" style={{ color: '#0077CC', fontSize: 20, marginLeft: 32 }} onPress={() => console.log("TAPPED")} />
      );
    }
    return (<></>);
  }
  const CardMobilePhone = () => {
    if(data.mobilePhone != null) {
      return (
        <View style={{ flexDirection: 'row', paddingLeft: 4, paddingTop: 8 }}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="circle" style={{ color: '#888888', fontSize: 8, marginRight: 16 }} />
          </View>
          <View style={{ flexGrow: 1 }}>
            <Text>Mobile Phone</Text>
            <Text style={{ color: '#444444' }}>{ data.mobilePhone }</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="phone" style={{ color: '#0077CC', fontSize: 20 }} onPress={() => console.log("TAPPED")} />
            <CardDirectPhoneSms />
          </View>
        </View>
      );
    }
    return (<></>);
  }
  const HomePhoneSms = () => {
    if(data.phoneNumberSms == true) {
      return (
        <Icon name="tty" style={{ color: '#0077CC', fontSize: 20, marginLeft: 32 }} onPress={() => console.log("TAPPED")} />
      );
    }
    return (<></>);
  }
  const HomePhone = () => {
    if(data.phoneNumber != null) {
      return (
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flexGrow: 1 }}>
            <Text>Home Phone</Text>
            <Text style={{ color: '#444444' }}>{ data.phoneNumber }</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="phone" style={{ color: '#0077CC', fontSize: 20 }} onPress={() => console.log("TAPPED")} />
            <HomePhoneSms />
          </View>
        </View>
      );
    }
    return (<></>);
  }
  const HomeAddress = () => {
    if(data.homeAddress != null) {
      let a = data.homeAddress;
      if(a.streetPo != null || a.cityTown != null || a.provinceStateCounty != null || a.postalCode != null || a.country != null) {
        return (
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flexGrow: 1 }}>
              <Text>{ a.streetPo }</Text>
              <Text>{ a.cityTown }{ a.provinceStateCounty}&nbsp{a.postalCode}</Text>
              <Text>{ a.country }</Text>
            </View>
            <View style={{ justifyContent: 'center' }}>
              <Icon name="map-marker" style={{ color: '#0077CC', fontSize: 20 }} onPress={() => console.log("TAPPED")} />
            </View>
          </View>
        );
      }
    }
    return (<></>);
  } 
  const PhoneSms = () => {
    if(data.phoneSms == true) {
      return (
        <Icon name="tty" style={{ color: '#0077CC', fontSize: 20, marginLeft: 32 }} onPress={() => console.log("TAPPED")} />
      );
    }
    return (<></>);
  }

  const onAttribute = () => {
    return (
      <View style={{ padding: 12 }}>
        <CardProfessionName />
        <CardTitle />
        <CardWebsite />
        <CardAddress />
        <CardEmail />
        <CardMainPhone />
        <CardDirectPhone />
        <CardMobilePhone />
      </View>
    );
  };

  if(AttributeUtil.isHome(item)) {
    return (
      <View style={{ padding: 12 }}>
        <HomePhone />
        <HomeAddress />
      </View>
    );
  }
  else if(AttributeUtil.isSocial(item)) {
    return (
      <View style={{ flexDirection: 'row', padding: 12 }}>
        <View style={{ flexGrow: 1 }}>
          <Text>{data.category}</Text>
          <Text style={{ color: '#444444' }}>{data.link}</Text>
        </View>
        <View style={{ justifyContent: 'center' }}>
          <Icon name="copy" style={{ color: '#0077CC', fontSize: 20 }} onPress={() => console.log("TAPPED")} />
        </View>
      </View>
    );
  }
  else if(AttributeUtil.isEmail(item)) {
    return (
      <View style={{ flexDirection: 'row', padding: 12 }}>
        <View style={{ flexGrow: 1 }}>
          <Text>{data.category} Email</Text>
          <Text style={{ color: '#444444' }}>{data.email}</Text>
        </View>
        <View style={{ justifyContent: 'center' }}>
          <Icon name="envelope-o" style={{ color: '#0077CC', fontSize: 20 }} onPress={() => console.log("TAPPED")} />
        </View>
      </View>
    );
  }
  else if(AttributeUtil.isCard(item)) {
    return (
      <View style={{ padding: 12 }}>
        <CardCompanyName />
        <CardProfessionName />
        <CardTitle />
        <CardWebsite />
        <CardAddress />
        <CardEmail />
        <CardMainPhone />
        <CardDirectPhone />
        <CardMobilePhone />
      </View>
    );
  }
  else if(AttributeUtil.isPhone(item)) {
    return (
      <View style={{ flexDirection: 'row', padding: 12 }}>
        <View style={{ flexGrow: 1 }}>
          <Text>{data.type} Phone</Text>
          <Text style={{ color: '#444444' }}>{data.phone}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="phone" style={{ color: '#0077CC', fontSize: 20 }} onPress={() => console.log("TAPPED")} />
          <PhoneSms />
        </View>
      </View>
    );
  }
  else if(AttributeUtil.isWebsite(item)) {
    return (
      <View style={{ flexDirection: 'row', padding: 12 }}>
        <View style={{ flexGrow: 1 }}>
          <Text>{data.name}</Text>
          <Text style={{ color: '#444444' }}>{data.url}</Text>
        </View>
        <View style={{ justifyContent: 'center' }}>
          <Icon name="external-link" style={{ color: '#0077CC', fontSize: 20 }} onPress={() => console.log("TAPPED")} />
        </View>
      </View>
    );
  }
  else {
    return (<Text>TEXT</Text>);
  }
}

