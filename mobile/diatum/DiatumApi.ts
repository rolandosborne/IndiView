import { Revisions, LabelEntry, LabelView } from './DiatumTypes';

export class DiatumApi {

  public static async getMyRevisions(node: string, token: string): Promise<Revisions> {
    let revisionsResponse = await fetch(node + "/token/revisions?token=" + encodeURIComponent(token));
    return await revisionsResponse.json();
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

  public static async removeLabel(url: string, token: string, id: string): Promise<void> {
    await fetch(node + "/group/labels/" + id + "?token=" + encodeURIComponent(token), { method: 'DELETE' });
  }
}
