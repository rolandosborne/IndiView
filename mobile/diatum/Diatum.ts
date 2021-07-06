import { AppContext, DiatumSession, AmigoMessage, Amigo, AuthMessage, Auth, Revisions, LabelEntry, LabelView, PendingAmigo, PendingAmigoView, SubjectView, SubjectEntry, SubjectTag, ShareView, ShareEntry, InsightView, DialogueView } from './DiatumTypes';
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

export enum DiatumDataType {
  Identity,
  Attribute,
  Subject,
  AmigoIdentity,
  AmigoAttribute,
  AmigoSubject,
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
  Insight,
  Dialogue,
  COUNT
}

export interface Diatum {
  // initialize SDK and retrive previous context
  init(path: string, attributes: string[], subjects: string[], tag: string,
    callback: (type: DiatumDataType, amigoId: string, objectId: string) => {}): Promise<AppContext>;

  // set context for next init
  setAppContext(ctx: AppContext): Promise<void>;

  // clear context for next init
  clearAppContext(): Promise<void>;

  // set active identity
  setSession(session: DiatumSession): Promise<void>;

  // clear active identity
  clearSession(): Promise<void>;

  // add event listener
  setListener(event: DiatumEvent, callback: () => void): Promise<void>;

  // remove added listener
  clearListener(callback: () => void): Promise<void>;

  // get public profile
  getIdentity(): Promsie<IdentityProfile>

  // get account labels
  getLabels(): Promise<LabelEntry[]>

  // get contacts
  getContacts(labelId: string): Promise<ContactEntry[]>

  // get specified contact
  getContact(amigoId: string): Promise<ContactEntry>

  // get attributes for specified contact
  getContactAttributes(amigoId: string): Promise<Attribute[]>

  // set app data for amigo
  setContactAttributeData(amigoId: string, obj: any): Promise<void>
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
  private callback: (type: DiatumDataType, amigoId: string, objectId: string) => {};

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

  public async init(path: string, cb: (type: DiatumDataType, amigoId: string, objectId: string) => {}): Promise<any> {
    this.callback = cb;

    await this.storage.init(path);
    try {
      return await this.storage.getAppContext();
    }
    catch(err) {
      return null;
    }
  }

  public setListener(event: DiatumEvent, callback: () => void): void {
    this.listeners.get(event).add(callback);
    callback();
  }

  public clearListener(event: DiatumEvent, callback: () => void): void {
    this.listeners.get(event).delete(callback);
  }

  private async notifyListeners(event: DiatumEvent): Promsie<void> {
    let arr = [];
    this.listeners.get(event).forEach(v => {
      arr.push(v);
    });
    for(let i = 0; i < arr.length; i++) {
      await arr[i]();
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
        this.authSyc = cur;
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
          await this.storage.updateAmigoConnectionError(this.session.amigoId, connections[i].amigoId, true);
          this.notifyListeners(DiatumEvent.Contact);
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
            console.log(err);
            await this.storage.updateAmigoConnectionError(this.session.amigoId, connection.amigoId, true);
            this.notifyListeners(DiatumEvent.Contact);
            
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
    // pull revisions with agent auth
    let revisions = await DiatumApi.getConnectionRevisions(connection.node, connection.token, this.authToken, this.authMessage);

    // if identity revision is different, update registry
    if(revisions.identityRevision != connection.identityRevision) {
      let amigo = await DiatumApi.getConnectionListing(connection.node, connection.token, this.authToken);
      if(amigo.amigoId == connection.amigoId) { // sanity check
        await this.storage.updateAmigoIdentity(this.session.amigoId, amigo);
        this.notifyListeners(DiatumEvent.Listing);
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
      this.notifyListeners(DiatumEvent.Contact);
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
        await this.callback(DiatumDataType.AmigoAttribute, amigoId, a.attributeId);
        notify = true;
      }
      else if(localMap.get(key) != value) {
        let a: Attribute = await DiatumApi.getConnectionAttribute(node, token, this.authToken, key);
        await this.storage.updateConnectionAttribute(this.session.amigoId, amigoId, a);
        await this.callback(DiatumDataType.AmigoAttribute, amigoId, a.attributeId);
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
      this.notifyListeners(DiatumEvent.Contact);
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
      this.notifyListeners(DiatumEvent.View);
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

  
  private async syncIdentity(): Promsie<void> {

    // retrieve current identity
    let amigo = await DiatumApi.getIdentity(this.session.amigoNode, this.session.amigoToken);
    await this.storage.setAccountObject(this.session.amigoId, IDENTITY_KEY, amigo);
    this.notifyListeners(DiatumEvent.Identity);
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
        let entry = await this.groupService.getLabel(this.node, this.token, key);
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
        notify = true
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
    asyncForEach(localReqMap, async (value, key) => {
      if(!remoteReqMap.has(key)) {
        await this.storage.removePendingAmigo(this.amigoId, key);
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
        let entry: AttributeEntry = await DiatumAPi.getAttribute(this.session.amigoNode, this.session.amigoToken, key);
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
          notify = true;
        }
        if(localMap.get(key).tag != value.tag) {
          let tag: SubjectTag = await DiatumApi.getSubjectTags(this.session.amigoNode, this.session.amigoToken, key, this.tagFilter);
          await this.storage.updateSubjectTags(this.session.amigoId, key, tag.revision, tag.tags);
          notify = true;
        }
      }
    });

    // remove any local entry not in remote
    await asyncForEach(localMap, async (value, key) => {
      if(!remoteMap.has(key)) {
        await this.storage.removeSubject(this.session.amigoId, key);
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
          this.storage.updateInsightRevision(this.session.amigoId, value.amigoId, value.dialogueId, value.revision, false);
        }
        catch(err) {
          console.log(err);
          this.storage.updateInsightRevision(this.session.amigoId, value.amigoId, value.dialogueId, value.revision, true);
        }
        notify = true;
      }
      else if(localMap.get(key).revision != value.revision) {
        try {
          await this.syncInsightConversation(value.amigoId, value.dialogueId);
        }
        catch(err) {
          console.log(err);
          this.storage.updateInsightRevision(this.session.amigoId, value.amigoId, value.dialogueId, value.revision, true);
        }
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
      this.notifyListeners(DiatumEvent.Insight);
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
        notify = true;
      }
      else if(localMap.get(key) != value) {
        await this.syncDialogueConversation(key);
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
      this.notifyListeners(DiatumEvent.Insight);
    }
  }

  private async syncDialogueConversation(dialogueId: string): Promsie<void> {

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
    let dialogue: Dialogue = await DiatumApi.getDialogue(this.session.amigoNode, this.session.amigoToken, dialogueId);
    await this.storage.updateDialogue(this.session.amigoId, dialogue);
  }

  private async syncInsightConversation(amigoId: string, dialogueId: string): Promise<void> {

    // get amigo synchronization path
    let path: AmigoPath = await this.storage.getAmigoPath(this.session.amigoId, amigoId);
    if(path == null) {
      throw new Error("cannot update dialogue without connection");
    }

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
        await this.storage.updateInsightTopic(this.session.amigoId, dialogueId, topic, value.position);
      }
    });

    // remove any local entry not in remote
    await asyncForEach(localMap, async (value, key) => {
      if(!remoteMap.has(key)) {
        await this.storage.removeInsightTopic(this.session.amigoId, dialogueId, key);
      }
    });

    // update dialogue entry
    let dialogue: Dialogue = await DiatumApi.getInsight(path.node, path.token, dialogueId, this.authToken, this.authMessage);

    await this.storage.updateInsight(this.session.amigoId, amigoId, dialogue);
  }

  public async getIdentity(): Promsie<IdentityProfile> {
    amigo = await this.storage.getAccountObject(this.session.amigoId, IDENTITY_KEY);
    if(amigo == null) {
      return null;
    }
    return { name: amigo.name, handle: amigo.handle, location: amigo.location, description: amigo.description,
        amigoId: amigo.amigoId, imageUrl: amigo.node + "/identity/image?token=" + this.session.amigoToken, errorFlag: this.nodeError };
  }

  public async getLabels(): Promise<LabelEntry> {
    return await this.storage.getLabels(this.session.amigoId);
  }

  public async getContacts(labelId: string): Promise<ContactEntry[]> {
    let c: Contact = await this.storage.getContacts(this.session.amigoId, labelId);
    let entries: ContactEntry[] = [];
    for(let i = 0; i < c.length; i++) {
      let url: string = c[i].logoSet ? this.session.amigoNode + "/index/amigos/" + c[i].amigoId + "/logo?token=" + this.session.amigoToken : null;
      entries.push({ amigoId: c[i].amigoId, name: c[i].name, handle: c[i].handle, location: c[i].location, description: c[i].description, notes: c[i].notes, status: c[i].status, imageUrl: url, appAttribute: c[i].appAttribute, errorFlag: c[i].errorFlag });
    }
    return entries;
  }

  public async getContact(amigoId: string): Promise<ContactEntry> {
    let c: Contact =  await this.storage.getContact(this.session.amigoId, amigoId);
    let url: string = c.logoSet ? this.session.amigoNode + "/index/amigos/" + c.amigoId + "/logo?token=" + this.session.amigoToken : null;
    return { amigoId: c.amigoId, name: c.name, handle: c.handle, location: c.location, description: c.description, notes: c.notes, status: c.status, imageUrl: url, appAttribute: c.appAttribute, errorFlag: c.errorFlag };
  }

  public async getContactAttributes(amigoId: string): Promise<Attribute[]> {
    return await this.storage.getContactAttributes(this.session.amigoId, amigoId);
  }

  public async setContactAttributeData(amigoId: string, obj: any): Promise<void> {
    return await this.storage.setContactAttributeData(this.session.amigoId, amigoId, obj);
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
    callback: (type: DiatumDataType, amigoId: string, objectId: string) => {}): Promise<AppContext> {
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

async function setListener(event: DiatumEvent, callback: () => void): Promise<void> {
  let diatum = await getInstance();
  return diatum.setListener(event, callback);
}

async function clearListener(event: DiatumEvent, callback: () => void): Promise<void> {
  let diatum = await getInstance();
  return diatum.clearListener(event, callback);
}

async function getIdentity(): Promise<IdentityProfile> {
  let diatum = await getInstance();
  return await diatum.getIdentity();
}

async function getLabels(): Promise<LabelEntry[]> {
  let diatum = await getInstance();
  return await diatum.getLabels();
}

async function getContacts(labelId: string): Promise<ContactEntry[]> {
  let diatum = await getInstance();
  return await diatum.getContacts(labelId);
}

async function getContact(amigoId: string): Promise<ContactEntry> {
  let diatum = await getInstance();
  return await diatum.getContact(amigoId);
}

async function getContactAttributes(amigoId: string): Promsie<Attribute[]> {
  let diatum = await getInstance();
  return await diatum.getContactAttributes(amigoId);
}

async function setContactAttributeData(amigoId: string, obj: any): Promise<void> {
  let diatum = await getInstance();
  return await diatum.setContactAttributeData(amigoId, obj);
}

export const diatumInstance: Diatum = { init, setAppContext, clearAppContext, setSession, clearSession,
    setListener, clearListener, getIdentity, getLabels, getContacts, getContact, getContactAttributes, setContactAttributeData };

