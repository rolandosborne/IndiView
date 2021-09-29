<p align="center">
  <img src="/docs/photos/logo.png" />
</p>

IndiView is a social media alternative app designed to work with the self-hosted network [Diatum](https://diatum.org). With IndiView, you can maintian your contact list, share pictures and videos, and chat all while having full privacy and control of your data. Your data is transmitted only between self-hosted nodes and your device. IndiView maintains a server only to provide a searchable list of public profiles for when you want to add a new contact. Within the app you seletively share your contact info, photos and videos so your contacts will not all see your identity in the same way. Family may have access to photos or phone numbers that a coworker may not.  

<p align="center">
  <img src="/docs/photos/login.png" width="15%"/>
  <img src="/docs/photos/contacts.png" width="15%"/>
  <img src="/docs/photos/feed.png" width="15%"/>
  <img src="/docs/photos/myfeed.png" width="15%"/>
  <img src="/docs/photos/conversations.png" width="15%"/>
  <img src="/docs/photos/topics.png" width="15%"/>
</p>

<p align="center"><sub>[1] login screen [2] contact list [3] available contact feeds [4] your feed [5] conversation list [6] contact dialogue</sub></p>

  
### Installation
To use the app, you will need to have an account on a Diatum node. Diatum provides instructions for installing a node on a [Raspberry Pi](https://diatum.org/technology/node-installation/coredb-setup-on-raspberry-pi-4/) or an [AWS EC2 Instance](https://diatum.org/technology/node-installation/coredb-setup-on-aws/). With the default installation you will be able to access your device through the [Diatum Portal](https://portal.diatum.net) and create accounts that will reside on your node. Once you have an account ready, you can download IndiView from either iOS or Android.

<p align="center">
  <a href="https://apps.apple.com/us/app/indiview/id1569089072">
    <img src="/docs/photos/astore.png" width="15%">
  </a>
  <a href="https://play.google.com/store/apps/details?id=com.indiview">
    <img src="/docs/photos/gplay.png" width="15%">
  </a>
</p>

### Contribute
Any feedback on the usability, features or bugs is greatly appreciated. The server code is written with Java Spring and the mobile code is written with React Native. The code for interacting with the diatum network resides in the folder 'mobile/diatum' which can be taken to create other apps independent of IndiView. 
