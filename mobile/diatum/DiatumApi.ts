import { Revisions, Amigo, LabelEntry, LabelView, AmigoEntry, AmigoView, PendingAmigo, PendingAmigoView, AttributeEntry, AttributeEntryView, SubjectView, SubjectEntry, SubjectTag, ShareMessage, ShareStatus, ShareEntry, ShareView, InsightView, DialogueView, Dialogue, TopicView, Topic } from './DiatumTypes';

const FETCH_TIMEOUT = 15000;

function checkResponse(response) {
  if(response.status >= 400 && response.status < 600) {
    throw new Error(response.url + " failed");
  }
}

async function fetchWithTimeout(url, options) {
    return Promise.race([
        fetch(url, options).catch(err => { throw new Error(url + ' failed'); }),
        new Promise((_, reject) => setTimeout(() => reject(new Error(url + ' timeout')), FETCH_TIMEOUT))
    ]);
}

export class DiatumApi {

  public static async getRevisions(node: string, token: string): Promise<Revisions> {
    let revisionsResponse = await fetchWithTimeout(node + "/token/revisions?token=" + encodeURIComponent(token), { method: 'GET', timeout: FETCH_TIMEOUT } );
    checkResponse(revisionsResponse);
    return await revisionsResponse.json();
  }

  public static async getIdentity(node: string, token: string): Promise<Amigo> {
    let amigoResponse = await fetchWithTimeout(node + "/identity?token=" + encodeURIComponent(token), { method: 'GET', timeout: FETCH_TIMEOUT });
    checkResponse(amigoResponse);
    return await amigoResponse.json();
  }

  public static async getServiceAccess(node: string, token: string): Promise<ServiceAccess> {
    let accessResponse = await fetchWithTimeout(node + "/token/access?token=" + encodeURIComponent(token), { method: 'GET', timeout: FETCH_TIMEOUT });
    checkResponse(accessResponse);
    return await accessResponse.json();
  }
  
  public static async getLabelViews(node: string, token: string): Promise<LabelView[]> {
    let viewsResponse = await fetchWithTimeout(node + "/group/labels/view?token=" + encodeURIComponent(token), { method: 'GET', timeout: FETCH_TIMEOUT });
    checkResponse(viewsResponse);
    return await viewsResponse.json();
  }

  public static async getLabel(node: string, token: string, labelId: string): Promise<LabelEntry> {
    let labelResponse = await fetchWithTimeout(node + "/group/labels/" + labelId + "?token=" + encodeURIComponent(token), { method: 'GET', timeout: FETCH_TIMEOUT });
    checkResponse(labelResponse);
    return await labelResponse.json();
  }

  public static async addLabel(node: string, token: string, name: string): Promise<LabelEntry> {
    let response = await fetchWithTimeout(node + "/group/labels?token=" + encodeURIComponent(token) + "&name=" + encodeURIComponent(name), { method: 'POST', timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  public static async updateLabel(node: string, token: string, labelId: string, name: string): Promise<LabelEntry> {
    let response = await fetchWithTimeout(node + "/group/labels/" + labelId + "/name?token=" + encodeURIComponent(token) + "&name=" + encodeURIComponent(name), { method: 'PUT', timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  public static async removeLabel(node: string, token: string, labelId: string): Promise<void> {
    let response = await fetchWithTimeout(node + "/group/labels/" + labelId + "?token=" + encodeURIComponent(token), { method: 'DELETE', timeout: FETCH_TIMEOUT });
    checkResponse(response);
  }

  public static async getAmigoViews(node: string, token: string): Promsie<AmigoView[]> {
    let viewsResponse = await fetchWithTimeout(node + "/index/amigos/view?token=" + encodeURIComponent(token), { method: 'GET', timeout: FETCH_TIMEOUT });
    checkResponse(viewsResponse);
    return await viewsResponse.json();
  }

  public static async getAmigo(node: string, token: string, amigoId: string): Promise<AmigoEntry> {
    let amigoResponse = await fetchWithTimeout(node + "/index/amigos/" + amigoId + "?token=" + encodeURIComponent(token), { method: 'GET', timeout: FETCH_TIMEOUT });
    checkResponse(amigoResponse);
    return await amigoResponse.json();
  }

  public static async addAmigo(node: string, token: string, message: AmigoMessage): Promise<AmigoEntry> {
    let response = await fetchWithTimeout(node + "/index/amigos?token=" + encodeURIComponent(token), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(message), timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  public static async removeAmigo(node: string, token: string, amigoId: string): Promise<void> {
    let response = await fetchWithTimeout(node + "/index/amigos/" + amigoId + "?token=" + encodeURIComponent(token), { method: 'DELETE', timeout: FETCH_TIMEOUT });
    checkResponse(response);
  }

  public static async getAmigoIdentity(node: string, token: string, amigoId: string): Promise<Amigo> {
    let amigoResponse = await fetchWithTimeout(node + "/index/amigos/" + amigoId + "/identity?token=" + encodeURIComponent(token), { method: 'GET', timeout: FETCH_TIMEOUT });
    checkResponse(amigoResponse);
    return await amigoResponse.json();
  }

  public static async setAmigoIdentity(node: string, token: string, amigo: AmigoMessage): Promise<Amigo> {
    let amigoResponse = await fetchWithTimeout(node + "/index/amigos?token=" + encodeURIComponent(token), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(amigo), timeout: FETCH_TIMEOUT });
    checkResponse(amigoResponse);
    return await amigoResponse.json();
  }

  public static async getPendingAmigoViews(node: string, token: string): Promise<PendingAmigoView[]> {
    let pendingResponse = await fetchWithTimeout(node + "/index/requests?token=" + encodeURIComponent(token), { method: 'GET', timeout: FETCH_TIMEOUT });
    checkResponse(pendingResponse);
    return await pendingResponse.json();
  }

  public static async getPendingAmigo(node: string, token: string, shareId: string): Promise<PendingAmigo> {
    let pendingResponse = await fetchWithTimeout(node + "/index/requests/" + shareId + "?token=" + encodeURIComponent(token), { method: 'GET', timeout: FETCH_TIMEOUT });
    checkResponse(pendingResponse);
    return await pendingResponse.json();
  }

  public static async removePendingAmigo(node: string, token: string, shareId: string): Promise<void> {
    let response = await fetchWithTimeout(node + "/index/requests/" + shareId + "?token=" + encodeURIComponent(token), { method: 'DELETE', timeout: FETCH_TIMEOUT });
    checkResponse(response);
  }

  public static async getAttributeViews(node: string, token: string, filter: string[]): Promise<AttributeView[]> {
    let viewsResponse = await fetchWithTimeout(node + "/profile/attributes/view?token=" + encodeURIComponent(token), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(filter), timeout: FETCH_TIMEOUT });
    checkResponse(viewsResponse);
    return await viewsResponse.json();
  }

  public static async getAttribute(node: string, token: string, attributeId: string): Promise<AttributeEntry> {
    let entryResponse = await fetchWithTimeout(node + "/profile/attributes/" + attributeId + "?token=" + encodeURIComponent(token), { method: 'GET', timeout: FETCH_TIMEOUT });
    checkResponse(entryResponse);
    return await entryResponse.json();
  }

  public static async addAttribute(node: string, token: string, schema: string): Promise<AttributeEntry> {
    let response = await fetchWithTimeout(node + "/profile/attributes/?token=" + encodeURIComponent(token) + "&schema=" + schema, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}), timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  public static async setAttribute(node: string, token: string, attributeId: string, schema: string, data: string): Promise<void> {
    let response = await fetchWithTimeout(node + "/profile/attributes/" + attributeId + "?token=" + encodeURIComponent(token) + "&schema=" + schema, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: data, timeout: FETCH_TIMEOUT });
    checkResponse(response);
  }

  public static async removeAttribute(node: string, token: string, attributeId: string): Promise<void> {
    let response = await fetchWithTimeout(node + "/profile/attributes/" + attributeId + "?token=" + encodeURIComponent(token), { method: 'DELETE', timeout: FETCH_TIMEOUT });
    checkResponse(response);
  } 

  public static async setAttributeLabel(node: string, token: string, attributeId: string, labelId: string): Promise<void> {
    let response = await fetchWithTimeout(node + "/profile/attributes/" + attributeId + "/labels/" + labelId + "?token=" + encodeURIComponent(token), { method: 'POST', timeout: FETCH_TIMEOUT });
    checkResponse(response);
  }
  public static async clearAttributeLabel(node: string, token: string, attributeId: string, labelId: string): Promise<void> {
    let response = await fetchWithTimeout(node + "/profile/attributes/" + attributeId + "/labels/" + labelId + "?token=" + encodeURIComponent(token), { method: 'DELETE', timeout: FETCH_TIMEOUT });
    checkResponse(response);
  }

  public static async getSubjectViews(node: string, token: string, filter: string[]): Promise<SubjectView[]> {
    let viewsResponse = await fetchWithTimeout(node + "/show/subjects/view?token=" + encodeURIComponent(token), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(filter), timeout: FETCH_TIMEOUT });
    checkResponse(viewsResponse);
    return await viewsResponse.json();
  }

  public static async getSubject(node: string, token: string, subjectId: string): Promise<SubjectEntry> {
    let entryResponse = await fetchWithTimeout(node + "/show/subjects/" + subjectId + "?token=" + encodeURIComponent(token), { method: 'GET', timeout: FETCH_TIMEOUT });
    checkResponse(entryResponse);
    return await entryResponse.json();
  }

  public static async getSubjectTags(node: string, token: string, subjectId: string, schema: string): Promise<SubjectTag> {
    let tagResponse = await fetchWithTimeout(node + "/show/subjects/" + subjectId + "/tags?schema=" + schema + "&descending=true&token=" + encodeURIComponent(token), { method: 'GET', timeout: FETCH_TIMEOUT });
    checkResponse(tagResponse);
    return await tagResponse.json();
  }

  public static async getConnectionViews(node: string, token: string): Promise<ShareView[]> {
    let viewsResponse = await fetchWithTimeout(node + "/share/connections/view?token=" + encodeURIComponent(token), { method: 'GET', timeout: FETCH_TIMEOUT });
    checkResponse(viewsResponse);
    return await viewsResponse.json();
  }

  public static async getConnection(node: string, token: string, shareId: string): Promise<ShareEntry> {
    let entryResponse = await fetchWithTimeout(node + "/share/connections/" + shareId + "?token=" + encodeURIComponent(token), { method: 'GET', timeout: FETCH_TIMEOUT });
    checkResponse(entryResponse);
    return await entryResponse.json();
  }

  public static async getAgentMessage(node: string, token: string): Promise<AuthMessage> {
    let authResponse = await fetchWithTimeout(node + "/agent/service?token=" + encodeURIComponent(token), { method: 'PUT', timeout: FETCH_TIMEOUT });
    checkResponse(authResponse);
    return await authResponse.json();
  }

   public static async getConnectionRevisions(node: string, token: string, agent: string, message: AuthMessage): Promise<Revisions> {
    let revisionResponse = await fetchWithTimeout(node + "/token/revisions?token=" + encodeURIComponent(token) + "&agent=" + encodeURIComponent(agent), { method: 'GET', timeout: FETCH_TIMEOUT });
    if(revisionResponse.status == 402) { // 402 means agent auth not set
      let auth = await fetchWithTimeout(node + "/token/agent?token=" + encodeURIComponent(token), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(message), timeout: FETCH_TIMEOUT });
      revisionResponse = await fetchWithTimeout(node + "/token/revisions?token=" + encodeURIComponent(token) + "&agent=" + encodeURIComponent(agent), { method: 'GET', timeout: FETCH_TIMEOUT });
    }
    checkResponse(revisionResponse);
    return await revisionResponse.json();
  }

  public static async getConnectionListing(node: string, token: string, agent: string): Promise<Amigo> {
    let response = await fetchWithTimeout(node + "/listing/identity?token=" + encodeURIComponent(token) + "&agent=" + encodeURIComponent(agent), { method: 'GET', timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  public static async getConnectionAttributeView(node: string, token: string, agent: string, filter: string[]): Promise<AttributeView> {
    let response = await fetchWithTimeout(node + "/contact/attributes/view?token=" + encodeURIComponent(token) + "&agent=" + encodeURIComponent(agent), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(filter), timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }
  public static async getConnectionAttribute(node: string, token: string, agent: string, attributeId: string): Promise<Attribute> {
    let response = await fetchWithTimeout(node + "/contact/attributes/" + attributeId + "?token=" + encodeURIComponent(token) + "&agent=" + encodeURIComponent(agent), { method: 'GET', timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }


  public static async getConnectionSubjectView(node: string, token: string, agent: string, filter: string[]): Promise<SubjectView> {
    let response = await fetchWithTimeout(node + "/view/subjects/view?token=" + encodeURIComponent(token) + "&agent=" + encodeURIComponent(agent), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(filter), timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }
  public static async getConnectionSubject(node: string, token: string, agent: string, subjectId: string): Promise<Subject> {
    let response = await fetchWithTimeout(node + "/view/subjects/" + subjectId + "?token=" + encodeURIComponent(token) + "&agent=" + encodeURIComponent(agent), { method: 'GET', timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }
  public static async getConnectionSubjectTags(node: string, token: string, agent: string, subjectId: string, filter: string): Promise<Subject> {
    let response = await fetchWithTimeout(node + "/view/subjects/" + subjectId + "/tags?descending=true&token=" + encodeURIComponent(token) + "&agent=" + encodeURIComponent(agent) + "&schema=" + encodeURIComponent(filter), { method: 'GET', timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }
  public static async addConnectionSubjectTag(node: string, token: string, agent: string, subjectId: string, schema: string, data: string): Promise<SubjectTag> {
    let response = await fetchWithTimeout(node + "/view/subjects/" + subjectId + "/tags?schema=" + schema + "&descending=true&token=" + token + "&agent=" + agent, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: data, timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  public static async removeConnectionSubjectTag(node: string, token: string, agent: string, subjectId: string, tagId: string, schema: string): Promise<void> {
    let response = await fetchWithTimeout(node + "/view/subjects/" + subjectId + "/tags/" + tagId + "?schema=" + schema + "&token=" + encodeURIComponent(token) + "&agent=" + agent, { method: 'DELETE', timeout: FETCH_TIMEOUT });
    checkResponse(response);
  }

  public static async getIdentityRevision(node: string, token: string): Promise<number> {
    let response = await fetchWithTimeout(node + "/identity/revision?token=" + encodeURIComponent(token), { method: 'GET', timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  public static async getDirtyIdentity(node: string, token: string): Promise<boolean> {
    let dirtyResponse = await fetchWithTimeout(node + "/identity/dirty?token=" + encodeURIComponent(token), { method: 'GET', timeout: FETCH_TIMEOUT });
    checkResponse(dirtyResponse);
    return await dirtyResponse.json();
  }

  public static async clearDirtyIdentity(node: string, token: string, revision: number): Promise<void> {
    let dirtyResponse = await fetchWithTimeout(node + "/identity/dirty?flag=false&revision=" + revision + "&token=" + encodeURIComponent(token), { method: 'PUT', timeout: FETCH_TIMEOUT });
    checkResponse(dirtyResponse);
  }

  public static async getAmigoMessage(node: string, token: string): Promise<AmigoMessage> {
    let identityResponse = await fetchWithTimeout(node + "/identity/message?token=" + encodeURIComponent(token), { method: 'GET', timeout: FETCH_TIMEOUT });
    checkResponse(identityResponse);
    return await identityResponse.json();
  }
 
  public static async getRegistryRevision(registry: string, amigoId: string): Promise<number> {
    let revisionResponse = await fetchWithTimeout(registry + "/amigo/messages/revision?amigoId=" + amigoId, { method: 'GET', timeout: FETCH_TIMEOUT });
    checkResponse(revisionResponse);
    return await revisionResponse.json();
  }
 
  public static async getRegistryMessage(registry: string, amigoId: string): Promise<AmigoMessage> {
    let messageResponse = await fetchWithTimeout(registry + "/amigo/messages?amigoId=" + amigoId, { method: 'GET', timeout: FETCH_TIMEOUT });
    checkResponse(messageResponse);
    return await messageResponse.json();
  }
 
  public static async setRegistryMessage(registry: string, message: AmigoMessage): Promise<void> {
    let messageResponse = await fetchWithTimeout(registry + "/amigo/messages", { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(message), timeout: FETCH_TIMEOUT });
    checkResponse(messageResponse);
  }



  public static async getInsightViews(node: string, token: string): Promise<Insight[]> {
    let response = await fetchWithTimeout(node + "/conversation/insight/view?token=" + encodeURIComponent(token), { method: 'GET', timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  public static async getInsight(node: string, token: string, dialogueId: string, agent: string, message: AuthMessage): Promise<Dialogue> {
    let response = await fetchWithTimeout(node + "/commentary/dialogue/" + dialogueId + "?token=" + encodeURIComponent(token) + "&agent=" + encodeURIComponent(agent), { method: 'GET', timeout: FETCH_TIMEOUT });
    if(response.status == 402) { // 402 means agent auth not set
      let auth = await fetchWithTimeout(node + "/token/agent?token=" + encodeURIComponent(token), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(message), timeout: FETCH_TIMEOUT });
      response = await fetchWithTimeout(node + "/commentary/dialogue/" + dialogueId + "?token=" + encodeURIComponent(token) + "&agent=" + encodeURIComponent(agent), { method: 'GET', timeout: FETCH_TIMEOUT });
    }
    checkResponse(response);
    return await response.json();
  }

  public static async getInsightTopicViews(node: string, token: string, dialogueId: string, agent: string, message: AuthMessage): Promise<TopicView[]> {
    let response = await fetchWithTimeout(node + "/commentary/dialogue/" + dialogueId + "/topic/view?token=" + encodeURIComponent(token) + "&agent=" + encodeURIComponent(agent), { method: 'GET', timeout: FETCH_TIMEOUT });
    if(response.status == 402) { // 402 means agent auth not set
      let auth = await fetchWithTimeout(node + "/token/agent?token=" + encodeURIComponent(token), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(message), timeout: FETCH_TIMEOUT });
      response = await fetchWithTimeout(node + "/commentary/dialogue/" + dialogueId + "/topic/view?token=" + encodeURIComponent(token) + "&agent=" + encodeURIComponent(agent), { method: 'GET', timeout: FETCH_TIMEOUT });
    }
    checkResponse(response);
    return await response.json();
  }

  public static async getInsightTopic(node: string, token: string, dialogueId: string, topicId: string, agent: string, message: AuthMessage): Promise<TopicView[]> {
    let response = await fetchWithTimeout(node + "/commentary/dialogue/" + dialogueId + "/topic/" + topicId + "?token=" + encodeURIComponent(token) + "&agent=" + encodeURIComponent(agent), { method: 'GET', timeout: FETCH_TIMEOUT });
    if(response.status == 402) { // 402 means agent auth not set
      let auth = await fetchWithTimeout(node + "/token/agent?token=" + encodeURIComponent(token), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(message), timeout: FETCH_TIMEOUT });
      response = await fetchWithTimeout(node + "/commentary/dialogue/" + dialogueId + "/topic/" + topicId + "?token=" + encodeURIComponent(token) + "&agent=" + encodeURIComponent(agent), { method: 'GET', timeout: FETCH_TIMEOUT });
    }
    checkResponse(response);
    return await response.json();
  }


  public static async getDialogueViews(node: string, token: string): Promise<Dialogue[]> {
    let response = await fetchWithTimeout(node + "/conversation/dialogue/view?token=" + encodeURIComponent(token), { method: 'GET', timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  public static async getDialogue(node: string, token: string, dialogueId: string): Promise<Dialogue> {
    let response = await fetchWithTimeout(node + "/conversation/dialogue/" + dialogueId + "?token=" + encodeURIComponent(token), { method: 'GET', timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  public static async getDialogueTopicViews(node: string, token: string, dialogueId: string): Promise<TopicView> {
    let response = await fetchWithTimeout(node + "/conversation/dialogue/" + dialogueId + "/topic/view?token=" + encodeURIComponent(token), { method: 'GET', timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  public static async getDialogueTopic(node: string, token: string, dialogueId: string, topicId: string): Promise<Topic> {
    let response = await fetchWithTimeout(node + "/conversation/dialogue/" + dialogueId + "/topic/" + topicId + "?token=" + encodeURIComponent(token), { method: 'GET', timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  
  public static async setAmigoLabel(node: string, token: string, amigoId: string, labelId: string): Promise<void> {
    let response = await fetchWithTimeout(node + "/index/amigos/" + amigoId + "/labels/" + labelId + "?token=" + encodeURIComponent(token), { method: 'POST', timeout: FETCH_TIMEOUT });
    checkResponse(response);
  }
  public static async clearAmigoLabel(node: string, token: string, amigoId: string, labelId: string): Promise<void> {
    let response = await fetchWithTimeout(node + "/index/amigos/" + amigoId + "/labels/" + labelId + "?token=" + encodeURIComponent(token), { method: 'DELETE', timeout: FETCH_TIMEOUT });
    checkResponse(response);
  }


  public static async removeConnection(node: string, token: string, shareId: string): Promsie<void> {
    let response = await fetchWithTimeout(node + "/share/connections/" + shareId + "?token=" + encodeURIComponent(token), { method: 'DELETE', timeout: FETCH_TIMEOUT });
    checkResponse(response);
  }

  public static async addConnection(node: string, token: string, amigoId: string): Promsie<ShareEntry> {
    let response = await fetchWithTimeout(node + "/share/connections?token=" + encodeURIComponent(token) + "&amigoId=" + amigoId, { method: 'POST', timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  public static async getConnectionMessage(node: string, token: string, shareId: string): Promsie<ShareMessage> {
    let response = await fetchWithTimeout(node + "/share/" + shareId + "/message?token=" + encodeURIComponent(token), { method: 'GET', timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  public static async setConnectionMessage(node: string, amigoId: string, message: ShareMessage): Promise<ShareStatus> {
    let response = await fetchWithTimeout(node + "/share/messages?amigoId=" + amigoId, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(message), timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  public static async setConnectionStatus(node: string, token: string, shareId: string, status: string, access: string): Promise<ShareEntry> {
    let response;
    if(status == 'connected') {
      response = await fetchWithTimeout(node + "/share/connections/" + shareId + "/status?token=" + encodeURIComponent(token) + "&status=" + encodeURIComponent(status) + "&shareToken=" + encodeURIComponent(access), { method: 'PUT', timeout: FETCH_TIMEOUT});
    }
    else {
      response = await fetchWithTimeout(node + "/share/connections/" + shareId + "/status?token=" + encodeURIComponent(token) + "&status=" + encodeURIComponent(status), { method: 'PUT', timeout: FETCH_TIMEOUT });
    }
    checkResponse(response);
    return await response.json();
  }

  public static async setAmigoNotes(node: string, token: string, amigoId: string, notes: string): Promise<AmigoEntry> {
    let response = await fetchWithTimeout(node + "/index/amigos/" + amigoId + "/notes?token=" + encodeURIComponent(token), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: notes, timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  public static async clearAmigoNotes(node: string, token: string, amigoId: string): Promise<AmigoEntry> {
    let response = await fetchWithTimeout(node + "/index/amigos/" + amigoId + "/notes?token=" + encodeURIComponent(token), { method: 'DELETE', timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  public static async setProfileName(node: string, token: string, value: string): Promise<AmigoMessage> {
    let response = await fetchWithTimeout(node + "/identity/name?token=" + encodeURIComponent(token), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: value, timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  public static async setProfileImage(node: string, token: string, value: string): Promise<AmigoMessage> {
    let response = await fetchWithTimeout(node + "/identity/image?token=" + encodeURIComponent(token), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: value, timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  public static async setProfileLocation(node: string, token: string, value: string): Promise<AmigoMessage> {
    let response = await fetchWithTimeout(node + "/identity/location?token=" + encodeURIComponent(token), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: value, timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  public static async setProfileDescription(node: string, token: string, value: string): Promise<AmigoMessage> {
    let response = await fetchWithTimeout(node + "/identity/description?token=" + encodeURIComponent(token), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: value, timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  public static async addSubject(node: string, token: string, schema: string): Promise<SubjectEntry> {
    let response = await fetchWithTimeout(node + "/show/subjects?token=" + token + "&schema=" + encodeURIComponent(schema), { method: 'POST', timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  public static async removeSubject(node: string, token: string, subjectId: string): Promise<void> {
    let response = await fetchWithTimeout(node + "/show/subjects/" + subjectId + "?token=" + token, { method: 'DELETE', timeout: FETCH_TIMEOUT });
    checkResponse(response);
  }

  public static async setSubjectLabel(node: stirng, token: string, subjectId: string, labelId: string): Promise<SubjectEntry> {
    let response = await fetchWithTimeout(node + "/show/subjects/" + subjectId + "/labels/" + labelId + "?token=" + encodeURIComponent(token), { method: 'POST', timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  public static async clearSubjectLabel(node: string, token: string, subjectId: string, labelId: string): Promise<SubjectEntry> {
    let response = await fetchWithTimeout(node + "/show/subjects/" + subjectId + "/labels/" + labelId + "?token=" + encodeURIComponent(token), { method: 'DELETE', timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  public static async setSubjectData(node: string, token: string, subjectId: string, schema: string, data: string): Promise<SubjectEntry> {
    let response = await fetchWithTimeout(node + "/show/subjects/" + subjectId + "/data?token=" + encodeURIComponent(token) + "&schema=" + schema, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: data, timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  public static async setSubjectShare(node: string, token: string, subjectId: string, share: boolean): Promise<SubjectEntry> {
    let response = await fetchWithTimeout(node + "/show/subjects/" + subjectId + "/access?token=" + encodeURIComponent(token) + "&done=" + share, { method: 'PUT', timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  public static async addSubjectTag(node: string, token: string, subjectId: string, schema: string, data: string): Promise<SubjectTag> {
    let response = await fetchWithTimeout(node + "/show/subjects/" + subjectId + "/tags?schema=" + schema + "&descending=true&token=" + encodeURIComponent(token), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: data, timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  public static async removeSubjectTag(node: string, token: string, subjectId: string, tagId: string, schema: string): Promise<void> {
    let response = await fetchWithTimeout(node + "/show/subjects/" + subjectId + "/tags/" + tagId + "?schema=" + schema + "&token=" + encodeURIComponent(token), { method: 'DELETE', timeout: FETCH_TIMEOUT });
    checkResponse(response);
  }
  
  public static async addConversation(node: string, token: string, amigoId: string): Promise<Dialogue> {
    let response = await fetchWithTimeout(node + "/conversation/dialogue?token=" + encodeURIComponent(token) + "&amigoId=" + amigoId, { method: 'POST', timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  } 

  public static async addInsight(node: string, token: string, agent: string, dialogueId: string, revision: number): Promise<Insight> {
    let response = await fetchWithTimeout(node + "/commentary/insight?token=" + token + "&agent=" + agent + "&dialogueId=" + dialogueId + "&revision=" + revision, { method: 'POST', FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }  

  public static async updateConversation(node: string, token: string, dialogueId: string, linked: boolean, synced: boolean, active: boolean, revision: number): Promise<Dialog> {
    let params = "";
    if(linked != null) {
      params += "&linked=" + linked;
    }
    if(synced != null) {
      params += "&synced=" + synced;
    }
    if(active != null) {
      params += "&active=" + active;
    }
    if(revision != null) {
      params += "&revision=" + revision;
    }
    let response = await fetchWithTimeout(node + "/conversation/dialogue/" + dialogueId + "?token=" + token + params, { method: 'PUT', timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return response.json();
  }

  public static async updateContactConversation(node: string, token: string, agent: string, dialogueId: string, active: boolean, synced: boolean, revision: number): Promise<Dialogue> {
    let params = "";
    if(synced != null) {
      params += "&synced=" + synced;
    }
    if(active != null) {
      params += "&active=" + active;
    }
    if(revision != null) {
      params += "&revision=" + revision;
    }

    let response = await fetchWithTimeout(node + "/commentary/dialogue/" + dialogueId + "?token=" + token + "&agent=" + agent + params, { method: 'PUT', FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();   
  }

  public static async updateInsight(node: string, token: string, amigoId: string, dialogueId: string, revision: number): Promise<Insight> {
    let response = await fetchWithTimeout(node + "/conversation/insight/" + dialogueId + "?token=" + token + "&amigoId=" + amigoId + "&revision=" + revision, { method: 'PUT', timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  public static async updateContactInsight(node: string, token: string, agent: string, dialogueId: string, revision: number): Promise<Insight> {
    let response = await fetchWithTimeout(node + "/commentary/insight/" + dialogueId + "?token=" + token + "&agent=" + agent + "&revision=" + revision, { method: 'PUT', timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }
   
  public static async addBlurb(node: string, token: string, dialogueId: string, schema: string, data: string): Promise<Blurb> {
    let response = await fetchWithTimeout(node + "/conversation/dialogue/" + dialogueId + "/blurb?token=" + token + "&schema=" + schema, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: data, timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  public static async addContactBlurb(node: string, token: string, agent: string, dialogueId: string, schema: string, data: string): Promise<Blurb> {
    let response = await fetchWithTimeout(node + "/commentary/dialogue/" + dialogueId + "/blurb?token=" + token + "&agent=" + agent + "&schema=" + schema, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: data, timeout: FETCH_TIMEOUT });
    checkResponse(response);
    return await response.json();
  }

  public static async removeBlurb(node: string, token: string, dialogueId: string, blurbId: string): Promise<void> {
    let response = await fetchWithTimeout(node + "/conversation/dialogue/" + dialogueId + "/blurb/" + blurbId + "?token=" + token, { method: 'DELETE', timeout: FETCH_TIMEOUT });
    checkResponse(response);
  }

  public static async removeContactBlurb(node: string, token: string, agent: string, dialogueId: string, blurbId: string): Promise<void> {
    let response = await fetchWithTimeout(node + "/commentary/dialogue/" + dialogueId + "/blurb/" + blurbId + "?token=" + token + "&agent=" + agent, { method: 'DELETE', timeout: FETCH_TIMEOUT });
    checkResponse(response);
  } 

  public static async removeInsight(node: string, token: string, amigoId: string, dialogueId: string): Promise<void> {
    let response = await fetchWithTimeout(node + "/conversation/insight/" + dialogueId + "?token=" + token + "&amigoId=" + amigoId, { method: 'DELETE', timeout: FETCH_TIMEOUT });
    checkResponse(response);
  }

  public static async removeContactInsight(node: string, token: string, agent: string, dialogueId: string): Promise<void> {
    let response = await fetchWithTimeout(node + "/commentary/insight/" + dialogueId + "?token=" + token + "&agent=" + agent, { method: 'DELETE', timeout: FETCH_TIMEOUT });
    checkResponse(response);
  }

  public static async removeConversation(node: string, token: string, dialogueId: string): Promise<void> {
    let response = await fetchWithTimeout(node + "/conversation/dialogue/" + dialogueId + "?token=" + token, { method: 'DELETE', timeout: FETCH_TIMEOUT });
    checkResponse(response);
  }

  public static async removeContactConversation(node: string, token: string, agent: string, dialogueId: string): Promise<void> {
    let response = await fetchWithTimeout(node + "/commentary/dialogue/" + dialogueId + "?token=" + token + "&agent=" + agent, { method: 'DELETE', timeout: FETCH_TIMEOUT });
    checkResponse(response);
  }

}
