import { AppContext, DiatumSession, AmigoMessage, Amigo, AuthMessage, Auth, Revisions, LabelEntry, LabelView, PendingAmigo, PendingAmigoView, SubjectView, SubjectEntry, SubjectItem, SubjectRecord, SubjectTag, ShareView, ShareMessage, ShareStatus, ShareEntry, InsightView, DialogueView, ContactReqeust, Conversation } from './DiatumTypes';
import { DiatumApi } from './DiatumApi';
import { getAmigoObject, getAuthObject } from './DiatumUtil';
import { AppState, AppStateStatus } from 'react-native';
import { Storage, AmigoConnection, AmigoReference, AmigoPath } from './Storage';

const SYNC_INTERVAL_MS: number = 1000
const SYNC_NODE_MS: number = 5000
const SYNC_REGISTRY_MS: number = 900000;
const SYNC_AUTH_MS: number = 3600000;
const SYNC_CONNECTION_MS: number = 15000;
const SYNC_REFERENCE_MS: number = 300000;
const STALE_CONNECTION_MS: number = 60000;
const STALE_REFERENCE_MS: number = 900000;
const REVISIONS_KEY: string = "diatum_revisions";
const ACCESS_KEY: string = "service_access";
const IDENTITY_KEY: string = "identity";
const AUTH_KEY: string = "auth_message";
const ACCOUNT_DATA: string = "account_data_";

export enum DiatumDataType {
  Identity,
  Attribute,
  Subject,
  AmigoIdentity,
  AmigoAttribute,
  AmigoSubject,
  Message,
  COUNT
}
  

export enum DiatumEvent {
  Labels = 0,
  Identity,
  Amigos,
  Pending,
  Attributes,
  Subjects,
  Share,
  Listing,
  Contact,
  View,
  Conversation,
  COUNT
}

export interface Diatum {
  // initialize SDK and retrive previous context
  init(path: string, attributes: string[], subjects: string[], tag: string,
    callback: (type: DiatumDataType, object: any) => {}): Promise<AppContext>;

  // set context for next init
  setAppContext(ctx: AppContext): Promise<void>;

  // clear context for next init
  clearAppContext(): Promise<void>;

  // set active identity
  setSession(session: DiatumSession): Promise<void>;

  // clear active identity
  clearSession(): Promise<void>;

  // get app data
  getAccountData(key: string): Promise<any>;

  // set app data
  setAccountData(key: string, data: any): Promise<void>; 

  // add event listener
  setListener(event: DiatumEvent, callback: (objectId: string) => void): Promise<void>;

  // remove added listener
  clearListener(callback: (objectId: string) => void): Promise<void>;

  // get registry amigo object
  getRegistryAmigo(amigoId: string, registry: string): Promise<Amigo>;

  // get registry profile image
  getRegistryImage(amigoId: string, registry: string): string;

  // set profile name
  setProfileName(value: string): Promise<void>

  // set profile image 
  setProfileImage(value: string): Promise<void>

  // set profile location
  setProfileLocation(value: string): Promise<void>

  // set profile description
  setProfileDescription(value: string): Promise<void>

  // get public profile
  getIdentity(): Promsie<IdentityProfile>

  // get account labels
  getLabels(): Promise<LabelEntry[]>

  // add account label
  addLabel(name: string): Promise<LabelEntry>

  // update account label
  updateLabel(labelId: string, name: string): Promise<LabelEntry>

  // remove account label 
  removeLabel(labelId: string): Promise<void>

  // get label usage
  getLabelCount(labelId: string): Promise<LabelCount>

  // get account attributes
  getAttributes(labelId: string): Promise<Attribute[]>

  // add new attribute
  addAttribute(schema: string): Promise<Attribute>

  // set attribute data
  setAttribute(attributeId: string, schema: string, data: string): Promise<void>

  // get attribute labels
  getAttributeLabels(attributeId: string): Promise<string[]>

  // set attribute label
  setAttributeLabel(attributeId: string, labelId: string): Promise<void>

  // clear attribute label
  clearAttributeLabel(attributeId: string, labelId: string): Promise<void>

  // get contacts
  getContacts(labelId: string, status: string): Promise<ContactEntry[]>

  // get specified contact
  getContact(amigoId: string): Promise<ContactEntry>

  // get attributes for specified contact
  getContactAttributes(amigoId: string): Promise<Attribute[]>

  // get labels for specified contact
  getContactLabels(amigoId: string): Promise<string[]>

  // set contact label
  setContactLabel(amigoId: string, labelId: string): Promise<void>;

  // clear contact label
  clearContactLabel(amigoId: string, labelId: string): Promise<void>;

  // set app data for amigo
  setContactAttributeData(amigoId: string, obj: any): Promise<void>

  // set app data for amigo
  setContactSubjectData(amigoId: string, obj: any): Promise<void>

  // set app data for amigo
  setContactAppData(amigoId: string, obj: any): Promise<void>

  // add contact
  addContact(amigoId: string, registry: string): Promise<void>

  // remove contact
  removeContact(amigoId: string): Promise<void>

  // request contact connection
  openContactConnection(amigoId: string): Promise<void>

  // disconnect contact
  closeContactConnection(amigoId: string): Promise<void>

  // add or update contact notes
  setContactNotes(amigoId: string, notes: string): Promise<void>

  // clear contact notes
  clearContactNotes(amigoId: string): Promise<void>

  // get contact requests
  getContactRequests(): Promise<ContactRequest[]>

  // clear contact request
  clearContactRequest(shareId: string): Promise<void>

  // get blocked contacts
  getBlockedContacts(): Promise<ContactEntry[]>

  // set blocked state
  setBlockedContact(amigoId: string, block: boolean): Promise<void>

  // get subjects
  getSubjects(labelId: string): Promise<SubjectRecord[]>

  // get subject
  getSubject(subjectId: string): Promise<SubjectRecord>;

  // get subject tags
  getSubjectTags(subjectId: string): Promise<Tag[]>

  // add subject tag
  addSubjectTag(subjectId: string, schema: string, data: string): Promise<void>

  // remove subject tag
  removeSubjectTag(subjectId: string, tagId: string, schema: string): Promise<void>

  // get contact subjects
  getContactSubjects(amigoId: string): Promise<SubjctItem[]>

  // get contact subject tags
  getContactSubjectTags(amigoId: string, subjectId: string): Promise<Tag[]>

  // add tag to contact's subject
  addContactSubjectTag(amigoId: string, subjectId: string, schema: string, data: string): Promise<void>

  // remove contact's subject tag
  removeContactSubjectTag(amigoId: string, subjectId: string, tagId: string, schema: string): Promise<void>

  // get blocked subjects
  getBlockedSubjects(): Promise<SubjectItem[]>

  // set blocked subject state
  setBlockedSubject(amigoId: string, subjectId: string, block: boolean): Promise<void>

  // add a new subject
  addSubject(schema: string): Promise<string>;

  // remove subject
  removeSubject(subjectId: string): Promise<void>;  

  // get subject labels
  getSubjectLabels(subjectId: string): Promise<string[]>;

  // add a subject label
  setSubjectLabel(subjectId: string, labelId: string): Promise<void>;

  // remove subject label
  clearSubjectLabel(subjectId: string, labelId: string): Promise<void>;

  // save subject data
  setSubjectData(subjectId: string, schema: string, data: string): Promise<void>;

  // set sharing statue
  setSubjectShare(subjectId: string, share: boolean): Promise<void>;

  // get conversations
  getConversations(labelId: string): Promise<Conversation[]>;

  // create conversation
  addConversation(amigoId: string): Promise<string>;

  // get topic views
  getTopicViews(amigoId: string, dialogueId: string, hosting: boolean): Promise<TopicView[]>;

  // get blurbs of topic
  getTopicBlurbs(amigoId: string, dialogueId: string, hosting: boolean, topicId: string): Promise<Blurb[]>;

  // add blurb to conversation
  addConversationBlurb(amigoId: string, dialogueId: string, hosting: boolean, schema: string, data: string): Promise<void>;

  // remove blurb from conversation
  removeConversationBlurb(amigoId: string, dialogueId: string, hosting: boolean, blurbId: string): Promise<void>;

  // set conversation app data
  setConversationAppData(amigoId: string, dialogueId: string, hosting: boolean, data: any): Promise<void>;

  // set conversation blurb data
  setConversationBlurbData(amigoId: string, dialogueId: string, hosting: boolean, data: any): Promise<void>;

  // sync conversation
  syncConversation(amigoId: string, dialogueId: string, hosting: boolean): Promise<void>;

  // close conversation
  closeConversation(amigoId: string, dialogueId: string, hosting: boolean): Promise<void>;

  // remove conversation
  removeConversation(amigoId: string, dialogueId: string, hosting: boolean): Promise<void>;

  // refresh contact
  syncContact(amigoId: string): Promise<void>
}

async function asyncForEach(map, handler) {
  let arr = [];
  map.forEach((value, key) => {
    arr.push({ id: key, obj: value });
  });
  for(let i = 0; i < arr.length; i++) {
    await handler(arr[i].obj, arr[i].id);
  }
}

class IdPosition {
  id: string;
  position: number;
} 

class _Diatum {

  private nodeSync: number;
  private authSync: number;
  private registrySync: number;
  private connectionSync: number;
  private referenceSync: number;
  private session: DiatumSession;
  private storage: Storage;
  private revisions: Revisions;
  private access: ServiceAccess;
  private listeners: Map<DiatumEvent, Set<() => void>>;
  private attributeFilter: string[];
  private subjectFilter: string[];
  private tagFilter: string;
  private authMessage: AuthMessage;
  private authToken: string;
  private nodeError: boolean;
  private callback: (type: DiatumDataType, objectId: string) => {};

  constructor(attributes: string[], subjects: string[], tag: string) {
    this.session = null;
    this.revisions = null;
    this.authMessage = null;
    this.storage = new Storage();
    this.attributeFilter = attributes;
    this.subjectFilter = subjects;
    this.tagFilter = tag;
    this.nodeError = false;
    this.listeners = new Map<DiatumEvent, Set<() => void>>();
    for(let i = 0; i < DiatumEvent.COUNT; i++) {
      this.listeners.set(i, new Set<() => void>());
    }
  }

  public async init(path: string, cb: (type: DiatumDataType, objectId: string) => {}): Promise<any> {
    this.callback = cb;

    await this.storage.init(path);
    try {
      return await this.storage.getAppContext();
    }
    catch(err) {
      return null;
    }
  }

  public setListener(event: DiatumEvent, callback: (objectId: string) => void): void {
    this.listeners.get(event).add(callback);
    callback();
  }

  public clearListener(event: DiatumEvent, callback: (objectId: string) => void): void {
    this.listeners.get(event).delete(callback);
  }

  private async notifyListeners(event: DiatumEvent, param): Promsie<void> {
    let arr = [];
    this.listeners.get(event).forEach(v => {
      arr.push(v);
    });
    for(let i = 0; i < arr.length; i++) {
      await arr[i](param);
    }
  }

  public async sync() {
    if(this.session != null) {
      let d: Date = new Date();
      let cur: number = d.getTime();

      // check node revisions every interval
      if(this.nodeSync + SYNC_NODE_MS < cur) {      

        // update node sync time 
        this.nodeSync = cur;
        let synced: boolean = false;

        try {
          // retrieve current revisions
          let rev = await DiatumApi.getRevisions(this.session.amigoNode, this.session.amigoToken);

          // update identity if revision change
          if(this.revisions.identityRevision !== rev.identityRevision && this.access.enableIdentity) {
            await this.syncIdentity();
            synced = true;
          }

          // update group if revision change
          if(this.revisions.groupRevision !== rev.groupRevision && this.access.enableGroup) {
            await this.syncGroup();
            synced = true;
          }

          // update index if revision change
          if(this.revisions.indexRevision !== rev.indexRevision && this.access.enableIndex) {
            await this.syncIndex();
            await this.syncPending();
            synced = true;
          }

          // update profile if revision change
          if(this.revisions.profileRevision !== rev.profileRevision && this.access.enableProfile) {
            await this.syncProfile();
            synced = true;
          }

          // update show if revision change
          if(this.revisions.showRevision !== rev.showRevision && this.access.enableShow) {
            await this.syncShow();
            synced = true;
          }

          // update share if revision change
          if(this.revisions.shareRevision !== rev.shareRevision && this.access.enableShare) {
            await this.syncShare();
            synced = true;
          }

          // update insight if revision chage
          if(this.revisions.insightRevision !== rev.insightRevision) {
            await this.syncInsight();
            synced = true;
          }

          // update dialogue if revision change
          if(this.revisions.dialogueRevision !== rev.dialogueRevision) {
            await this.syncDialogue();
            synced = true;
          }

          // store update revisions
          if(synced) {
            this.revisions = rev;
            this.storage.setAccountObject(this.session.amigoId, REVISIONS_KEY, rev);
          }

          // clear node error
          if(this.nodeError != false) {
            this.nodeError = false;
            this.notifyListeners(DiatumEvent.Identity);
          }
        }
        catch(err) {
          console.log(err);
          // set node error
          if(this.nodeError != true) {
            this.nodeError = true;
            this.notifyListeners(DiatumEvent.Identity);
          }
        }
      }

      // sync agent message
      if(this.authSync + SYNC_AUTH_MS < cur) {
        this.authSync = cur;
        let auth: Auth = getAuthObject(this.authMessage);
        if(auth == null || cur > (auth.issued + auth.expires / 2)) {
          this.authMessage = await DiatumApi.getAgentMessage(this.session.appNode, this.session.appToken);
          this.authToken = getAuthObject(this.authMessage).token;
          await this.storage.setAccountObject(this.session.amigoId, AUTH_KEY, this.authMessage);
        }
      }

      // sync all new connections
      let connections = await this.storage.getStaleAmigoConnections(this.session.amigoId);
      for(let i = 0; i < connections.length; i++) {
        await this.storage.updateStaleTime(this.session.amigoId, connections[i].amigoId, cur);
        try {
          await this.syncAmigoConnection(connections[i]);
        }
        catch(err) {
          console.log(err);
          if(!connections[i].connectionError) {
            await this.storage.updateAmigoConnectionError(this.session.amigoId, connections[i].amigoId, true);
            this.notifyListeners(DiatumEvent.Contact, amigoId);
          }
        }
      }

      // sync connections
      if(this.connectionSync + SYNC_CONNECTION_MS < cur) {
        this.connectionSync = cur;
        let connection = await this.storage.getStaleAmigoConnection(this.session.amigoId, cur - STALE_CONNECTION_MS);
        if(connection != null) {
          await this.storage.updateStaleTime(this.session.amigoId, connection.amigoId, cur);
          try {
            await this.syncAmigoConnection(connection);
          }
          catch(err) {
            if(!connection.connectionError) {
              console.log(err);
              await this.storage.updateAmigoConnectionError(this.session.amigoId, connection.amigoId, true);
              this.notifyListeners(DiatumEvent.Contact, connection.amigoId);
            } 

            // check if idenity changed in registry
            try {
              await this.syncContactRegistry(connection.registry, connection.amigoId, connection.identityRevision);
            }
            catch(err) {
              console.log(err);
            }
          }
        }
      }

      // sync references
      if(this.referenceSync + SYNC_REFERENCE_MS < cur) {
        this.referenceSync = cur;
        let reference = await this.storage.getStaleAmigoReference(this.session.amigoId, cur - STALE_REFERENCE_MS);
        if(reference != null) {
          await this.storage.updateStaleTime(this.session.amigoId, reference.amigoId, cur);
          try {
            await this.syncContactRegistry(reference.registry, reference.amigoId, reference.revision);
          }
          catch(err) {
            console.log(err);
          }
        }
      }

      // sync registry if dirty
      if(this.registrySync + SYNC_REGISTRY_MS < cur) {
        this.registrySync = cur;
        let dirty = await DiatumApi.getDirtyIdentity(this.session.amigoNode, this.session.amigoToken);
        if(dirty) {
          let message = await DiatumApi.getAmigoMessage(this.session.amigoNode, this.session.amigoToken);
          let amigo = getAmigoObject(message);
          await DiatumApi.setRegistryMessage(amigo.registry, message);
          await DiatumApi.clearDirtyIdentity(this.session.amigoNode, this.session.amigoToken, amigo.revision);
        }
      }
    }
  }

  private async syncAmigoConnection(connection: AmigoConnection): Promise<void> {

    // validate connection
    if(connection == null) {
      throw new Error("invalid empty connection");
    }

    // pull revisions with agent auth
    let revisions = await DiatumApi.getConnectionRevisions(connection.node, connection.token, this.authToken, this.authMessage);

    // if identity revision is different, update registry
    if(revisions.identityRevision != connection.identityRevision) {
      let amigo = await DiatumApi.getConnectionListing(connection.node, connection.token, this.authToken);
      if(amigo.amigoId == connection.amigoId) { // sanity check
        await this.storage.updateAmigoIdentity(this.session.amigoId, amigo);
        this.notifyListeners(DiatumEvent.Listing, connection.amigoId);
      }
    }

    // if attribute revision is different, update contact
    if(revisions.contactRevision != connection.attributeRevision) {
      await this.syncConnectionContact(connection.amigoId, connection.node, connection.token);
      await this.storage.updateConnectionAttributeRevision(this.session.amigoId, connection.amigoId, revisions.contactRevision);
    }

    // if subject revision is different, update view
    if(revisions.viewRevision != connection.subjectRevision) {
      await this.syncConnectionView(connection.amigoId, connection.node, connection.token);
      await this.storage.updateConnectionSubjectRevision(this.session.amigoId, connection.amigoId, revisions.viewRevision);
    }

    // clear any error flag
    if(connection.connectionError) {
      await this.storage.updateAmigoConnectionError(this.session.amigoId, connection.amigoId, false);
      this.notifyListeners(DiatumEvent.Contact, connection.amigoId);
    }
  }

  private async syncContactRegistry(registry: string, amigoId: string, revision: number): Promsie<void> {
    let r = await DiatumApi.getRegistryRevision(registry, amigoId);
    if(r > revision) {
      let message = await DiatumApi.getRegistryMessage(registry, amigoId);
      let amigo = await DiatumApi.setAmigoIdentity(this.session.amigoNode, this.session.amigoToken, message);
      if(amigo.amigoId == amigoId) { // sanity check
        await this.storage.updateAmigoIdentity(this.session.amigoId, amigo);
      }
    }
  }

  private async syncConnectionContact(amigoId: string, node: string, token: string): Promise<void> {
    let notify: boolean = false;

    // get remote attributes
    let remote: AttributeView[] = await DiatumApi.getConnectionAttributeView(node, token, this.authToken, this.attributeFilter);
    let remoteMap: Map<string, number> = new Map<string, number>();
    for(let i = 0; i < remote.length; i++) {
      remoteMap.set(remote[i].attributeId, remote[i].revision);
    }

    // get local attributes
    let local: AttributeView[] = await this.storage.getConnectionAttributeView(this.session.amigoId, amigoId);
    let localMap: Map<string, number> = new Map<string, number>();
    for(let i = 0; i < local.length; i++) {
      localMap.set(local[i].attributeId, local[i].revision);
    }

    // add remote entry not in local
    await asyncForEach(remoteMap, async (value, key) => {
      if(!localMap.has(key)) {
        let a: Attribute = await DiatumApi.getConnectionAttribute(node, token, this.authToken, key);
        await this.storage.addConnectionAttribute(this.session.amigoId, amigoId, a);
        notify = true;
      }
      else if(localMap.get(key) != value) {
        let a: Attribute = await DiatumApi.getConnectionAttribute(node, token, this.authToken, key);
        await this.storage.updateConnectionAttribute(this.session.amigoId, amigoId, a);
        notify = true;
      }
    });

    // remove any local entry not in remote
    await asyncForEach(localMap, async (value, key) => {
      if(!remoteMap.has(key)) {
        await this.storage.removeConnectionAttribute(this.session.amigoId, amigoId, key);
        notify = true;
      }
    });
    
    if(notify) {
      await this.callback(DiatumDataType.AmigoAttribute, amigoId);
      this.notifyListeners(DiatumEvent.Contact, amigoId);
    }
  }

  private async syncConnectionView(amigoId: string, node: string, token: string): Promise<void> {
    let notify: boolean = false;

    // get remote subjects
    let remote: SubjectView[] = await DiatumApi.getConnectionSubjectView(node, token, this.authToken, this.subjectFilter);
    let remoteMap: Map<string, any> = new Map<string, any>();
    for(let i = 0; i < remote.length; i++) {
      remoteMap.set(remote[i].subjectId, { subjet: remote[i].revision, tag: remote[i].tagRevision });
    }

    // get local subjects
    let local: SubjectView[] = await this.storage.getConnectionSubjectView(this.session.amigoId, amigoId);
    let localMap: Map<string, any> = new Map<string, any>();
    for(let i = 0; i < local.length; i++) {
      localMap.set(local[i].subjectId, { subject: local[i].revision, tag: local[i].tagRevision });
    }

    // add remote entry not in local
    await asyncForEach(remoteMap, async (value, key) => {
      if(!localMap.has(key)) {
        let subject: Subject = await DiatumApi.getConnectionSubject(node, token, this.authToken, key);
        await this.storage.addConnectionSubject(this.session.amigoId, amigoId, subject);
        if(value.tag != null) {
          let tag: SubjectTag = await DiatumApi.getConnectionSubjectTags(node, token, this.authToken, key, this.tagFilter);
          await this.storage.updateConnectionSubjectTags(this.session.amigoId, amigoId, key, tag.revision, tag.tags);
        }
        notify = true;
      }
      else {
        if(localMap.get(key).subject != value.subject) {
          let subject: Subject = await DiatumApi.getConnectionSubject(node, token, this.authToken, key);
          await this.storage.updateConnectionSubject(this.session.amigoId, amigoId, subject);
          notify = true;
        }

        if(localMap.get(key).tag != value.tag) {
          let tag: SubjectTag = await DiatumApi.getConnectionSubjectTags(node, token, this.authToken, key, this.tagFilter);
          await this.storage.updateConnectionSubjectTags(this.session.amigoId, amigoId, key, tag.revision, tag.tags);
          notify = true;
        }
      }
    });

    // remove any local entry not in remote
    await asyncForEach(localMap, async (value, key) => {
      if(!remoteMap.has(key)) {
        await this.storage.removeConnectionSubject(this.amigoId, amigoId, key);
        notify = true;
      }
    });

    if(notify) {
      await this.callback(DiatumDataType.AmigoSubject, amigoId); 
      this.notifyListeners(DiatumEvent.View, amigoId);
    }
  }

  public async setAppContext(ctx: AppContext): Promise<void> {
    await this.storage.setAppContext(ctx);
  }

  public async clearAppContext(): Promise<void> {
    await this.storage.clearAppContext();
  }

  public async setSession(amigo: DiatumSession): Promise<void> {
    await this.storage.setAccount(amigo.amigoId);

    // load current revisions
    this.revisions = await this.storage.getAccountObject(amigo.amigoId, REVISIONS_KEY);
    if(this.revisions == null) {
      this.revisions = {};
    }

    // load current authorization
    this.authMessage = await this.storage.getAccountObject(amigo.amigoId, AUTH_KEY);
    if(this.authMessage == null) {
      this.authMessage = await DiatumApi.getAgentMessage(amigo.appNode, amigo.appToken);
      await this.storage.setAccountObject(amigo.amigoId, AUTH_KEY, this.authMessage);
    }

    // extract token
    this.authToken = getAuthObject(this.authMessage).token

    // load current access
    this.access = await this.storage.getAccountObject(amigo.amigoId, ACCESS_KEY);
    if(this.access == null) {
      this.access = await DiatumApi.getServiceAccess(amigo.amigoNode, amigo.amigoToken);
      await this.storage.setAccountObject(amigo.amigoId, ACCESS_KEY, this.access);
    }

    this.registrySync = 0;
    this.referenceSync = 0;
    this.connectionSync = 0;
    this.nodeSync = 0;
    this.authSync = 0;
    this.session = amigo;
  }

  public async clearSession(): Promise<void> {
    this.session = null;
  }

  public async getAccountData(key: string): Promise<any> {
    return await this.storage.getAccountObject(this.session.amigoId, ACCOUNT_DATA + key);
  }

  public async setAccountData(key: string, data: any): Promise<void> {
    return await this.storage.setAccountObject(this.session.amigoId, ACCOUNT_DATA + key, data);
  }
 
  private async syncIdentity(): Promsie<void> {

    let revision = await DiatumApi.getIdentityRevision(this.session.amigoNode, this.session.amigoToken);
    let amigo = await this.storage.getAccountObject(this.session.amigoId, IDENTITY_KEY);
    if(amigo == null || revision != amigo.revision) {

      // retrieve current identity
      let amigo = await DiatumApi.getIdentity(this.session.amigoNode, this.session.amigoToken);
      await this.storage.setAccountObject(this.session.amigoId, IDENTITY_KEY, amigo);
      this.notifyListeners(DiatumEvent.Identity);
    }
  }

  private async syncGroup(): Promsie<void> {
    let notify = false;

    // get remote label entries
    let remote: LabelView[] = await DiatumApi.getLabelViews(this.session.amigoNode, this.session.amigoToken);
    let remoteMap: Map<string, number> = new Map<string, number>();
    for(let i = 0; i < remote.length; i++) {
      remoteMap.set(remote[i].labelId, remote[i].revision);
    }

    // get local label entries
    let local: LabelView[] = await this.storage.getLabelViews(this.session.amigoId);
    let localMap: Map<string, number> = new Map<string, number>();
    for(let i = 0; i < local.length; i++) {
      localMap.set(local[i].labelId, local[i].revision);
    }

    // add remote entry not in local
    await asyncForEach(remoteMap, async (value, key) => {
      if(!localMap.has(key)) {
        let entry = await DiatumApi.getLabel(this.session.amigoNode, this.session.amigoToken, key);
        await this.storage.addLabel(this.session.amigoId, entry);
        notify = true;
      }
      else if(localMap.get(key) != value) {
        let entry = await DiatumApi.getLabel(this.session.amigoNode, this.session.amigoToken, key);
        await this.storage.updateLabel(this.session.amigoId, entry);
        notify = true;
      }
    });

    // remove any local entry not in remote
    await asyncForEach(localMap, async (value, key) => {
      if(!remoteMap.has(key)) {
        await this.storage.removeLabel(this.session.amigoId, key);
        notify = true;
      }
    });

    if(notify) {
      this.notifyListeners(DiatumEvent.Labels);
    }
  }

  public async syncIndex(): Promise<void> {
    let notify: boolean = false;

    // get remote view
    let remote: AmigoView[] = await DiatumApi.getAmigoViews(this.session.amigoNode, this.session.amigoToken);
    let remoteMap: Map<string, number> = new Map<string, number>();
    for(let i = 0; i < remote.length; i++) {
      remoteMap.set(remote[i].amigoId, remote[i].revision);
    }

    // get local view
    let local: AmigoView[] = await this.storage.getAmigoViews(this.session.amigoId);
    let localMap: Map<string, number> = new Map<string, number>();
    for(let i = 0; i < local.length; i++) {
      localMap.set(local[i].amigoId, local[i].revision);
    }

    await asyncForEach(remoteMap, async (value, key) => {
    
      if(!localMap.has(key)) {
        
        // add any remote entry not local
        let amigo: AmigoEntry = await DiatumApi.getAmigo(this.session.amigoNode, this.session.amigoToken, key);
        let identity: Amigo = await DiatumApi.getAmigoIdentity(this.session.amigoNode, this.session.amigoToken, key); 

        await this.storage.addAmigo(this.session.amigoId, identity, amigo.revision, amigo.notes);
        await this.storage.clearAmigoLabels(this.session.amigoId, amigo.amigoId);
        for(let i = 0; i < amigo.labels.length; i++) {
          await this.storage.setAmigoLabel(this.session.amigoId, key, amigo.labels[i]);
        }
        notify = true; 
      }
      else if(localMap.get(key) != value) {

        // update any entry with different revision
        let amigo: AmigoEntry = await DiatumApi.getAmigo(this.session.amigoNode, this.session.amigoToken, key);

        await this.storage.updateAmigo(this.session.amigoId, amigo.amigoId, amigo.revision, amigo.notes);
        await this.storage.clearAmigoLabels(this.session.amigoId, amigo.amigoId);
        for(let i = 0; i < amigo.labels.length; i++) {
          await this.storage.setAmigoLabel(this.session.amigoId, amigo.amigoId, amigo.labels[i]);
        }
        notify = true;
      }
    });

    // remove any local entry not in remote
    await asyncForEach(localMap, async (value, key) => {
      if(!remoteMap.has(key)) {
        await this.storage.removeAmigo(this.session.amigoId, key);
        notify = true;
      }
    });

    if(notify) {
      this.notifyListeners(DiatumEvent.Amigos);
    }
  }

  public async syncPending(): Promise<void> {
    let notify: boolean = false;

    // retrieve remote list of pending shares
    let remoteReq: PendingAmigoView[] = await DiatumApi.getPendingAmigoViews(this.session.amigoNode, this.session.amigoToken);
    let remoteReqMap: Map<string, number> = new Map<string, number>();
    for(let i = 0; i < remoteReq.length; i++) {
      remoteReqMap.set(remoteReq[i].shareId, remoteReq[i].revision);
    }

    // retrieve local list of pending shares
    let localReq: PendingAmigoView[] = await this.storage.getPendingAmigoViews(this.session.amigoId);
    let localReqMap: Map<string, number> = new Map<string, number>();
    for(let i = 0; i < localReq.length; i++) {
      localReqMap.set(localReq[i].shareId, localReq[i].revision);
    } 

    // add any new pending requests
    await asyncForEach(remoteReqMap, async (value, key) => {

      if(!localReqMap.has(key)) {

        // add any remote entry not local
        let amigo: PendingAmigo = await DiatumApi.getPendingAmigo(this.session.amigoNode, this.session.amigoToken, key);
        await this.storage.addPendingAmigo(this.session.amigoId, amigo.shareId, amigo.revision, getAmigoObject(amigo.message), amigo.updated);
        notify = true;
      }
      else if(localReqMap.get(key) != value) {

        // add any entry with different revision
        let amigo: PendingAmigo = await DiatumApi.getPendingAmigo(this.session.amigoNode, this.session.amigoToken, key);
        await this.storage.updatePending(this.session.amigoId, amigo.shareId, amigo.revision, getAmigoObject(amigo.message), amigo.updated);
        notify = true;
      }
    });

    // remove old pending requests
    await asyncForEach(localReqMap, async (value, key) => {
      if(!remoteReqMap.has(key)) {
        await this.storage.removePendingAmigo(this.session.amigoId, key);
        notify = true;
      }
    });

    if(notify) {
      this.notifyListeners(DiatumEvent.Pending);
    }
  }

  public async syncProfile(): Promise<void> {
    let notify: boolean = false;
    
    // get remote attribute entries
    let remote: AttributeView[] = await DiatumApi.getAttributeViews(this.session.amigoNode, this.session.amigoToken, this.attributeFilter);
    let remoteMap: Map<string, number> = new Map<string, number>();
    for(let i = 0; i < remote.length; i++) {
      remoteMap.set(remote[i].attributeId, remote[i].revision);
    }

    // get local attribute entries
    let local: AttributeView[] = await this.storage.getAttributeViews(this.session.amigoId);
    let localMap: Map<string, number> = new Map<string, number>();
    for(let i = 0; i < local.length; i++) {
      localMap.set(local[i].attributeId, local[i].revision);
    }

    await asyncForEach(remoteMap, async (value, key) => {

      if(!localMap.has(key)) {

        // add any remote entry not local
        let entry: AttributeEntry = await DiatumApi.getAttribute(this.session.amigoNode, this.session.amigoToken, key);
        await this.storage.addAttribute(this.session.amigoId, entry.attribute.attributeId, entry.attribute.revision, entry.attribute.schema, entry.attribute.data);
        await this.storage.clearAttributeLabels(this.session.amigoId, entry.attribute.attributeId);
        for(let i = 0; i < entry.labels.length; i++) {
          await this.storage.setAttributeLabel(this.session.amigoId, key, entry.labels[i]);
        }
        notify = true;
      }
      else if(localMap.get(key) != value) {

        // update any entry with different revision
        let entry: AttributeEntry = await DiatumApi.getAttribute(this.session.amigoNode, this.session.amigoToken, key);
        await this.storage.updateAttribute(this.session.amigoId, entry.attribute.attributeId, entry.attribute.revision, entry.attribute.schema, entry.attribute.data);
        await this.storage.clearAttributeLabels(this.session.amigoId, entry.attribute.attributeId);
        for(let i = 0; i < entry.labels.length; i++) {
          await this.storage.setAttributeLabel(this.session.amigoId, entry.attribute.attributeId, entry.labels[i]);
        }
        notify = true;
      }
    });

    // remove any local entry not in remote
    await asyncForEach(localMap, async (value, key) => {
      if(!remoteMap.has(key)) {
        await this.storage.removeAttribute(this.session.amigoId, key);
        notify = true;
      }
    });

    if(notify) {
      this.notifyListeners(DiatumEvent.Attributes);
    }
  }

  public async syncShow(): Promise<void> {
    let notify: boolean;

    // get remote subject entries
    let remote: SubjectView[] = await DiatumApi.getSubjectViews(this.session.amigoNode, this.session.amigoToken, this.subjectFilter);
    let remoteMap: Map<string, any> = new Map<string, any>();
    for(let i = 0; i < remote.length; i++) {
      remoteMap.set(remote[i].subjectId, { subject: remote[i].revision, tag: remote[i].tagRevision });
    }

    // get local subject entries
    let local: SubjectView[] = await this.storage.getSubjectViews(this.session.amigoId);

    let localMap: Map<string, any> = new Map<string, any>();
    for(let i = 0; i < local.length; i++) {
      localMap.set(local[i].subjectId, { subject: local[i].revision, tag: local[i].tagRevision });
    }

    // add remote entry not in local
    await asyncForEach(remoteMap, async (value, key) => {

      if(!localMap.has(key)) {
        let entry: SubjectEntry = await DiatumApi.getSubject(this.session.amigoNode, this.session.amigoToken, key);
        let r: number = entry.ready ? 1 : 0;
        let s: number = entry.share ? 1 : 0;
        await this.storage.addSubject(this.session.amigoId, entry.subject, r, s);
        await this.storage.clearSubjectLabels(this.session.amigoId, key);
        for(let i = 0; i < entry.labels.length; i++) {
          await this.storage.setSubjectLabel(this.session.amigoId, key, entry.labels[i]);
        }
        if(value.tag != 0) {
          let tag: SubjectTag = await DiatumApi.getSubjectTags(this.session.amigoNode, this.session.amigoToken, key, this.tagFilter);
          await this.storage.updateSubjectTags(this.session.amigoId, key, tag.revision, tag.tags);
        }
        this.notifyListeners(DiatumEvent.Subjects, key);
        notify = true;
      }
      else {
        if(localMap.get(key).subject != value.subject) {
          let entry: SubjectEntry = await DiatumApi.getSubject(this.session.amigoNode, this.session.amigoToken, key);
          let r: number = entry.ready ? 1 : 0;
          let s: number = entry.share ? 1 : 0;
          await this.storage.updateSubject(this.session.amigoId, entry.subject, r, s);
          await this.storage.clearSubjectLabels(this.session.amigoId, key);
          for(let i = 0; i < entry.labels.length; i++) {
            await this.storage.setSubjectLabel(this.session.amigoId, key, entry.labels[i]);
          }
          this.notifyListeners(DiatumEvent.Subjects, key);
          notify = true;
        }
        if(localMap.get(key).tag != value.tag) {
          let tag: SubjectTag = await DiatumApi.getSubjectTags(this.session.amigoNode, this.session.amigoToken, key, this.tagFilter);
          await this.storage.updateSubjectTags(this.session.amigoId, key, tag.revision, tag.tags);
          this.notifyListeners(DiatumEvent.Subjects, key);
          notify = true;
        }
      }
    });

    // remove any local entry not in remote
    await asyncForEach(localMap, async (value, key) => {
      if(!remoteMap.has(key)) {
        await this.storage.removeSubject(this.session.amigoId, key);
        this.notifyListeners(DiatumEvent.Subjects, key);
        notify = true;
      }
    });

    if(notify) {
      this.notifyListeners(DiatumEvent.Subjects);
    }
  }

  public async syncShare(): Promsie<void> {
    let notify: boolean = false;

    // get remote share entries
    let remote: ShareView[] = await DiatumApi.getConnectionViews(this.session.amigoNode, this.session.amigoToken);
    let remoteMap: Map<string, number> = new Map<string, number>();
    for(let i = 0; i < remote.length; i++) {
      remoteMap.set(remote[i].shareId, remote[i].revision);
    }

    // get local share entries
    let local: ShareView[] = await this.storage.getConnectionViews(this.session.amigoId);
    let localMap: Map<string, number> = new Map<string, number>();
    for(let i = 0; i < local.length; i++) {
      localMap.set(local[i].shareId, local[i].revision);
    }

    // add remote entry not in local
    await asyncForEach(remoteMap, async (value, key) => {

      if(!localMap.has(key)) {

        let entry: ShareEntry = await DiatumApi.getConnection(this.session.amigoNode, this.session.amigoToken, key);
        await this.storage.addConnection(this.session.amigoId, entry);
        notify = true;
      }
      else if(localMap.get(key) != value) {

        let entry: ShareEntry = await DiatumApi.getConnection(this.session.amigoNode, this.session.amigoToken, key);
        await this.storage.updateConnection(this.session.amigoId, entry);
        notify = true;
      }
    });

    // remove any local entry not in remote
    await asyncForEach(localMap, async (value, key) => {
      if(!remoteMap.has(key)) {
        await this.storage.removeConnection(this.session.amigoId, key);
        notify = true;
      }
    });

    if(notify) {
      this.notifyListeners(DiatumEvent.Share);
    }
  }

  public async syncInsight(): Promise<void> {
    let notify: boolean = false;

    let remote: InsightView[] = await DiatumApi.getInsightViews(this.session.amigoNode, this.session.amigoToken);
    let remoteMap: Map<string, InsightView> = new Map<string, InsightView>();
    for(let i = 0; i < remote.length; i++) {
      remoteMap.set(remote[i].amigoId + "::" + remote[i].dialogueId, remote[i]);
    }

    let local: InsightView[] = await this.storage.getInsightViews(this.session.amigoId);
    let localMap: Map<string, InsightView> = new Map<string, InsightView>();
    for(let i = 0; i < local.length; i++) {
      localMap.set(local[i].amigoId + "::" + local[i].dialogueId, local[i]);
    }

    // add remote entry not in local
    await asyncForEach(remoteMap, async (value, key) => {

      if(!localMap.has(key)) {
        await this.storage.addInsight(this.session.amigoId, value.amigoId, value.dialogueId);
        try {
          await this.syncInsightConversation(value.amigoId, value.dialogueId);
          await this.storage.updateInsightRevision(this.session.amigoId, value.amigoId, value.dialogueId, value.revision, false);
        }
        catch(err) {
          console.log(err);
          await this.storage.updateInsightRevision(this.session.amigoId, value.amigoId, value.dialogueId, value.revision, true);
        }
        await this.callback(DiatumDataType.Message, { amigoId: value.amigoId, dialogueId: value.dialogueId, hosting: false }); 
        notify = true;
      }
      else if(localMap.get(key).revision != value.revision) {
        try {
          await this.syncInsightConversation(value.amigoId, value.dialogueId);
          await this.storage.updateInsightRevision(this.session.amigoId, value.amigoId, value.dialogueId, value.revision, false);
        }
        catch(err) {
          console.log(err);
          await this.storage.updateInsightRevision(this.session.amigoId, value.amigoId, value.dialogueId, value.revision, true);
        }
        await this.callback(DiatumDataType.Message, { amigoId: value.amigoId, dialogueId: value.dialogueId, hosting: false }); 
        notify = true;
      }
    });

    // remove any local entry not in remote
    await asyncForEach(localMap, async (value, key) => {
      if(!remoteMap.has(key)) {
        await this.storage.removeInsight(this.session.amigoId, value.amigoId, value.dialogueId);
        notify = true;
      }
    });

    if(notify) {
      this.notifyListeners(DiatumEvent.Conversation);
    }

  }

  public async syncDialogue(): Promise<void> {
    let notify: boolean = false;
    
    let remote: DialogueView[] = await DiatumApi.getDialogueViews(this.session.amigoNode, this.session.amigoToken);
    let remoteMap: Map<string, number> = new Map<string, number>();
    for(let i = 0; i < remote.length; i++) {
      remoteMap.set(remote[i].dialogueId, remote[i].revision);
    }

    let local: DialogueView[] = await this.storage.getDialogueViews(this.session.amigoId);
    let localMap: Map<string, number> = new Map<string, number>();
    for(let i = 0; i < local.length; i++) {
      localMap.set(local[i].dialogueId, local[i].revision);
    }

    // add remote entry not in local
    await asyncForEach(remoteMap, async (value, key) => {

      if(!localMap.has(key)) {
        await this.storage.addDialogue(this.session.amigoId, key);
        await this.syncDialogueConversation(key);
        await this.callback(DiatumDataType.Message, { dialogueId: key, hosting: true }); 
        notify = true;
      }
      else if(localMap.get(key) != value) {
        await this.syncDialogueConversation(key);
        await this.callback(DiatumDataType.Message, { dialogueId: key, hosting: true }); 
        notify = true;
      }
    });

    // remove any local entry not in remote
    await asyncForEach(localMap, async (value, key) => {
      if(!remoteMap.has(key)) {
        await this.storage.removeDialogue(this.session.amigoId, key);
        notify = true;
      }
    });

    if(notify) {
      this.notifyListeners(DiatumEvent.Conversation);
    }
  }

  private async syncDialogueConversation(dialogueId: string): Promsie<void> {

    // update dialogue
    let dialogue: Dialogue = await DiatumApi.getDialogue(this.session.amigoNode, this.session.amigoToken, dialogueId);
    
    let remote: TopicView[] = await DiatumApi.getDialogueTopicViews(this.session.amigoNode, this.session.amigoToken, dialogueId);
    let remoteMap: Map<string, TopicView> = new Map<string, TopicView>();
    for(let i = 0; i < remote.length; i++) {
      remoteMap.set(remote[i].topicId, remote[i]);
    }

    let local: TopicView[] = await this.storage.getDialogueTopicViews(this.session.amigoId, dialogueId);
    let localMap: Map<string, TopicView> = new Map<string, TopicView>();
    for(let i = 0; i < local.length; i++) {
      localMap.set(local[i].topicId, local[i]);
    }

    // add remote entry not in local
    await asyncForEach(remoteMap, async (value, key) => {
      if(!localMap.has(key)) {
        let topic: Topic = await DiatumApi.getDialogueTopic(this.session.amigoNode, this.session.amigoToken, dialogueId, key);
        await this.storage.addDialogueTopic(this.session.amigoId, dialogueId, topic, value.position);
      }
      else if(localMap.get(key).revision != value.revision || localMap.get(key).position != value.position) {
        let topic: Topic = await DiatumApi.getDialogueTopic(this.session.amigoNode, this.session.amigoToken, dialogueId, key);
        await this.storage.updateDialogueTopic(this.session.amigoId, dialogueId, topic, value.position);
      }
    });

    // remove any local entry not in remote
    await asyncForEach(localMap, async (value, key) => {
      if(!remoteMap.has(key)) {
        await this.storage.removeDialogueTopic(this.session.amigoId, dialogueId, key);
      }
    });

    // update dialogue entry
    await this.storage.updateDialogue(this.session.amigoId, dialogue);
  }

  private async syncInsightConversation(amigoId: string, dialogueId: string): Promise<void> {

    // get amigo synchronization path
    let path: AmigoPath = await this.storage.getAmigoPath(this.session.amigoId, amigoId);
    if(path == null) {
      throw new Error("cannot update dialogue without connection");
    }

    // update dialogue
    let dialogue: Dialogue = await DiatumApi.getInsight(path.node, path.token, dialogueId, this.authToken, this.authMessage);
    
    let remote: TopicView[] = await DiatumApi.getInsightTopicViews(path.node, path.token, dialogueId, this.authToken, this.authMessage);
    let remoteMap: Map<string, TopicView> = new Map<string, TopicView>();
    for(let i = 0; i < remote.length; i++) {
      remoteMap.set(remote[i].topicId, remote[i]);
    }

    let local: TopicView[] = await this.storage.getInsightTopicViews(this.session.amigoId, amigoId, dialogueId);
    let localMap: Map<string, TopicView> = new Map<string, TopicView>();
    for(let i = 0; i < local.length; i++) {
      localMap.set(local[i].topicId, local[i]);
    }

    // add remote entry not in local
    await asyncForEach(remoteMap, async (value, key) => {

      if(!localMap.has(key)) {
        let topic: Topic = await DiatumApi.getInsightTopic(path.node, path.token, dialogueId, key, this.authToken, this.authMessage);
        await this.storage.addInsightTopic(this.session.amigoId, amigoId, dialogueId, topic, value.position);
      }
      else if(localMap.get(key).revision != value.revision || localMap.get(key).position != value.position) {
        let topic: Topic = await DiatumApi.getInsightTopic(path.node, path.token, dialogueId, key, this.authToken, this.authMessage);
        await this.storage.updateInsightTopic(this.session.amigoId, amigoId, dialogueId, topic, value.position);
      }
    });

    // remove any local entry not in remote
    await asyncForEach(localMap, async (value, key) => {
      if(!remoteMap.has(key)) {
        await this.storage.removeInsightTopic(this.session.amigoId, dialogueId, key);
      }
    });

    // update dialogue entry
    await this.storage.updateInsight(this.session.amigoId, amigoId, dialogue);
  }

  public async setProfileName(value: string): Promise<void> {
    let message = await DiatumApi.setProfileName(this.session.amigoNode, this.session.amigoToken, value);
    await this.updateProfile(message);
  }

  public async setProfileImage(value: string): Promise<void> {
    let message = await DiatumApi.setProfileImage(this.session.amigoNode, this.session.amigoToken, value);
    await this.updateProfile(message);
  }

  public async setProfileLocation(value: string): Promise<void> {
    let message = await DiatumApi.setProfileLocation(this.session.amigoNode, this.session.amigoToken, value);
    await this.updateProfile(message);
  }

  public async setProfileDescription(value: string): Promise<void> {
    let message = await DiatumApi.setProfileDescription(this.session.amigoNode, this.session.amigoToken, value);
    await this.updateProfile(message);
  }

  private async updateProfile(message: AmigoMessage): Promise<void> {
    let amigo = getAmigoObject(message);
    let dirty = await DiatumApi.getDirtyIdentity(this.session.amigoNode, this.session.amigoToken);
    if(dirty) {
      await DiatumApi.setRegistryMessage(amigo.registry, message);
      await DiatumApi.clearDirtyIdentity(this.session.amigoNode, this.session.amigoToken, amigo.revision);
    }
    await this.syncIdentity();
  }

  public async getIdentity(): Promsie<IdentityProfile> {
    amigo = await this.storage.getAccountObject(this.session.amigoId, IDENTITY_KEY);
    if(amigo == null) {
      return null;
    }
    let url = amigo.logo==null ? null : amigo.node + "/identity/image?token=" + this.session.amigoToken + "&revision=" + amigo.revision;
    return { name: amigo.name, handle: amigo.handle, location: amigo.location, description: amigo.description,
        amigoId: amigo.amigoId, imageUrl: url, errorFlag: this.nodeError, registry: amigo.registry };
  }

  public async getLabels(): Promise<LabelEntry[]> {
    return await this.storage.getLabels(this.session.amigoId);
  }

  public async addLabel(name: string): Promise<LabelEntry> {
    let l = await DiatumApi.addLabel(this.session.amigoNode, this.session.amigoToken, name);
    await this.syncGroup();
    return l;
  }

  public async updateLabel(labelId: string, name: string): Promise<LabelEntry> {
    let l = await DiatumApi.updateLabel(this.session.amigoNode, this.session.amigoToken, labelId, name);
    await this.syncGroup();
    return l;
  }

  public async removeLabel(labelId: string): Promise<void> {
    let l = await DiatumApi.removeLabel(this.session.amigoNode, this.session.amigoToken, labelId);
    await this.syncGroup();
  }

  public async getLabelCount(labelId: string): Promise<LabelCount> {
    return await this.storage.getLabelCount(this.session.amigoId, labelId);
  }

  public async getAttributes(labelId: string): Promise<Attribute[]> {
    return await this.storage.getAttributes(this.session.amigoId, labelId);
  }

  public async addAttribute(schema: string): Promise<Attribute> {
    let a = await DiatumApi.addAttribute(this.session.amigoNode, this.session.amigoToken, schema);
    await this.syncProfile();
    return a.attribute;
  }

  public async removeAttribute(attributeId: string): Promise<void> {
    await DiatumApi.removeAttribute(this.session.amigoNode, this.session.amigoToken, attributeId);
    await this.syncProfile();
  }

  public async setAttribute(attributeId: string, schema: string, data: string): Promise<void> {
    await DiatumApi.setAttribute(this.session.amigoNode, this.session.amigoToken, attributeId, schema, data);
    await this.syncProfile();
  }

  public async getAttributeLabels(attributeId: string): Promise<string[]> {
    return await this.storage.getAttributeLabels(this.session.amigoId, attributeId);
  }

  public async setAttributeLabel(attributeId: string, labelId: string): Promise<void> {
    await DiatumApi.setAttributeLabel(this.session.amigoNode, this.session.amigoToken, attributeId, labelId);
    await this.syncProfile();
  }

  public async clearAttributeLabel(attributeId: string, labelId: string): Promise<void> {
    await DiatumApi.clearAttributeLabel(this.session.amigoNode, this.session.amigoToken, attributeId, labelId);
    await this.syncProfile();
  }

  public async getContacts(labelId: string, status: string): Promise<ContactEntry[]> {
    let c: Contact = await this.storage.getContacts(this.session.amigoId, labelId, status);
    let entries: ContactEntry[] = [];
    for(let i = 0; i < c.length; i++) {
      let url: string = c[i].logoSet ? this.session.amigoNode + "/index/amigos/" + c[i].amigoId + "/logo?token=" + this.session.amigoToken + "&revision=" + c[i].revision: null;
      entries.push({ amigoId: c[i].amigoId, name: c[i].name, handle: c[i].handle, registry: c[i].registry, location: c[i].location, description: c[i].description, notes: c[i].notes, blocked: c[i].blocked, status: c[i].status, imageUrl: url, appAttribute: c[i].appAttribute, appSubject: c[i].appSubject, errorFlag: c[i].errorFlag });
    }
    return entries;
  }

  public async getContact(amigoId: string): Promise<ContactEntry> {
    let c: Contact =  await this.storage.getContact(this.session.amigoId, amigoId);
    if(c == null) {
      return null;
    }
    let url: string = c.logoSet ? this.session.amigoNode + "/index/amigos/" + c.amigoId + "/logo?token=" + this.session.amigoToken : null;
    return { amigoId: c.amigoId, name: c.name, handle: c.handle, registry: c.registry, location: c.location, description: c.description, notes: c.notes, blocked: c.blocked, status: c.status, imageUrl: url, appAttribute: c.appAttribute, appSubject: c.appSubject, errorFlag: c.errorFlag };
  }

  public async getContactAttributes(amigoId: string): Promise<Attribute[]> {
    return await this.storage.getContactAttributes(this.session.amigoId, amigoId);
  }

  public async getContactLabels(amigoId: string): Promise<string[]> {
    return await this.storage.getContactLabels(this.session.amigoId, amigoId);
  }

  public async setContactLabel(amigoId: string, labelId: string): Promise<void> {
    await DiatumApi.setAmigoLabel(this.session.amigoNode, this.session.amigoToken, amigoId, labelId); 
    await this.syncIndex();
  }

  public async clearContactLabel(amigoId: string, labelId: string): Promise<void> {
    await DiatumApi.clearAmigoLabel(this.session.amigoNode, this.session.amigoToken, amigoId, labelId); 
    await this.syncIndex();
  }

  public async setContactAttributeData(amigoId: string, obj: any): Promise<void> {
    await this.storage.setContactAttributeData(this.session.amigoId, amigoId, obj);
    this.notifyListeners(DiatumEvent.Contact);
  }

  public async setContactSubjectData(amigoId: string, obj: any): Promise<void> {
    await this.storage.setContactSubjectData(this.session.amigoId, amigoId, obj);
    this.notifyListeners(DiatumEvent.View);
  }

  public async addContact(amigoId: string, registry: string) {
    let message: AmigoMessage = await DiatumApi.getRegistryMessage(registry, amigoId);
    await DiatumApi.addAmigo(this.session.amigoNode, this.session.amigoToken, message);
    await this.syncIndex(); 
  }

  public async removeContact(amigoId: string) {
    let shareId = await this.storage.getContactShareId(this.session.amigoId, amigoId);
    try {
      if(shareId != null) {
        // if this block fails contact can be left thinking connection still on, that's ok-ish
        let node = await this.storage.getContactNode(this.session.amigoId, amigoId);
        await DiatumApi.setConnectionStatus(this.session.amigoNode, this.session.amigoToken, shareId, ShareEntry.StatusEnum.Closing);
        let message = await DiatumApi.getConnectionMessage(this.session.amigoNode, this.session.amigoToken, shareId);
        let status = await DiatumApi.setConnectionMessage(node, amigoId, message);
        await DiatumApi.setConnectionStatus(this.session.amigoNode, this.session.amigoToken, shareId, ShareEntry.StatusEnum.Closed);
        await DiatumApi.removeConnection(this.session.amigoNode, this.session.amigoToken, shareId);
      }
    }
    catch(err) {
      console.log(err);
    }
    await DiatumApi.removeAmigo(this.session.amigoNode, this.session.amigoToken, amigoId);
    await this.syncIndex();
    await this.syncShare();
  }

  public async openContactConnection(amigoId: string) {
    let node = await this.storage.getContactNode(this.session.amigoId, amigoId);
    let entry = await DiatumApi.addConnection(this.session.amigoNode, this.session.amigoToken, amigoId);
    await DiatumApi.setConnectionStatus(this.session.amigoNode, this.session.amigoToken, entry.shareId, ShareEntry.StatusEnum.Requesting);
    let message = await DiatumApi.getConnectionMessage(this.session.amigoNode, this.session.amigoToken, entry.shareId);
    let status = await DiatumApi.setConnectionMessage(node, amigoId, message);
    if(status.shareStatus == ShareEntry.StatusEnum.Connected) {
      await DiatumApi.setConnectionStatus(this.session.amigoNode, this.session.amigoToken, entry.shareId, ShareEntry.StatusEnum.Connected, status.connected);
    }
    else if(status.shareStatus == ShareEntry.StatusEnum.Received) {
      await DiatumApi.setConnectionStatus(this.session.amigoNode, this.session.amigoToken, entry.shareId, ShareEntry.StatusEnum.Requested);
    }
    else {
      throw new Error("failed to deliver request");
    }
    await this.syncShare();

    // sync amigo now that we're connected
    if(status.shareStatus == ShareEntry.StatusEnum.Connected) {
      try {
        await this.syncShare();
        let connection = await this.storage.getAmigoConnection(this.session.amigoId, amigoId);
        await this.syncAmigoConnection(connection);
      }
      catch(err) {
        console.log(err);
      } 
    }
  }

  public async closeContactConnection(amigoId: string) {
    let shareId = await this.storage.getContactShareId(this.session.amigoId, amigoId);
    try {
      if(shareId != null) {
        // if this block fails contact can be left thinking connection still on, that's ok-ish
        let node = await this.storage.getContactNode(this.session.amigoId, amigoId);
        await DiatumApi.setConnectionStatus(this.session.amigoNode, this.session.amigoToken, shareId, ShareEntry.StatusEnum.Closing);
        let message = await DiatumApi.getConnectionMessage(this.session.amigoNode, this.session.amigoToken, shareId);
        let status = await DiatumApi.setConnectionMessage(node, amigoId, message);
        await DiatumApi.setConnectionStatus(this.session.amigoNode, this.session.amigoToken, shareId, ShareEntry.StatusEnum.Closed);
      }
    }
    catch(err) {
      console.log(err);
    }
    await DiatumApi.removeConnection(this.session.amigoNode, this.session.amigoToken, shareId);
    await this.syncShare();
  }

  public async setContactNotes(amigoId: string, notes: string): Promise<void> {
    await DiatumApi.setAmigoNotes(this.session.amigoNode, this.session.amigoToken, amigoId, notes);
    await this.syncIndex();
  }

  public async clearContactNotes(amigoId: string): Promise<void> {
    await DiatumApi.clearAmigoNotes(this.session.amigoNode, this.session.amigoToken, amigoId);
    await this.syncIndex();
  }

  public async getContactRequests(): Promise<ContactRequest[]> {
    return await this.storage.getPendingAmigos(this.session.amigoId);
  }

  public async clearContactRequest(shareId: string): Promise<void> {
    await DiatumApi.removePendingAmigo(this.session.amigoNode, this.session.amigoToken, shareId);
    await this.syncPending();
  }

  public async getBlockedContacts(): Promise<ContactEntry[]> {
    let c: Contact = await this.storage.getBlockedContacts(this.session.amigoId);
    let entries: ContactEntry[] = [];
    for(let i = 0; i < c.length; i++) {
      let url: string = c[i].logoSet ? this.session.amigoNode + "/index/amigos/" + c[i].amigoId + "/logo?token=" + this.session.amigoToken + "&revision=" + c[i].revision: null;
      entries.push({ amigoId: c[i].amigoId, name: c[i].name, handle: c[i].handle, registry: c[i].registry, location: c[i].location, description: c[i].description, notes: c[i].notes, blocked: c[i].blocked, status: c[i].status, imageUrl: url, appAttribute: c[i].appAttribute, appSubject: c[i].appSubject, errorFlag: c[i].errorFlag });
    }
    return entries;
  }

  public async setBlockedContact(amigoId: string, block: boolean): Promise<void> {
    await this.storage.setBlockedContact(this.session.amigoId, amigoId, block);
    this.notifyListeners(DiatumEvent.Amigos);
  }

  public async getSubjects(labelId: string): Promise<SubjectRecord[]> {
    let subjects = await this.storage.getSubjects(this.session.amigoId, labelId);
    for(let i = 0; i < subjects.length; i++) {
      subjects[i].asset = (assetId: string) => {
        return this.session.amigoNode + "/show/subjects/" + subjects[i].subjectId + "/assets/" + assetId + "?token=" + this.session.amigoToken;
      }
      subjects[i].upload = (transforms: string[]) => {
        return this.session.amigoNode + "/show/subjects/" + subjects[i].subjectId + "/assets?token=" + this.session.amigoToken + "&transforms=" + encodeURIComponent(transforms.join());
      }
    }
    return subjects;
  }

  public async getSubject(subjectId: string): Promise<SubjectRecord> {
    let subject = await this.storage.getSubject(this.session.amigoId, subjectId);
    if(subject != null) {
      subject.asset = (assetId: string) => {
        return this.session.amigoNode + "/show/subjects/" + subject.subjectId + "/assets/" + assetId + "?token=" + this.session.amigoToken;
      }
      subject.upload = (transforms: string[]) => {
        return this.session.amigoNode + "/show/subjects/" + subject.subjectId + "/assets?token=" + this.session.amigoToken + "&transforms=" + encodeURIComponent(transforms.join());
      }
    }
    return subject;
  }

  public async getSubjectTags(subjectId: string): Promise<Tag[]> {
    return await this.storage.getSubjectTags(this.session.amigoId, subjectId);
  }

  public async addSubjectTag(subjectId: string, schema: string, data: string): Promise<void> {
    await DiatumApi.addSubjectTag(this.session.amigoNode, this.session.amigoToken, subjectId, schema, data);
    await this.syncShow();
  }  

  public async removeSubjectTag(subjectId: string, tagId: string, schema: string): Promise<void> {
    await DiatumApi.removeSubjectTag(this.session.amigoNode, this.session.amigoToken, subjectId, tagId, schema);
    await this.syncShow();
  }

  public async getContactSubjects(amigoId: string): Promise<SubjectItem[]> {
    let connection = await this.storage.getAmigoConnection(this.session.amigoId, amigoId);
    let subjects =  await this.storage.getConnectionSubjects(this.session.amigoId, amigoId);
    for(let i = 0; i < subjects.length; i++) {
      subjects[i].asset = (assetId: string) => { 
        return connection.node + "/view/subjects/" + subjects[i].subjectId + "/assets/" + assetId + "?token=" + connection.token + "&agent=" + this.authToken;
      }
    }
    return subjects;
  }

  public async getContactSubjectTags(amigoId: string, subjectId: string): Promsie<Tag[]> {
    return await this.storage.getConnectionSubjectTags(this.session.amigoId, amigoId, subjectId);
  }

  public async addContactSubjectTag(amigoId: string, subjectId: string, schema: string, data: string): Promise<void> {
    let connection = await this.storage.getAmigoConnection(this.session.amigoId, amigoId);
    await DiatumApi.addConnectionSubjectTag(connection.node, connection.token, this.authToken, subjectId, schema, data);
    await this.syncAmigoConnection(connection);
  }

  public async removeContactSubjectTag(amigoId: string, subjectId: string, tagId: string, schema: string): Promise<void> {
    let connection = await this.storage.getAmigoConnection(this.session.amigoId, amigoId);
    await DiatumApi.removeConnectionSubjectTag(connection.node, connection.token, this.authToken, subjectId, tagId, schema);
    await this.syncAmigoConnection(connection);
  }

  public async getBlockedSubjects(): Promise<SubjectItem[]> {
    let subjects = await this.storage.getBlockedSubjects(this.session.amigoId);
    for(let i = 0; i < subjects.length; i++) {
      let connection = await this.storage.getAmigoConnection(this.session.amigoId, subjects[i].amigoId);
      subjects[i].asset = (assetId: string) => {
        return connection.node + "/view/subjects/" + subjects[i].subjectId + "/assets/" + assetId + "?token=" + connection.token + "&agent=" + this.authToken;
      }
    }
    return subjects;
  }

  public async setBlockedSubject(amigoId: string, subjectId: string, block: boolean): Promise<void> {
    await this.storage.setBlockedSubject(this.session.amigoId, amigoId, subjectId, block);
    this.notifyListeners(DiatumEvent.View, amigoId);
  }

  public async syncContact(amigoId: string): Promise<void> {
    let connection = await this.storage.getAmigoConnection(this.session.amigoId, amigoId);
    await this.syncAmigoConnection(connection);
  }    

  public async addSubject(schema: string): Promise<string> {
    let entry = await DiatumApi.addSubject(this.session.amigoNode, this.session.amigoToken, schema);
    await this.syncShow();
    return entry.subject.subjectId;
  }

  public async removeSubject(subjectId: string): Promise<void> {
    await DiatumApi.removeSubject(this.session.amigoNode, this.session.amigoToken, subjectId);
    await this.syncShow();
  }

  public async getSubjectLabels(subjectId: string): Promise<string[]> {
    return await this.storage.getSubjectLabels(this.session.amigoId, subjectId);
  }

  public async setSubjectLabel(subjectId: string, labelId: string): Promise<void> {
    await DiatumApi.setSubjectLabel(this.session.amigoNode, this.session.amigoToken, subjectId, labelId);
    await this.syncShow();
  }

  public async clearSubjectLabel(subjectId: string, labelId: string): Promise<void> {
    await DiatumApi.clearSubjectLabel(this.session.amigoNode, this.session.amigoToken, subjectId, labelId);
    await this.syncShow();
  }
  
  public async setSubjectData(subjectId: string, schema: string, data: string): Promise<void> {
    await DiatumApi.setSubjectData(this.session.amigoNode, this.session.amigoToken, subjectId, schema, data);
    await this.syncShow();
  }

  public async setSubjectShare(subjectId: string, share: boolean): Promise<void> {
    await DiatumApi.setSubjectShare(this.session.amigoNode, this.session.amigoToken, subjectId, share);
    await this.syncShow();
  }

  public async getConversations(labelId: string): Promise<Conversation[]> {
    let c = await this.storage.getConversations(this.session.amigoId, labelId);
    for(let i = 0; i < c.length; i++) {
      if(c[i].imageUrl != null) {
        c[i].imageUrl = this.session.amigoNode + "/index/amigos/" + c[i].amigoId + "/logo?token=" + this.session.amigoToken + "&revision=" + c[i].revision;
      }
    }
    return c;  
  }

  public async addConversation(amigoId: string): Promise<string> {
    let connection = await this.storage.getAmigoConnection(this.session.amigoId, amigoId);
    let dialogue = await DiatumApi.addConversation(this.session.amigoNode, this.session.amigoToken, amigoId);
    try {
      await DiatumApi.addInsight(connection.node, connection.token, this.authToken, dialogue.dialogueId, dialogue.revision); 
    }
    catch(err) {
      console.log(err);
      await this.syncDialogue();
      return null;
    } 
    try {
      await DiatumApi.updateConversation(this.session.amigoNode, this.session.amigoToken, dialogue.dialogueId, true, true, null, dialogue.revision);
    }
    catch(err) {
      console.log(err);
      await this.storage.setConversationOffsync(this.session.amigoId, amigoId, dialogue.dialogueId, true);
    }
    await this.syncDialogue();
    return dialogue.dialogueId;
  }

  public async getTopicViews(amigoId: string, dialogueId: string, hosting: boolean): Promise<TopicView[]> {
    return await this.storage.getTopicViews(this.session.amigoId, amigoId, dialogueId, hosting);
  }

  public async getTopicBlurbs(amigoId: string, dialogueId: string, hosting: boolean, topicId: string): Promise<Blurb[]> {
    return await this.storage.getTopicBlurbs(this.session.amigoId, amigoId, dialogueId, hosting, topicId);
  }

  public async addConversationBlurb(amigoId: string, dialogueId: string, hosting: boolean, schema: string, data: string): Promise<void> {
    let connection = await this.storage.getAmigoConnection(this.session.amigoId, amigoId);
    if(hosting) {
      let blurb = await DiatumApi.addBlurb(this.session.amigoNode, this.session.amigoToken, dialogueId, schema, data);
      try {
        await DiatumApi.updateContactInsight(connection.node, connection.token, this.authToken, dialogueId, blurb.revision);
        await DiatumApi.updateConversation(this.session.amigoNode, this.session.amigoToken, dialogueId, null, true, null, blurb.revision);
      }
      catch(err) {
        console.log(err);
      }
      await this.syncDialogue();
    }
    else {
      let blurb = await DiatumApi.addContactBlurb(connection.node, connection.token, this.authToken, dialogueId, schema, data);
      try {
        await DiatumApi.updateInsight(this.session.amigoNode, this.session.amigoToken, amigoId, dialogueId, blurb.revision);
        await DiatumApi.updateContactConversation(connection.node, connection.token, this.authToken, dialogueId, null, true, blurb.revision);
      } 
      catch(err) {
        console.log(err);
      }
      await this.syncInsight();
    }
  }

  public async removeConversationBlurb(amigoId: string, dialogueId: string, hosting: boolean, blurbId: string): Promise<void> {
    let connection = await this.storage.getAmigoConnection(this.session.amigoId, amigoId);
    if(hosting) {
      let blurb = await DiatumApi.removeBlurb(this.session.amigoNode, this.session.amigoToken, dialogueId, blurbId);
      try {
        let dialogue = await DiatumApi.updateConversation(this.session.amigoNode, this.session.amigoToken, dialogueId, null, null, null, null);
        await DiatumApi.updateContactInsight(connection.node, connection.token, this.authToken, dialogueId, dialogue.revision);
        await this.syncDialogue();
      }
      catch(err) {
        console.log(err);
      }
      await this.syncDialogue();
    }
    else {
      let blurb = await DiatumApi.removeContactBlurb(connection.node, connection.token, this.authToken, dialogueId, blurbId);
      try {
        let dialogue = await DiatumApi.updateContactConversation(connection.node, connection.token, this.authToken, dialogueId, null, null, null);
        await DiatumApi.updateInsight(this.session.amigoNode, this.session.amigoToken, amigoId, dialogueId, dialogue.revision);
      } 
      catch(err) {
        console.log(err);
      }
      await this.syncInsight();
    }
  }

  public async setConversationAppData(amigoId: string, dialogueId: string, hosting: boolean, data: any): Promise<void> {
    await this.storage.setConversationAppData(this.session.amigoId, amigoId, dialogueId, hosting, data);
    this.notifyListeners(DiatumEvent.Conversation);
  }

  public async setConversationBlurbData(amigoId: string, dialogueId: string, hosting: boolean, data: any): Promise<void> {
    await this.storage.setConversationBlurbData(this.session.amigoId, amigoId, dialogueId, hosting, data);
    this.notifyListeners(DiatumEvent.Conversation);
  }

  public async syncConversation(amigoId: string, dialogueId: string, hosting: boolean): Promise<void> {
    let connection = await this.storage.getAmigoConnection(this.session.amigoId, amigoId);
    if(hosting) {
      let dialogue = await DiatumApi.updateConversation(this.session.amigoNode, this.session.amigoToken, dialogueId, null, null, null, null);
      await DiatumApi.updateContactInsight(connection.node, connection.token, this.authToken, dialogueId, dialogue.revision);
      await this.syncDialogue();
    }
    else {
      let dialogue = await DiatumApi.updateContactConversation(connection.node, connection.token, this.authToken, dialogueId, null, null, null);
      await DiatumApi.updateInsight(this.session.amigoNode, this.session.amigoToken, amigoId, dialogueId, dialogue.revision);
    } 
    await this.syncInsight();
  }

  public async closeConversation(amigoId: string, dialogueId: string, hosting: boolean): Promise<void> {
    let connection = await this.storage.getAmigoConnection(this.session.amigoId, amigoId);
    if(hosting) {
      let dialogue = await DiatumApi.updateConversation(this.session.amigoNode, this.session.amigoToken, dialogueId, null, null, false, null);
      try {
        await DiatumApi.updateContactInsight(connection.node, connection.token, this.authToken, dialogueId, dialogue.revision);
      }
      catch(err) {
        console.log(err);
      }
      await this.syncDialogue();
    }
    else {
      let dialogue = await DiatumApi.updateContactConversation(connection.node, connection.token, this.authToken, dialogueId, false, null, null);
      await DiatumApi.updateInsight(this.session.amigoNode, this.session.amigoToken, amigoId, dialogueId, dialogue.revision);
    } 
    await this.syncInsight();
  }

  public async removeConversation(amigoId: string, dialogueId: string, hosting: boolean): Promise<void> {
    let connection = await this.storage.getAmigoConnection(this.session.amigoId, amigoId);
    if(hosting) {
      await DiatumApi.removeConversation(this.session.amigoNode, this.session.amigoToken, dialogueId);
      try {
        await DiatumApi.removeContactInsight(connection.node, connection.token, this.authToken, dialogueId);
      }
      catch(err) {
        console.log(err);
      }
      await this.syncDialogue();
    }
    else {
      await DiatumApi.removeInsight(this.session.amigoNode, this.session.amigoToken, amigoId, dialogueId);
      try {
        await DiatumApi.updateContactConversation(connection.node, connection.token, this.authToken, dialogueId, false, null, null);
      }
      catch(err) {
        console.log(err);
      }
      await this.syncInsight();
    }
  }

}

let instance: _Diatum | undefined;

function appState(state: AppStateStatus) {
  if(state.match(/inactive|background/)) {
    instance.setState(false);
  }
  else {
    instance.setState(true);
  }
}

async function init(path: string, attributes: string[], subjects: string[], tag: string, 
    callback: (type: DiatumDataType, objectId: string) => {}): Promise<AppContext> {
  if(instance !== undefined) {
    throw "diatum already initialised";
  }
  instance = new _Diatum(attributes, subjects, tag);
  let ctx = await instance.init(path, callback);
  let active: boolean = true;
  let busy: boolean = false;

  // periodically syncrhonize  
  setInterval(async () => {
    if(active && !busy) {
      busy = true;
      try {
        await instance.sync();
      }
      catch(err) {
        console.log(err);
      }
      busy = false;
    }
  }, SYNC_INTERVAL_MS);
  
  // update app state
  AppState.addEventListener("change", (state) => {
    if(state.match(/inactive|background/)) {
      active = false;
    }
    else {
      active = true;
    }
  });

  return { context: ctx };
}

async function getInstance(): Promise<_Diatum> {
  if(instance !== undefined) {
    return instance;
  }
  throw "diatum not initialized";
}

async function setAppContext(ctx: AppContext): Promise<void> {
  let diatum = await getInstance();
  return diatum.setAppContext(ctx);
}

async function clearAppContext(): Promsie<void> {
  let diatum = await getInstance();
  return diatum.clearAppContext();
}

async function setSession(session: DiatumSession): Promise<void> {
  let diatum = await getInstance();
  return diatum.setSession(session);
}

async function clearSession(): Promise<void> {
  let diatum = await getInstance();
  return diatum.clearSession();
}

async function getAccountData(key: string): Promise<any> {
  let diatum = await getInstance();
  return await diatum.getAccountData(key);
}

async function setAccountData(key: string, data: any): Promise<void> {
  let diatum = await getInstance();
  return await diatum.setAccountData(key, data);
}

async function setListener(event: DiatumEvent, callback: (objectId: string) => void): Promise<void> {
  let diatum = await getInstance();
  return diatum.setListener(event, callback);
}

async function clearListener(event: DiatumEvent, callback: (objectId: string) => void): Promise<void> {
  let diatum = await getInstance();
  return diatum.clearListener(event, callback);
}

async function setProfileName(value: string): Promise<void> {
  let diatum = await getInstance();
  return diatum.setProfileName(value);
}

async function setProfileImage(value: string): Promise<void> {
  let diatum = await getInstance();
  return diatum.setProfileImage(value);
}

async function setProfileLocation(value: string): Promise<void> {
  let diatum = await getInstance();
  return diatum.setProfileLocation(value);
}

async function setProfileDescription(value: string): Promise<void> {
  let diatum = await getInstance();
  return diatum.setProfileDescription(value);
}

async function getRegistryAmigo(amigoId: string, registry: string): Promise<Amigo> {
  let msg = await DiatumApi.getRegistryMessage(registry, amigoId);
  return getAmigoObject(msg);
}

function getRegistryImage(amigoId: string, registry: string): string {
  return registry + "/amigo/messages/logo?amigoId=" + amigoId;
}

async function getIdentity(): Promise<IdentityProfile> {
  let diatum = await getInstance();
  return await diatum.getIdentity();
}

async function getLabels(): Promise<LabelEntry[]> {
  let diatum = await getInstance();
  return await diatum.getLabels();
}

async function addLabel(name: string): Promise<LabelEntry> {
  let diatum = await getInstance();
  return await diatum.addLabel(name);
}

async function updateLabel(labelId: string, name: string): Promise<LabelEntry> {
  let diatum = await getInstance();
  return await diatum.updateLabel(labelId, name);
}

async function removeLabel(labelId: string): Promise<void> {
  let diatum = await getInstance();
  return await diatum.removeLabel(labelId);
}

async function getLabelCount(labelId: string): Promise<LabelCount> {
  let diatum = await getInstance();
  return await diatum.getLabelCount(labelId);
}

async function getAttributes(labelId: string): Promise<Attribute[]> {
  let diatum = await getInstance();
  return await diatum.getAttributes(labelId);
}

async function addAttribute(schema: string): Promise<Attribute> {
  let diatum = await getInstance();
  return await diatum.addAttribute(schema);
}

async function removeAttribute(attributeId: string): Promise<void> {
  let diatum = await getInstance();
  return await diatum.removeAttribute(attributeId);
}

async function setAttribute(attributeId: string, schema: string, data: string): Promise<void> {
  let diatum = await getInstance();
  return await diatum.setAttribute(attributeId, schema, data);
}

async function getAttributeLabels(attributeId: string): Promise<string[]> {
  let diatum = await getInstance();
  return await diatum.getAttributeLabels(attributeId);
}

async function setAttributeLabel(attributeId: string, labelId: string): Promise<void> {
  let diatum = await getInstance();
  return await diatum.setAttributeLabel(attributeId, labelId);
}

async function clearAttributeLabel(attributeId: string, labelId: string): Promise<void> {
  let diatum = await getInstance();
  return await diatum.clearAttributeLabel(attributeId, labelId);
}

async function getContacts(labelId: string, status: string): Promise<ContactEntry[]> {
  let diatum = await getInstance();
  return await diatum.getContacts(labelId, status);
}

async function getContact(amigoId: string): Promise<ContactEntry> {
  let diatum = await getInstance();
  return await diatum.getContact(amigoId);
}

async function getContactAttributes(amigoId: string): Promsie<Attribute[]> {
  let diatum = await getInstance();
  return await diatum.getContactAttributes(amigoId);
}

async function getContactLabels(amigoId: string): Promise<string[]> {
  let diatum = await getInstance();
  return await diatum.getContactLabels(amigoId);
}

async function setContactLabel(amigoId: string, labelId: string): Promise<void> {
  let diatum = await getInstance();
  return await diatum.setContactLabel(amigoId, labelId);
}

async function clearContactLabel(amigoId: string, labelId: string): Promise<void> {
  let diatum = await getInstance();
  return await diatum.clearContactLabel(amigoId, labelId);
}

async function setContactAttributeData(amigoId: string, obj: any): Promise<void> {
  let diatum = await getInstance();
  return await diatum.setContactAttributeData(amigoId, obj);
}

async function setContactSubjectData(amigoId: string, obj: any): Promise<viod> {
  let diatum = await getInstance();
  return await diatum.setContactSubjectData(amigoId, obj);
}

async function addContact(amigoId: string, registry: string): Promise<void> {
  let diatum = await getInstance();
  return await diatum.addContact(amigoId, registry);
}

async function removeContact(amigoId: string): Promise<void> {
  let diatum = await getInstance();
  return await diatum.removeContact(amigoId);
}

async function openContactConnection(amigoId: string): Promise<void> {
  let diatum = await getInstance();
  return await diatum.openContactConnection(amigoId);
}

async function closeContactConnection(amigoId: string): Promise<void> {
  let diatum = await getInstance();
  return await diatum.closeContactConnection(amigoId);
}

async function setContactNotes(amigoId: string, notes: string): Promise<void> {
  let diatum = await getInstance();
  return await diatum.setContactNotes(amigoId, notes);
}

async function clearContactNotes(amigoId: string): Promise<void> {
  let diatum = await getInstance();
  return await diatum.clearContactNotes(amigoId);
}

async function getContactRequests(): Promise<ContactRequest[]> {
  let diatum = await getInstance();
  return await diatum.getContactRequests();
}

async function clearContactRequest(shareId: string): Promise<void> {
  let diatum = await getInstance();
  return await diatum.clearContactRequest(shareId);
}

async function getBlockedContacts(): Promise<ContactEntry[]> {
  let diatum = await getInstance();
  return await diatum.getBlockedContacts();
}

async function setBlockedContact(amigoId: string, block: boolean): Promise<void> {
  let diatum = await getInstance();
  return await diatum.setBlockedContact(amigoId, block);
}

async function getSubjects(labelId: string): Promise<SubjectRecord[]> {
  let diatum = await getInstance();
  return await diatum.getSubjects(labelId);
}

async function getSubject(subjectId: string): Promise<SubjectRecord> {
  let diatum = await getInstance();
  return await diatum.getSubject(subjectId);
}

async function getSubjectTags(subjectId: string): Promise<Tag[]> {
  let diatum = await getInstance();
  return await diatum.getSubjectTags(subjectId);
}

async function addSubjectTag(subjectId: string, schema: string, data: string): Promsie<void> {
  let diatum = await getInstance();
  return await diatum.addSubjectTag(subjectId, schema, data);
}

async function removeSubjectTag(subjectId: string, tagId: string, schema: string): Promise<void> {
  let diatum = await getInstance();
  return await diatum.removeSubjectTag(subjectId, tagId, schema);
}

async function getContactSubjects(amigoId: string): Promise<SubjectItem[]> { 
  let diatum = await getInstance();
  return await diatum.getContactSubjects(amigoId);
}

async function getContactSubjectTags(amigoId: string, subjectId: string): Promsie<Tag[]> {
  let diatum = await getInstance();
  return await diatum.getContactSubjectTags(amigoId, subjectId);
}

async function addContactSubjectTag(amigoId: string, subjectId: string, schema: string, data: string): Promise<void> {
  let diatum = await getInstance();
  return await diatum.addContactSubjectTag(amigoId, subjectId, schema, data);
}

async function removeContactSubjectTag(amigoId: string, subjectId: string, tagId: string, schema: string): Promise<void> {
  let diatum = await getInstance();
  return await diatum.removeContactSubjectTag(amigoId, subjectId, tagId, schema);
}

async function getBlockedSubjects(): Promise<BlockedSubject[]> {
  let diatum = await getInstance();
  return await diatum.getBlockedSubjects();
}

async function setBlockedSubject(amigoId: string, subjectId: string, block: boolean): Promise<void> {
  let diatum = await getInstance();
  return await diatum.setBlockedSubject(amigoId, subjectId, block);
}

async function syncContact(amigoId: string): Promise<void> {
  let diatum = await getInstance();
  return await diatum.syncContact(amigoId);
}

async function addSubject(schema: string): Promise<string> {
  let diatum = await getInstance();
  return await diatum.addSubject(schema);
}

async function removeSubject(subjectId: string): Promise<void> {
  let diatum = await getInstance();
  return await diatum.removeSubject(subjectId);
}

async function getSubjectLabels(subjectId: string): Promise<string[]> {
  let diatum = await getInstance();
  return await diatum.getSubjectLabels(subjectId);
}

async function setSubjectLabel(subjectId: string, labelId: string): Promise<void> {
  let diatum = await getInstance();
  return await diatum.setSubjectLabel(subjectId, labelId);
}

async function clearSubjectLabel(subjectId: string, labelId: string): Promise<void> {
  let diatum = await getInstance();
  return await diatum.clearSubjectLabel(subjectId, labelId);
}

async function setSubjectData(subjectId: string, schema: string, data: string): Promise<void> {
  let diatum = await getInstance();
  return await diatum.setSubjectData(subjectId, schema, data);
}

async function setSubjectShare(subjectId: string, share: boolean): Promise<void> {
  let diatum = await getInstance();
  return await diatum.setSubjectShare(subjectId, share);
}

async function getConversations(labelId: string): Promise<Conversation[]> {
  let diatum = await getInstance();
  return await diatum.getConversations(labelId);
}

async function addConversation(amigoId: string): Promise<string> {
  let diatum = await getInstance();
  return await diatum.addConversation(amigoId);
}

async function getTopicViews(amigoId: string, dialogueId: string, hosting: boolean): Promise<TopicView[]> {
  let diatum = await getInstance();
  return await diatum.getTopicViews(amigoId, dialogueId, hosting);
}

async function getTopicBlurbs(amigoId: string, dialogueId: string, hosting: boolean, topicId: string): Promise<Blurb[]> {
  let diatum = await getInstance();
  return await diatum.getTopicBlurbs(amigoId, dialogueId, hosting, topicId);
}

async function addConversationBlurb(amigoId: string, dialogueId: string, hosting: boolean, schema: string, data: string): Promise<void> {
  let diatum = await getInstance();
  return await diatum.addConversationBlurb(amigoId, dialogueId, hosting, schema, data);
}

async function removeConversationBlurb(amigoId: string, dialogueId: string, hosting: boolean, blurbId: string): Promise<void> {
  let diatum = await getInstance();
  return await diatum.removeConversationBlurb(amigoId, dialogueId, hosting, blurbId);
}

async function setConversationAppData(amigoId: string, dialogueId: string, hosting: boolean, data: any): Promise<void> {
  let diatum = await getInstance();
  return await diatum.setConversationAppData(amigoId, dialogueId, hosting, data);
}

async function setConversationBlurbData(amigoId: string, dialogueId: string, hosting: boolean, data: any): Promise<void> {
  let diatum = await getInstance();
  return await diatum.setConversationBlurbData(amigoId, dialogueId, hosting, data);
}

async function syncConversation(amigoId: string, dialogueId: string, hosting: boolean): Promise<void> {
  let diatum = await getInstance();
  return await diatum.syncConversation(amigoId, dialogueId, hosting);
}

async function closeConversation(amigoId: string, dialogueId: string, hosting: boolean): Promise<void> {
  let diatum = await getInstance();
  return await diatum.closeConversation(amigoId, dialogueId, hosting);
}

async function removeConversation(amigoId: string, dialogueId: string, hosting: boolean): Promise<void> {
  let diatum = await getInstance();
  return await diatum.removeConversation(amigoId, dialogueId, hosting);
}

export const diatumInstance: Diatum = { init, setAppContext, clearAppContext, setSession, clearSession,
    getAccountData, setAccountData, setListener, clearListener, 
    getRegistryAmigo, getRegistryImage, 
    setProfileName, setProfileImage, setProfileLocation, setProfileDescription, 
    getIdentity, getLabels, getLabelCount, addLabel, updateLabel, removeLabel, 
    getAttributes, addAttribute, removeAttribute, setAttribute, getAttributeLabels, setAttributeLabel, clearAttributeLabel,
    getContacts, getContact, getContactAttributes, 
    getContactLabels, setContactLabel, clearContactLabel, setContactAttributeData, setContactSubjectData,
    addContact, removeContact, openContactConnection, closeContactConnection, setContactNotes, clearContactNotes,
    getContactRequests, clearContactRequest, getBlockedContacts, setBlockedContact,
    getSubjects, getSubject, getSubjectTags, addSubjectTag, removeSubjectTag,
    getContactSubjects, getContactSubjectTags, addContactSubjectTag, removeContactSubjectTag, 
    getBlockedSubjects, setBlockedSubject,
    addSubject, removeSubject, getSubjectLabels, setSubjectLabel, clearSubjectLabel, setSubjectData, setSubjectShare,
    getConversations, addConversation, getTopicViews, getTopicBlurbs, addConversationBlurb, removeConversationBlurb,
    setConversationAppData, setConversationBlurbData, syncConversation, closeConversation, removeConversation,
    syncContact };

