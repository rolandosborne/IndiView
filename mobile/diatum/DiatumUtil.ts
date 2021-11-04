import { AmigoMessage, Amigo, AuthMessage, Auth } from './DiatumTypes';
import base64 from 'react-native-base64'

export interface AttachCode {
  amigoId: string;
  message: AmigoMessage;
  code: string;
}

const DEFAULT_PORTAL: string = "https://portal.diatum.net/app"
const DEFAULT_REGISTRY: string = "https://registry.diatum.net/app"

export function getAmigoObject(message: AmigoMessage): Amigo {
  if(message == null) {
    return null;
  }
  // TODO validate message signature
  let amigo: Amigo = JSON.parse(base64.decode(message.data));
  // TODO confirm key hash
  return amigo;
}

export function getAuthObject(message: AuthMessage): Auth {
  if(message == null) {
    return null;
  }
  // TODO validate message signature
  let auth: Auth = JSON.parse(base64.decode(message.data));
  return auth;
}

export async function getAttachCode(username: string, password: string, portal?: string): Promise<AttachCode> {

  // use default portal if unspecified
  if(portal === undefined) {
    portal = DEFAULT_PORTAL;
  }

  // if local hosting registry and portal
  let host: string[] = username.split("||");
  if(host.length > 1) {

    // retrieve identity
    console.log("https://" + host[1] + "/registry");
    let messageResponse = await fetch("https://" + host[1] + "/registry/amigo/messages/?handle=" + host[0]);
    let message: AmigoMessage = await messageResponse.json();
    let amigo: Amigo = getAmigoObject(message); 

    // retrieve code
    let codeResponse = await fetch("https://" + host[1] + "/portal/profile/passcode?username=" + encodeURIComponent(host[0]) + "&password=" + encodeURIComponent(password), { method: 'PUT' });
    let code : string = await codeResponse.json();

    return { amigoId: amigo.amigoId, message: message, code: code };
  }

  // if local hosting registry and portal
  let alias: string[] = username.split("|");
  if(alias.length > 1) {

    // retrieve identity
    console.log("https://diatum." + alias[1] + "/registry/amigo/messages/?handle=" + alias[0]);
    let messageResponse = await fetch("https://diatum." + alias[1] + "/registry/amigo/messages/?handle=" + alias[0]);
    let message: AmigoMessage = await messageResponse.json();
    let amigo: Amigo = getAmigoObject(message); 

    // retrieve code
    let codeResponse = await fetch("https://diatum." + alias[1] + "/portal/profile/passcode?username=" + encodeURIComponent(alias[0]) + "&password=" + encodeURIComponent(password), { method: 'PUT' });
    let code : string = await codeResponse.json();

    return { amigoId: amigo.amigoId, message: message, code: code };
  }
   
  // get registry params
  let u: string[] = username.split("@");
  let reg: string = u.length > 1 ? "https://registry." + u[1] + "/app" : DEFAULT_REGISTRY;

  // retrieve identity
  console.log(reg + "/amigo/messages/?handle=" + u[0]);
  let messageResponse = await fetch(reg + "/amigo/messages/?handle=" + u[0]);
  let message: AmigoMessage = await messageResponse.json();
  let amigo: Amigo = getAmigoObject(message);

  // retrieve code
  let codeResponse = await fetch(portal + "/account/passcode?amigoId=" + amigo.amigoId + "&password=" + encodeURIComponent(password), { method: 'PUT' });
  let code: string = await codeResponse.json();

  return { amigoId: amigo.amigoId, message: message, code: code };
}


