import { AppContext, DiatumSession } from './DiatumTypes';

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
}

class _Diatum {

  constructor(path: string) {
    console.log("CONSTRUCTED!" + path);
  }

  public async setAppContext(ctx: AppContext): Promise<void> {
    return;
  }

  public async clearAppContext(): Promise<void> {
    return;
  }

  public async setSession(session: DiatumSession): Promise<void> {
    return;
  }

}

let instance: _Diatum | undefined;

async function init(path: string): Promise<void> {
  if(instance !== undefined) {
    throw "diatum already initialised";
  }
  instance = new _Diatum(path);
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
 
export const diatumInstance: Diatum = { init, setAppContext, clearAppContext, setSession, clearSession };

