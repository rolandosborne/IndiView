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

export interface IdentityProfile {
  name?: string;
  imageUrl?: string;
  handle?: string;
  location?: string;
  description?: string;
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

export interface ServiceAccess { 
  enableShow?: boolean;
  enableIdentity?: boolean;
  enableProfile?: boolean;
  enableGroup?: boolean;
  enableShare?: boolean;
  enablePrompt?: boolean;
  enableService?: boolean;
  enableIndex?: boolean;
  enableUser?: boolean;
  enableAccess?: boolean;
  enableAccount?: boolean;
}

export interface LabelView { 
    labelId: string;
    revision: number;
}

export interface LabelEntry { 
    labelId: string;
    name?: string;
    revision?: number;
}

export interface AmigoView {
    amigoId: string;
    revision: number;
}

export interface AmigoEntry {
    amigoId: string;
    revision: number;
    notes?: string;
    labels: Array<string>;
}

export interface PendingAmigoView { 
    shareId: string;
    revision: number;
}

export interface PendingAmigo { 
    shareId: string;
    revision: number;
    message: AmigoMessage;
    updated: number;
}


