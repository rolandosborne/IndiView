import { AppContext, DiatumSession, AmigoMessage, Amigo } from './DiatumTypes';
import { Storage } from './Storage';
import base64 from 'react-native-base64'

const DEFAULT_PORTAL: string = "https://portal.diatum.net/app"
const DEFAULT_REGISTRY: string = "https://registry.diatum.net/app"

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

  private storage: Storage;

  constructor() {
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

  public async setAppContext(ctx: AppContext): Promise<void> {
    await this.storage.setAppContext(ctx);
  }

  public async clearAppContext(): Promise<void> {
    await this.storage.clearAppContext();
  }

  public async setSession(session: DiatumSession): Promise<void> {
    return;
  }

}

let instance: _Diatum | undefined;

async function init(path: string): Promise<AppContext> {
  if(instance !== undefined) {
    throw "diatum already initialised";
  }
  instance = new _Diatum();
  let ctx = await instance.init(path);
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

  return { message: message, code: code };  
}
 
export const diatumInstance: Diatum = { init, setAppContext, clearAppContext, setSession, clearSession,
  getAttachCode };

