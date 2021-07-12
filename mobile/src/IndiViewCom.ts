import { AttachCode } from '../sdk/DiatumTypes'

const INDIVIEW_SERVER: string = "https://indiview.coredb.org/app/"
const FETCH_TIMEOUT = 5000;

export interface Login {
  amigoId: string; 
  appToken: string;
  accountToken: string;
  accountNode: string;
  serviceToken: string;
  serviceNode: string;
}

export interface Contact { 
  amigoId: string;
  registry: string;
  name: string;
  handle?: string;
  location?: string;
  description?: string;
}

function checkResponse(response) {
  if(response.status >= 400 && response.status < 600) {
    throw new Error(response.url + " failed");
  }
}

async function fetchWithTimeout(url, options) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) => setTimeout(() => reject(new Error(url + ' timeout')), FETCH_TIMEOUT))
    ]);
}

export class IndiViewCom {
    
    static async attach(attachCode: AttachCode): Promise<Login> {
      let response = await fetchWithTimeout(INDIVIEW_SERVER + "account/attach?code=" + attachCode.code, 
          { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(attachCode.message) });
      checkResponse(response);
      return await response.json();
    }

    static async search(token: string, match: string): Promise<Contact> {
      let response = await fetchWithTimeout(INDIVIEW_SERVER + "account/search?token=" + encodeURIComponent(token) + "&match=" + encodeURIComponent(match));
      checkResponse(response);
      return await response.json();
    }

}

