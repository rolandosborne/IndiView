import { AttachCode } from '../sdk/DiatumTypes'

const INDIVIEW_SERVER: string = "https://indiview.coredb.org/app/"
const FETCH_TIMEOUT = 15000;

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

export interface Config {
  searchable: boolean;
  videoQuality: string;
  audioQuality: string;
  videoMute: string;
  audioMute: string;
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

let token: string;
export function setNotifications(data) {
  console.log(data);
  token = JSON.stringify(data);
}

export class IndiViewCom {

    static async setEvent(token: string, amigoId: string, event: string): Promise<void> {
      let response = await fetchWithTimeout(INDIVIEW_SERVER + "account/notify?token=" + encodeURIComponent(token) + "&amigoId=" + encodeURIComponent(amigoId) + "&event=" + event,
          { method: 'PUT', headers: { 'Content-Type': 'application/json' } });
      checkResponse(response);
    }

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

    static async setIdentity(token: string): Promise<Integer> {
      let response = await fetchWithTimeout(INDIVIEW_SERVER + "account/identity?token=" + encodeURIComponent(token), { method: 'PUT' });
      checkResponse(response);
      return await response.json();
    }

    static async getSettings(token: string): Promise<Config> {
      let response = await fetchWithTimeout(INDIVIEW_SERVER + "account/settings?token=" + encodeURIComponent(token));
      checkResponse(response);
      return await response.json();
    }

    static async setSettings(token: string, data): Promise<void> {
      let response = await fetchWithTimeout(INDIVIEW_SERVER + "account/settings?token=" + encodeURIComponent(token),
          { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      checkResponse(response);
    }

    static async setAlert(token: string, amigoId: string): Promise<void> {
      let response = await fetchWithTimeout(INDIVIEW_SERVER + "account/report?token=" + encodeURIComponent(token) + "&amigoId=" + amigoId, { method: 'PUT' });
      checkResponse(response);
    }
}

