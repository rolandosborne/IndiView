import { AmigoMessage } from './DiatumTypes';
import base64 from 'react-native-base64'

export interface AttachCode {
  amigoId: string;
  message: AmigoMessage;
  code: string;
}

const DEFAULT_PORTAL: string = "https://portal.diatum.net/app"
const DEFAULT_REGISTRY: string = "https://registry.diatum.net/app"

function getAmigoObject(message: AmigoMessage): Amigo {
  // TODO validate message signature
  let amigo: Amigo = JSON.parse(base64.decode(message.data));
  // TODO confirm key hash
  return amigo;
}

export async function getAttachCode(username: string, password: string, portal?: string): Promise<AttachCode> {

  // use default portal if unspecified
  if(portal === undefined) {
    portal = DEFAULT_PORTAL;
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

