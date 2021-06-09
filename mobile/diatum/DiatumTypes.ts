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

export interface AuthMessage { 
    amigo: AmigoMessage;
    data: string;
    signature: string;
}

export interface Auth { 
    amigoId: string;
    issued: number;
    expires: number;
    token: string;
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

export interface AttributeView { 
    attributeId: string;
    revision: number;
}

export interface Attribute { 
    attributeId: string;
    revision: number;
    schema: string;
    data: string;
}

export interface AttributeEntry { 
    attribute: Attribute;
    labels: Array<string>;
}

export interface SubjectView { 
    subjectId: string;
    revision: number;
    tagRevision: number;
}

export interface Subject { 
    subjectId: string;
    revision: number;
    created: number;
    modified: number;
    expires?: number;
    schema?: string;
    data?: string;
}

export interface SubjectEntry { 
    subject: Subject;
    share: boolean;
    ready: boolean;
    assets: Array<SubjectAsset>;
    originals: Array<OriginalAsset>;
    labels?: Array<string>;
}

export interface OriginalAsset { 
    assetId: string;
    originalName?: string;
    state?: OriginalAsset.StateEnum;
    size?: number;
    hash?: string;
    created?: number;
}
export namespace OriginalAsset {
    export type StateEnum = 'uploaded' | 'deleted';
    export const StateEnum = {
        Uploaded: 'uploaded' as StateEnum,
        Deleted: 'deleted' as StateEnum
    };
}

export interface SubjectAsset { 
    assetId: string;
    originalId?: string;
    transform?: string;
    state?: SubjectAsset.StateEnum;
    size?: number;
    hash?: string;
    created?: number;
}

export namespace SubjectAsset {
    export type StateEnum = 'uploading' | 'pending' | 'processing' | 'ready' | 'failed' | 'deleted';
    export const StateEnum = {
        Uploading: 'uploading' as StateEnum,
        Pending: 'pending' as StateEnum,
        Processing: 'processing' as StateEnum,
        Ready: 'ready' as StateEnum,
        Failed: 'failed' as StateEnum,
        Deleted: 'deleted' as StateEnum
    };
}

export interface SubjectTag { 
    revision: number;
    tags: Array<Tag>;
}

export interface Tag { 
    tagId: string;
    amigoId: string;
    amigoName: string;
    amigoRegistry: string;
    created: number;
    schema: string;
    data: string;
}

export interface ShareView { 
    shareId: string;
    revision: number;
}

export interface ShareEntry { 
    shareId: string;
    revision?: number;
    status: ShareEntry.StatusEnum;
    amigoId: string;
    token?: string;
    updated?: number;
}

export namespace ShareEntry {
    export type StatusEnum = 'requesting' | 'requested' | 'received' | 'connected' | 'closing' | 'closed';
    export const StatusEnum = {
        Requesting: 'requesting' as StatusEnum,
        Requested: 'requested' as StatusEnum,
        Received: 'received' as StatusEnum,
        Connected: 'connected' as StatusEnum,
        Closing: 'closing' as StatusEnum,
        Closed: 'closed' as StatusEnum
    };
}
