import { Revisions, Amigo, LabelEntry, LabelView, AmigoEntry, AmigoView, PendingAmigo, PendingAmigoView, AttributeEntry, AttributeEntryView, SubjectView, SubjectEntry, SubjectTag, ShareEntry, ShareView, InsightView, DialogueView } from './DiatumTypes';

function checkResponse(response) {
  if(response.status >= 400 && response.status < 600) {
    throw new Error(response.url + " failed");
  }
}

export class DiatumApi {

  public static async getRevisions(node: string, token: string): Promise<Revisions> {
    let revisionsResponse = await fetch(node + "/token/revisions?token=" + encodeURIComponent(token));
    checkResponse(revisionsResponse);
    return await revisionsResponse.json();
  }

  public static async getIdentity(node: string, token: string): Promise<Amigo> {
    let amigoResponse = await fetch(node + "/identity?token=" + encodeURIComponent(token));
    checkResponse(amigoResponse);
    return await amigoResponse.json();
  }

  public static async getServiceAccess(node: string, token: string): Promise<ServiceAccess> {
    let accessResponse = await fetch(node + "/token/access?token=" + encodeURIComponent(token));
    checkResponse(accessResponse);
    return await accessResponse.json();
  }
  
  public static async getLabelViews(node: string, token: string): Promise<LabelView[]> {
    let viewsResponse = await fetch(node + "/group/labels/view?token=" + encodeURIComponent(token));
    checkResponse(viewsResponse);
    return await viewsResponse.json();
  }

  public static async getLabel(node: string, token: string, labelId: string): Promise<LabelEntry> {
    let labelResponse = await fetch(node + "/group/labels/" + labelId + "?token=" + encodeURIComponent(token));
    checkResponse(labelResponse);
    return await labelResponse.json();
  }

  public static async  addLabel(node: string, token: string, name: string): Promise<LabelEntry> {
    let labelResponse = await fetch(node + "/group/labels/?token=" + token + "&name=" + encodeURIComponent(name), { method: 'POST' });
    checkResponse(labelResponse);
    return await labelResponse.json();
  }

  public static async updateLabel(node: string, token: string, labelId: string, name: string): Promise<LabelEntry> {
    let labelResponse = await fetch(node + "/group/labels/" + labelId + "/name?token=" + encodeURIComponent(token) + "&name=" + encodeURIComponent(name), { method: 'PUT' });
    checkResponse(labelResponse);
    return await labelResponse.json();
  }

  public static async removeLabel(node: string, token: string, id: string): Promise<void> {
    let removeResponse = await fetch(node + "/group/labels/" + id + "?token=" + encodeURIComponent(token), { method: 'DELETE' });
    checkResponse(removeResponse);
  }

  public static async getAmigoViews(node: string, token: string): Promsie<AmigoView[]> {
    let viewsResponse = await fetch(node + "/index/amigos/view?token=" + encodeURIComponent(token));
    checkResponse(viewsResponse);
    return await viewsResponse.json();
  }

  public static async getAmigo(node: string, token: string, amigoId: string): Promise<AmigoEntry> {
    let amigoResponse = await fetch(node + "/index/amigos/" + amigoId + "?token=" + encodeURIComponent(token));
    checkResponse(amigoResponse);
    return await amigoResponse.json();
  }

  public static async getAmigoIdentity(node: string, token: string, amigoId: string): Promise<Amigo> {
    let amigoResponse = await fetch(node + "/index/amigos/" + amigoId + "/identity?token=" + encodeURIComponent(token));
    checkResponse(amigoResponse);
    return await amigoResponse.json();
  }

  public static async setAmigoIdentity(node: string, token: string, amigo: AmigoMessage): Promise<Amigo> {
    let amigoResponse = await fetch(node + "/index/amigos?token=" + encodeURIComponent(token), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(amigo) });
    checkResponse(amigoResponse);
    return await amigoResponse.json();
  }

  public static async getPendingAmigoViews(node: string, token: string): Promise<PendingAmigoView[]> {
    let pendingResponse = await fetch(node + "/index/requests?token=" + encodeURIComponent(token));
    checkResponse(pendingResponse);
    return await pendingResponse.json();
  }

  public static async getPendingAmigo(node: string, token: string, shareId: string): Promise<PendingAmigo> {
    let pendingResponse = await fetch(node + "/index/requests/" + shareId + "?token=" + encodeURIComponent(token));
    checkResponse(pendingResponse);
    return await pendingResponse.json();
  }

  public static async getAttributeViews(node: string, token: string, filter: string[]): Promise<AttributeView[]> {
    let viewsResponse = await fetch(node + "/profile/attributes/view?token=" + encodeURIComponent(token), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(filter) });
    checkResponse(viewsResponse);
    return await viewsResponse.json();
  }

  public static async getAttribute(node: string, token: string, attributeId: string): Promise<AttributeEntry> {
    let entryResponse = await fetch(node + "/profile/attributes/" + attributeId + "?token=" + encodeURIComponent(token));
    checkResponse(entryResponse);
    return await entryResponse.json();
  }

  public static async getSubjectViews(node: string, token: string, filter: string[]): Promise<SubjectView[]> {
    let viewsResponse = await fetch(node + "/show/subjects/view?token=" + encodeURIComponent(token), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(filter) });
    checkResponse(viewsResponse);
    return await viewsResponse.json();
  }

  public static async getSubject(node: string, token: string, subjectId: string): Promise<SubjectEntry> {
    let entryResponse = await fetch(node + "/show/subjects/" + subjectId + "?token=" + encodeURIComponent(token));
    checkResponse(entryResponse);
    return await entryResponse.json();
  }

  public static async getSubjectTags(node: string, token: string, subjectId: string, schema: string): Promise<SubjectTag> {
    let tagResponse = await fetch(node + "/show/subjects/" + subjectId + "/tags?schema=" + schema + "&descending=false&token=" + encodeURIComponent(token));
    checkResponse(tagResponse);
    return await tagResponse.json();
  }

  public static async getConnectionViews(node: string, token: string): Promise<ShareView[]> {
    let viewsResponse = await fetch(node + "/share/connections/view?token=" + encodeURIComponent(token));
    checkResponse(viewsResponse);
    return await viewsResponse.json();
  }

  public static async getConnection(node: string, token: string, shareId: string): Promise<ShareEntry> {
    let entryResponse = await fetch(node + "/share/connections/" + shareId + "?token=" + encodeURIComponent(token));
    checkResponse(entryResponse);
    return await entryResponse.json();
  }

  public static async getAgentMessage(node: string, token: string): Promise<AuthMessage> {
    let authResponse = await fetch(node + "/agent/service?token=" + encodeURIComponent(token), { method: 'PUT' });
    checkResponse(authResponse);
    return await authResponse.json();
  }

   public static async getConnectionRevisions(node: string, token: string, agent: string, message: AuthMessage): Promise<Revisions> {
    let revisionResponse = await fetch(node + "/token/revisions?token=" + encodeURIComponent(token) + "&agent=" + encodeURIComponent(agent));
    if(revisionResponse.status == 402) { // 402 means agent auth not set
      let auth = await fetch(node + "/token/agent?token=" + encodeURIComponent(token), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(message) });
      revisionResponse = await fetch(node + "/token/revisions?token=" + encodeURIComponent(token) + "&agent=" + encodeURIComponent(agent));
    }
    checkResponse(revisionResponse);
    return await revisionResponse.json();
  }

  public static async getConnectionListing(node: string, token: string, agent: string): Promise<Amigo> {
    let response = await fetch(node + "/listing/identity?token=" + encodeURIComponent(token) + "&agent=" + encodeURIComponent(agent));
    checkResponse(response);
    return await response.json();
  }

  public static async getConnectionAttributeView(node: string, token: string, agent: string, filter: string[]): Promise<AttributeView> {
    let response = await fetch(node + "/contact/attributes/view?token=" + encodeURIComponent(token) + "&agent=" + encodeURIComponent(agent), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(filter) });
    checkResponse(response);
    return await response.json();
  }
  public static async getConnectionAttribute(node: string, token: string, agent: string, attributeId: string): Promise<Attribute> {
    let response = await fetch(node + "/contact/attributes/" + attributeId + "?token=" + encodeURIComponent(token) + "&agent=" + encodeURIComponent(agent));
    checkResponse(response);
    return await response.json();
  }


  public static async getConnectionSubjectView(node: string, token: string, agent: string, filter: string[]): Promise<SubjectView> {
    let response = await fetch(node + "/view/subjects/view?token=" + encodeURIComponent(token) + "&agent=" + encodeURIComponent(agent), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(filter) });
    checkResponse(response);
    return await response.json();
  }
  public static async getConnectionSubject(node: string, token: string, agent: string, subjectId: string): Promise<Subject> {
    let response = await fetch(node + "/view/subjects/" + subjectId + "?token=" + encodeURIComponent(token) + "&agent=" + encodeURIComponent(agent));
    checkResponse(response);
    return await response.json();
  }
  public static async getConnectionSubjectTags(node: string, token: string, agent: string, subjectId: string, filter: string): Promise<Subject> {
    let response = await fetch(node + "/view/subjects/" + subjectId + "?token=" + encodeURIComponent(token) + "&agent=" + encodeURIComponent(agent) + "&schema=" + encodeURIComponent(filter));
    checkResponse(response);
    return await response.json();
  }




  public static async getDirtyIdentity(node: string, token: string): Promise<boolean> {
    let dirtyResponse = await fetch(node + "/identity/dirty?token=" + encodeURIComponent(token));
    checkResponse(dirtyResponse);
    return await dirtyResponse.json();
  }

  public static async clearDirtyIdentity(node: string, token: string, revision: number): Promise<void> {
    let dirtyResponse = await fetch(node + "/identity/dirty?flag=false&revision=" + revision + "&token=" + encodeURIComponent(token), { method: 'PUT' });
    checkResponse(dirtyResponse);
  }

  public static async getAmigoMessage(node: string, token: string): Promise<AmigoMessage> {
    let identityResponse = await fetch(node + "/identity/message?token=" + encodeURIComponent(token));
    checkResponse(identityResponse);
    return await identityResponse.json();
  }
 
  public static async getRegistryRevision(registry: string, amigoId: string): Promise<number> {
    let revisionResponse = await fetch(registry + "/amigo/messages/revision?amigoId=" + amigoId);
    checkResponse(revisionResponse);
    return await revisionResponse.json();
  }
 
  public static async getRegistryMessage(registry: string, amigoId: string): Promise<AmigoMessage> {
    let messageResponse = await fetch(registry + "/amigo/messages?amigoId=" + amigoId);
    checkResponse(messageResponse);
    return await messageResponse.json();
  }
 
  public static async setRegistryMessage(registry: string, message: AmigoMessage): Promise<void> {
    let messageResponse = await fetch(registry + "/amigo/messages", { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(message) });
    checkResponse(messageResponse);
  }



  public static async getInsightViews(node: string, token: string): Promise<Insight[]> {
    let response = await fetch(node + "/conversation/insight/view?token=" + encodeURIComponent(token));
    checkResponse(response);
    return await response.json();
  }

  public static async getDialogueViews(node: string, token: string): Promise<Dialogue[]> {
    let response = await fetch(node + "/conversation/dialogue/view?token=" + encodeURIComponent(token));
    checkResponse(response);
    return await response.json();
  }
}
