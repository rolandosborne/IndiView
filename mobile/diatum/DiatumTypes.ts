export interface DiatumContext {
  context: any;
}

export interface DiatumSession {
  amigoId: string;
  amigoNode: string;
  amigoToken: string;
  appNode: string;
  appToken: string;
}

export interface AttachCode {
  amigoId: string;
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

export interface Revisions { 
  showRevision?: number;
  identityRevision?: number;
  profileRevision?: number;
  groupRevision?: number;
  shareRevision?: number;
  promptRevision?: number;
  serviceRevision?: number;
  indexRevision?: number;
  userRevision?: number;
  listingRevision?: number;
  contactRevision?: number;
  viewRevision?: number;
}

