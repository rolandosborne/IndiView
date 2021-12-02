<p align="center">
  <a href="#"><img src="/docs/photos/logo.png" /></a>
</p>

IndiView is a communication hub designed to work with a self-hosted network composed of [CoreDB](https://github.com/rolandosborne/CoreDB) nodes. With IndiView, you can maintian a contact list, share pictures and videos, and chat all while having full privacy and control of your data. Your data is transmitted only between self-hosted nodes and mobile devices. With IndiView's access control, family can have access to photos or phone numbers that a coworker may not. Most importantly, since all of the data resides in your node, if you move to another app supporting the CoreDB API, your data goes with you.

<p align="center">
  <a href="#"><img src="/docs/photos/login.png" width="15%"/></a>
  <a href="#"><img src="/docs/photos/contacts.png" width="15%"/></a>
  <a href="#"><img src="/docs/photos/feed.png" width="15%"/></a>
  <a href="#"><img src="/docs/photos/myfeed.png" width="15%"/></a>
  <a href="#"><img src="/docs/photos/conversations.png" width="15%"/></a>
  <a href="#"><img src="/docs/photos/topics.png" width="15%"/></a>
</p>

<p align="center"><sub>[1] login screen [2] contact list [3] available contact feeds [4] your feed [5] conversation list [6] contact dialogue</sub></p>

  
### Installation
To use the app, you will need to have an account on a CoreDB node. The [CoreDB](https://github.com/rolandosborne/CoreDB) project provides a [Portainer template](https://github.com/rolandosborne/CoreDB/blob/main/tools/template.json) and a [Docker Compose stack](https://github.com/rolandosborne/CoreDB/blob/main/tools/docker-stack.yaml) for ARM64 & AMD64. It's assumed you have a reverse proxy like nginx-proxy-manager to provide HTTPS. Let me know if there is a specific archtecture or orchestration tool you would like support and I will add it. Once you have a node installed, you can use the IndiView app available on both play stores:

<p align="center">
  <a href="https://apps.apple.com/us/app/indiview/id1569089072">
    <img src="/docs/photos/astore.png" width="15%">
  </a>
  <a href="https://play.google.com/store/apps/details?id=com.indiview">
    <img src="/docs/photos/gplay.png" width="15%">
  </a>
</p>

### Tutorial
<p align="center"><sub>Below is a video walkthrough on how to install a node and use IndiView in a basic selfhosting setup.</sub></p>
<p align="center">
  <a href="https://s3.us-west-2.amazonaws.com/org.coredb.indiview/IndiView_Tutorial.mp4"><img src="/docs/photos/turtorial.png" width="70%"/></a>
</p>  

### Issues
If you encounter any problems installing the selfhosted node or using the mobile app, please let me know by posting in the discussions tab in the 'Help' category.

### Contribute
Any feedback on the design, usability, features or bugs is greatly appreciated. For those with coding experience, the server code is written with Java Spring and the mobile code is written with React Native. The code for interacting with the CoreDB node resides in the folder 'mobile/diatum' which can be taken to create other apps independent of IndiView. 
