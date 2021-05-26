export interface Diatum {
  init(path: string): Promise<void>;
  get(): Promise<boolean>;
}

class _Diatum {

  constructor(path: string) {
    console.log("CONSTRUCTED!" + path);
  }

  public async get(): Promise<boolean> {
    console.log("GET!");
    return true;
  }

}

let instance: _Diatum | undefined;

async function init(path: string): Promise<void> {
  if(instance !== undefined) {
    throw "Diatum already initialised";
  }
  instance = new _Diatum(path);
}

async function getInstance(): Promise<_Diatum> {
  if(instance !== undefined) {
    return instance;
  }
  throw "Diatum not initialized";
}

async function get(): Promise<boolean> {
  let diatum = await getInstance();
  return diatum.get();
}
 
export const diatumInstance: Diatum = { init, get };
