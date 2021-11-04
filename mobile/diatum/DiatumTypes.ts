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
  amigoId?: string;
  name?: string;
  imageUrl?: string;
  handle?: string;
  registry?: string;
  location?: string;
  description?: string;
  errorFlag?: boolean;
}

export interface ContactEntry {
  amigoId?: string;
  name?: string;
  imageUrl?: string;
  handle?: string;
  registry?: string;
  location?: string;
  description?: string;
  status?: string;
  errorFlag?: boolean
  appAttribute?: any;
  appSubject?: any;
  appData?: any;
  blocked?: boolean;
}

export interface AmigoMessage {
  key: string;
  keyType: string;
  signature: string;
  data: string;
}

export interface ShareMessage { 
    amigo: AmigoMessage;
    signature: string;
    open?: string;
    close?: string;
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

export interface ContactRequest {
  shareId: string;
  revision: number;
  amigo: Amigo;
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
  dialogueRevision?: number;
  insightRevision?: number;
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

export interface LabelCount {
  attribute: number
  story: number;
  contact: number;
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

export interface SubjectItem {
    amigoId: string;
    subjectId: string;
    revision: number;
    created: number;
    modified: number;
    expires: number;
    schema: string;
    data: string;
    tagCount: number;
    blocked: boolean;
    asset?: (assetId: string) => string
}

export interface SubjectRecord {
    subjectId: string;
    revision: number;
    created: number;
    modified: number;
    expires: number;
    schema: string;
    data: string;
    share: boolean;
    ready: boolean;
    tagCount: number;
    asset?: (assetId: string) => string;
    upload?: (transforms: string[]) => string;
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

export interface SharePrompt { 
    token: string;
    image?: string;
    text?: string;
}

export interface ShareStatus { 
    shareStatus: ShareStatus.ShareStatusEnum;
    pending?: SharePrompt;
    connected?: string;
}

export namespace ShareStatus {
    export type ShareStatusEnum = 'pending' | 'failed' | 'received' | 'connected' | 'closed';
    export const ShareStatusEnum = {
        Pending: 'pending' as ShareStatusEnum,
        Failed: 'failed' as ShareStatusEnum,
        Received: 'received' as ShareStatusEnum,
        Connected: 'connected' as ShareStatusEnum,
        Closed: 'closed' as ShareStatusEnum
    };
}

export interface InsightView { 
    amigoId: string;
    dialogueId: string;
    revision: number;
}

export interface DialogueView { 
    dialogueId: string;
    revision: number;
}

export interface Dialogue { 
    dialogueId: string;
    created: number;
    modified: number;
    revision: number;
    active: boolean;
    linked: boolean;
    synced: boolean;
    amigoId: string;
    amigoRegistry?: string;
}

export interface TopicView { 
    topicId: string;
    position: number;
    revision: number;
}

export interface Blurb { 
    blurbId: string;
    amigoId: string;
    schema: string;
    data: string;
    revision: number;
    created: number;
    updated: number;
}

export interface Topic { 
    topicId: string;
    revision: number;
    blurbs: Array<Blurb>;
}

export interface Conversation {
  amigoId: string;
  imageUrl: string;
  handle: string;
  name: string;
  revision: number;
  dialogueId: string;
  modified: number;
  connected: boolean; //if amigo is in connected state
  active: boolean; //if conversation is paused
  synced: boolean;  //if dialogue and insight are synced
  linked: boolean;  //if dialogue has been linked to insight
  hosting: boolean; //if dialogue is hosted by me
  offsync: boolean; //if latest dialogue not retrieved
  appData: any;
  blurbData: any;
}    

