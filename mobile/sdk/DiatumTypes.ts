export interface DiatumContext {
  context: any;
}

export interface DiatumSession {
  amigoId: string;
  amigoRegistry: string;
  amigoNode: string;
  amigoToken: string;
  appNode: string;
  appToken: string;
}

export interface AttachCode {
  message: AmigoMessage;
  code: string;
}


export interface AmigoMessage {
  key: string;
  keyType: string;
  signature: string;
  data: string;
}

export interface Amigo {
  amigoId: string;
  name?: string;
  description?: string;
  logo?: string;
  location?: string;
  node: string;
  registry?: string;
  revision: number;
  version: string;
  handle?: string;
}

