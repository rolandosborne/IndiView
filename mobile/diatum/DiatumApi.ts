import { Revisions, Amigo, LabelEntry, LabelView, AmigoEntry, AmigoView, PendingAmigo, PendingAmigoView, AttributeEntry, AttributeEntryView, SubjectView, SubjectEntry, SubjectTag, ShareEntry, ShareView } from './DiatumTypes';

export class DiatumApi {

  public static async getRevisions(node: string, token: string): Promise<Revisions> {
    let revisionsResponse = await fetch(node + "/token/revisions?token=" + encodeURIComponent(token));
    return await revisionsResponse.json();
  }

  public static async getIdentity(node: string, token: string): Promise<Amigo> {
    let amigoResponse = await fetch(node + "/identity?token=" + encodeURIComponent(token));
    return await amigoResponse.json();
  }

  public static async getServiceAccess(node: string, token: string): Promise<ServiceAccess> {
    let accessResponse = await fetch(node + "/token/access?token=" + encodeURIComponent(token));
    return await accessResponse.json();
  }
  
  public static async getLabelViews(node: string, token: string): Promise<LabelView[]> {
    let viewsResponse = await fetch(node + "/group/labels/view?token=" + encodeURIComponent(token));
    return await viewsResponse.json();
  }

  public static async getLabel(node: string, token: string, labelId: string): Promise<LabelEntry> {
    let labelResponse = await fetch(node + "/group/labels/" + labelId + "?token=" + encodeURIComponent(token));
    return await labelResponse.json();
  }

  public static async  addLabel(node: string, token: string, name: string): Promise<LabelEntry> {
    let labelResponse = await fetch(node + "/group/labels/?token=" + token + "&name=" + encodeURIComponent(name), { method: 'POST' });
    return await labelResponse.json();
  }

  public static async updateLabel(node: string, token: string, labelId: string, name: string): Promise<LabelEntry> {
    let labelResponse = await fetch(node + "/group/labels/" + labelId + "/name?token=" + encodeURIComponent(token) + "&name=" + encodeURIComponent(name), { method: 'PUT' });
    return await labelResponse.json();
  }

  public static async removeLabel(node: string, token: string, id: string): Promise<void> {
    await fetch(node + "/group/labels/" + id + "?token=" + encodeURIComponent(token), { method: 'DELETE' });
  }

  public static async getAmigoViews(node: string, token: string): Promsie<AmigoView[]> {
    let viewsResponse = await fetch(node + "/index/amigos/view?token=" + encodeURIComponent(token));
    return await viewsResponse.json();
  }

  public static async getAmigo(node: string, token: string, amigoId: string): Promise<AmigoEntry> {
    let amigoResponse = await fetch(node + "/index/amigos/" + amigoId + "?token=" + encodeURIComponent(token));
    return await amigoResponse.json();
  }

  public static async getPendingAmigoViews(node: string, token: string): Promise<PendingAmigoView[]> {
    let pendingResponse = await fetch(node + "/index/requests?token=" + encodeURIComponent(token));
    return await pendingResponse.json();
  }

  public static async getPendingAmigo(node: string, token: string, shareId: string): Promise<PendingAmigo> {
    let pendingResponse = await fetch(node + "/index/requests/" + shareId + "?token=" + encodeURIComponent(token));
    return await pendingResponse.json();
  }

  public static async getAttributeViews(node: string, token: string, filter: string[]): Promise<AttributeView[]> {
    let viewsResponse = await fetch(node + "/profile/attributes/view?token=" + encodeURIComponent(token), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(filter) });
    return await viewsResponse.json();
  }

  public static async getAttribute(node: string, token: string, attributeId: string): Promise<AttributeEntry> {
    let entryResponse = await fetch(node + "/profile/attributes/" + attributeId + "?token=" + encodeURIComponent(token));
    return await entryResponse.json();
  }

  public static async getSubjectViews(node: string, token: string, filter: string[]): Promise<SubjectView[]> {
    let viewsResponse = await fetch(node + "/show/subjects/view?token=" + encodeURIComponent(token), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(filter) });
    return await viewsResponse.json();
  }

  public static async getSubject(node: string, token: string, subjectId: string): Promise<SubjectEntry> {
    let entryResponse = await fetch(node + "/show/subjects/" + subjectId + "?token=" + encodeURIComponent(token));
    return await entryResponse.json();
  }

  public static async getSubjectTags(node: string, token: string, subjectId: string, schema: string): Promise<SubjectTag> {
    let tagResponse = await fetch(node + "/show/subjects/" + subjectId + "/tags?schema=" + schema + "&descending=false&token=" + encodeURIComponent(token));
    return await tagResponse.json();
  }

  public static async getConnectionViews(node: string, token: string): Promise<ShareView[]> {
    let viewsResponse = await fetch(node + "/share/connections/view?token=" + encodeURIComponent(token));
    return await viewsResponse.json();
  }

  public static async getConnection(node: string, token: string, shareId: string): Promise<ShareEntry> {
    let entryResponse = await fetch(node + "/share/connections/" + shareId + "?token=" + encodeURIComponent(token));
    return await entryResponse.json();
  }

  private static async getAgentMessage(node: string, token: string): Promise<AuthMessage> {
    let authResponse = await fetch(node + "/agent/service?token=" + encodeURIComponent(token), { method: 'PUT' });
    return await authResponse.json();
  }
}
