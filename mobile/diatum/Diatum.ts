import { AppContext, DiatumSession, AmigoMessage, Amigo, Revisions, LabelEntry, LabelView } from './DiatumTypes';
import { DiatumApi } from './DiatumApi';
import { AppState, AppStateStatus } from 'react-native';
import { Storage } from './Storage';

const SYNC_INTERVAL_MS: number = 1000
const SYNC_NODE_MS: number = 5000
const SYNC_CONNECTED_MS: number = 15000;
const SYNC_DISCONNECTED_MS: number = 900000;
const REVISIONS_KEY: string = "diatum_revisions";
const ACCESS_KEY: string = "service_access";
const IDENTITY_KEY: string = "identity";

export enum DiatumEvent {
  Labels = 0,
  Identity,
  Amigos,
  COUNT
}

export interface Diatum {
  // initialize SDK and retrive previous context
  init(path: string): Promise<AppContext>;

  // set SDK context for next init
  setAppContext(ctx: AppContext): Promise<void>;

  // clear SDK context for next init
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
  getIdentity(): Promsie<Amigo>

  // get account labels
  getLabels(): Promise<LabelEntry[]>
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

class _Diatum {

  private nodeSync: number = 0;
  private session: DiatumSession;
  private storage: Storage;
  private revisions: Revisions;
  private access: ServiceAccess;
  private listeners: Map<DiatumEvent, Set<() => void>>;

  constructor() {
    this.session = null;
    this.storage = new Storage();
    this.listeners = new Map<DiatumEvent, Set<() => void>>();
    for(let i = 0; i < DiatumEvent.COUNT; i++) {
      this.listeners.set(i, new Set<() => void>());
    }
  }

  public async init(path: string): Promise<any> {
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

        // retrieve current revisions
        let rev = await DiatumApi.getRevisions(this.session.amigoNode, this.session.amigoToken);

        // update identity if revision change
        if(this.revisions.identityRevision != rev.identityRevision && this.access.enableIdentity) {
          this.syncIdentity();
          synced = true;
        }

        // update group if revision change
        if(this.revisions.groupRevision != rev.groupRevision && this.access.enableGroup) {
          this.syncGroup();
          synced = true;
        }

        // update index if revision change
        if(this.revisions.indexRevision != rev.indexRevision && this.access.enableIndex) {
          this.syncIndex();
          synced = true;
        }

        // update share if revision change
        if(this.revisions.shareRevision != rev.shareRevision && this.access.enableShare) {
          synced = true;
        }

        // update show if revision change
        if(this.revisions.showRevision != rev.showRevision && this.access.enableShow) {
          synced = true;
        }

        // update profile if revision change
        if(this.revisions.profileRevision != rev.profileRevision && this.access.enableProfile) {
          synced = true;
        }

        // store update revisions
        if(synced) {
          this.revisions = rev;
          this.storage.setAccountObject(this.session.amigoId, REVISIONS_KEY, rev);
        }
      }


      // get most stale connected contact that has not been updated in SYNC_CONNECTED_MS time

        // update listing if revision change

        // update profile if revision change

        // update view if revision change      


      // get most stale disconnected contact that has not been update in SYNC_DISCONNECTED_MS time

        // update profile if revision change
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
    //this.revisions = await this.storage.getAccountObject(amigo.amigoId, REVISIONS_KEY);
    if(this.revisions == null) {
      this.revisions = {};
    }

    // load current access
    this.access = await this.storage.getAccountObject(amigo.amigoId, ACCESS_KEY);
    if(this.access == null) {
      this.access = await DiatumApi.getServiceAccess(amigo.amigoNode, amigo.amigoToken);
      await this.storage.setAccountObject(amigo.amigoId, ACCESS_KEY, this.access);
    }

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
        await this.storeService.updateLabel(this.session.amigoId, entry);
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
        await this.storage.addAmigo(this.session.amigoId, amigo.amigoId, amigo.revision, amigo.notes);
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
          await this.storage.setAmigoLabel(this.amigoId, amigo.amigoId, amigo.labels[i]);
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


    // TODO SYNC PENDING
  }

  public async getIdentity(): Promsie<Amigo> {
    amigo = await this.storage.getAccountObject(this.session.amigoId, IDENTITY_KEY);
    if(amigo == null) {
      return null;
    }
    return { name: amigo.name, handle: amigo.handle, location: amigo.location, description: amigo.description,
        imageUrl: amigo.node + "/identity/image?token=" + this.session.amigoToken };
  }

  public async getLabels(): Promise<LabelEntry> {
    return await this.storage.getLabels(this.session.amigoId);
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

async function init(path: string): Promise<AppContext> {
  if(instance !== undefined) {
    throw "diatum already initialised";
  }
  instance = new _Diatum();
  let ctx = await instance.init(path);
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

async function getIdentity(): Promise<Amigo> {
  let diatum = await getInstance();
  return await diatum.getIdentity();
}

async function getLabels(): Promise<LabelEntry[]> {
  let diatum = await getInstance();
  return await diatum.getLabels();
}

export const diatumInstance: Diatum = { init, setAppContext, clearAppContext, setSession, clearSession,
    setListener, clearListener, getIdentity, getLabels };

