import { AttachCode } from '../sdk/DiatumTypes'

const INDIVIEW_SERVER: string = "https://indiview.coredb.org/app/"

export interface Login { 
  appToken: string;
  accountToken: string;
  accountNode: string;
  serviceToken: string;
  serviceNode: string;
}

export class NetCom {
    
    static async attach(attachCode: AttachCode): Promise<Login> {

console.log("FETCH: ", INDIVIEW_SERVER);
      let loginResponse = await fetch(INDIVIEW_SERVER + "account/attach?code=" + attachCode.code, 
          { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(attachCode.message) });
      return await loginResponse.json();
    }
}

