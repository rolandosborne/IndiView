<p align="center">
  <a href="https://github.com/rolandosborne/IndiView/raw/main/docs/videos/IndiView_Tutorial.mp4"><img src="/docs/photos/logo.png" /></a>
</p>

IndiView is a communication hub designed to work with the self-hosted network [Diatum](https://diatum.org). With IndiView, you can maintian a contact list, share pictures and videos, and chat all while having full privacy and control of your data. Your data is transmitted only between self-hosted nodes and  mobile devices. Within the app you seletively share your contact info, photos and videos, so your contacts will not all see your identity in the same way. Family may have access to photos or phone numbers that a coworker may not. Most importantly, since all of the data resides in your node, if you move to another Diatum app, your data goes with you.

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
To use the app, you will need to have an account on a Diatum node. The [CoreDB](https://github.com/diatum-org/coredb) project provides a template for setting up a selfhosting solution on [ARM64](https://github.com/diatum-org/coredb/blob/main/tools/coredb_node_arm64.yaml) and [AMD64](https://github.com/diatum-org/coredb/blob/main/tools/coredb_node_amd64.yaml). Once you have a node installed, you can use the IndiView app available on both play stores:

<p align="center">
  <a href="https://apps.apple.com/us/app/indiview/id1569089072">
    <img src="/docs/photos/astore.png" width="15%">
  </a>
  <a href="https://play.google.com/store/apps/details?id=com.indiview">
    <img src="/docs/photos/gplay.png" width="15%">
  </a>
</p>

### Contribute
Any feedback on the design, usability, features or bugs is greatly appreciated. For those with coding experience, the server code is written with Java Spring and the mobile code is written with React Native. The code for interacting with the diatum network resides in the folder 'mobile/diatum' which can be taken to create other apps independent of IndiView. 
