import { Revisions } from './DiatumTypes';

export class DiatumApi {

  public static async getMyRevisions(node: string, token: string): Promise<Revisions> {
    let revisionsResponse = await fetch(node + "/token/revisions?token=" + encodeURIComponent(token));
    return await revisionsResponse.json();
  }
}
