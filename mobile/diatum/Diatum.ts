import { AppContext, DiatumSession, AmigoMessage, Amigo, Revisions } from './DiatumTypes';
import { DiatumApi } from './DiatumApi';
import { AppState, AppStateStatus } from 'react-native';
import { Storage } from './Storage';
import base64 from 'react-native-base64'

const DEFAULT_PORTAL: string = "https://portal.diatum.net/app"
const DEFAULT_REGISTRY: string = "https://registry.diatum.net/app"
const SYNC_INTERVAL_MS: number = 1000
const SYNC_NODE_MS: number = 5000
const SYNC_CONNECTED_MS: number = 15000;
const SYNC_DISCONNECTED_MS: number = 900000;

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

  // get registry message
  getAttachCode(username: string, portal?: string): Promise<AttachCode>;
}

class _Diatum {

  private nodeSync: number = 0;
  private session: DiatumSession;
  private storage: Storage;

  constructor() {
    this.session = null;
    this.storage = new Storage();
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

  public async sync() {
    if(this.session != null) {
      let d: Date = new Date();
      let cur: number = d.getTime();

      // check node revisions every interval
      if(this.nodeSync + SYNC_NODE_MS < cur) {
       
        // update node sync time 
        this.nodeSync = cur;

        // retrieve current revisions
        let revisions = await DiatumApi.getMyRevisions(this.session.amigoNode, this.session.amigoToken);

        // update identity if revision change
        
        // update group if revision change

        // update index if revision change

        // update share if revision change

        // update show if revision change

        // update profile if revision change
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
    this.session = amigo;
  }

  public async clearSession(): Promise<void> {
    this.session = null;
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

function getAmigoObject(message: AmigoMessage): Amigo {
  // TODO validate message signature
  let amigo: Amigo = JSON.parse(base64.decode(message.data));
  // TODO confirm key hash
  return amigo;
}

async function getAttachCode(username: string, password: string, portal?: string): Promise<AttachCode> {

  // use default portal if unspecified
  if(portal === undefined) {
    portal = DEFAULT_PORTAL;
  }

  // get registry params
  let u: string[] = username.split("@");
  let reg: string = u.length > 1 ? "https://registry." + u[1] + "/app" : DEFAULT_REGISTRY;

  // retrieve identity
  let messageResponse = await fetch(reg + "/amigo/messages/?handle=" + u[0]);
  let message: AmigoMessage = await messageResponse.json();
  let amigo: Amigo = getAmigoObject(message);

  // retrieve code
  let codeResponse = await fetch(portal + "/account/passcode?amigoId=" + amigo.amigoId + "&password=" + encodeURIComponent(password), { method: 'PUT' });
  let code: string = await codeResponse.json(); 

  return { amigoId: amigo.amigoId, message: message, code: code };  
}
 
export const diatumInstance: Diatum = { init, setAppContext, clearAppContext, setSession, clearSession,
  getAttachCode };

