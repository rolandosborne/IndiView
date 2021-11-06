import SQLite from "react-native-sqlite-storage";
import { Alert, AppState, AppStateStatus } from "react-native";
import base64 from 'react-native-base64'
import { Conversation, LabelEntry, LabelCount, LabelView, AmigoView, ShareView, PendingAmigoView, AttributeView, SubjectView, Amigo, Attribute, Subject, SubjectTag, InsightView, Insight, DialogueView, Dialogue, TopicView, Topic, Blurb, ContactRequest, SubjectItem, Tag } from './DiatumTypes';

// helper funtions
function decodeObject(s: string): any {
  if(s == null) {
    return null;
  }
  return JSON.parse(s);
}
function encodeObject(o: any): string {
  if(o == null) {
    return null;
  }
  return JSON.stringify(o);
}
function hasResult(res): boolean {
  if(res === undefined || res[0] === undefined || res[0].rows === undefined || res[0].rows.length == 0) {
    return false;
  }
  return true;
}

export class AmigoConnection {
  amigoId: string;
  node: string;
  registry: string;
  identityRevision: number;
  attributeRevision: number;
  subjectRevision: number;
  errorFlag: boolean;
  token: string;
}

export class AmigoReference {
  amigoId: string;
  node: string;
  registry: string;
  identityRevision: number;
  errorFlag: boolean;
}

export class AmigoPath {
  node: string;
  registry: string;
  token: string;
}

export class Contact {
  amigoId: string;
  name: string;
  handle: string;
  registry: string;
  revision: number;
  logoSet: boolean;
  location: string;
  description: string;
  notes: string;
  errorFlag: boolean;
  appAttribute: any;
  appSubject: any;
  appData: any;
  blocked: boolean;
}

export class Storage {

  private db: SQLite.SQLiteDatabase;

  constructor() {
    SQLite.DEBUG(false);
    SQLite.enablePromise(true);
  }


 
  // set setup database
  public async init(path: string): Promise<any> {
    this.db = await SQLite.openDatabase({ name: path, location: "default" });
    await this.db.executeSql("CREATE TABLE IF NOT EXISTS app (key text, value text, unique(key));");
    await this.db.executeSql("INSERT OR IGNORE INTO app (key, value) values ('context', null);");
  }



  // initialize account
  public async setAccount(id: string): Promise<void> {
    await this.db.executeSql("CREATE TABLE IF NOT EXISTS _account_" + id + " (key text, value text null, unique(key))");
    await this.db.executeSql("CREATE TABLE IF NOT EXISTS group_" + id + " (label_id text, revision integer, name text, unique(label_id));");
    await this.db.executeSql("CREATE TABLE IF NOT EXISTS index_" + id + " (amigo_id text unique, revision integer, node text, registry text, name text, handle text, location text, description text, logo_flag integer, identity_revision, attribute_revision integer, subject_revision integer, update_timestamp integer, connection_error integer, registry_error integer, hide integer, app_identity text, app_attribute text, app_subject text, app_data text, notes text, searchable text, blocked integer, unique(amigo_id));");
    await this.db.executeSql("CREATE TABLE IF NOT EXISTS indexgroup_" + id + " (label_id text, amigo_id text);");
    await this.db.executeSql("CREATE TABLE IF NOT EXISTS pending_" + id + " (share_id text unique, revision integer, amigo text, updated integer, app_share text);");
    await this.db.executeSql("CREATE TABLE IF NOT EXISTS profile_" + id + " (attribute_id text, revision integer, schema text, data text, unique(attribute_id));");
    await this.db.executeSql("CREATE TABLE IF NOT EXISTS profilegroup_" + id + " (label_id text, attribute_id text);");
    await this.db.executeSql("CREATE TABLE IF NOT EXISTS show_" + id + " (subject_id text, revision integer, tag_revision integer, created integer, modified integer, expires integer, schema text, data text, tags text, tag_count integer, share integer, ready integer, assets text, originals text, app_subject text, searchable text, unique(subject_id));");
    await this.db.executeSql("CREATE TABLE IF NOT EXISTS showgroup_" + id + " (label_id text, subject_id text, subject text);");
    await this.db.executeSql("CREATE TABLE IF NOT EXISTS share_" + id + " (amigo_id text, share_id text, revision integer, status text, token text, updated integer, app_share text, unique(amigo_id), unique(share_id));");
    await this.db.executeSql("CREATE TABLE IF NOT EXISTS contact_" + id + " (amigo_id text, attribute_id text, revision integer, schema text, data text, unique(amigo_id, attribute_id));");
    await this.db.executeSql("CREATE TABLE IF NOT EXISTS view_" + id + " (amigo_id text, subject_id text, revision integer, tag_revision integer, created integer, modified integer, expires integer, schema text, data text, tags text, tag_count integer, hide integer, app_subject text, searchable text, unique(amigo_id, subject_id));");

    await this.db.executeSql("CREATE TABLE IF NOT EXISTS dialogue_" + id + " (amigo_id text, dialogue_id text, modified integer, created integer, active integer, linked integer, synced integer, revision integer, insight integer, insight_revision integer, app_data text, blurb_data text, offsync integer);");
    await this.db.executeSql("CREATE TABLE IF NOT EXISTS topic_" + id + " (amigo_id text, dialogue_id text, insight integer, topic_id text, position integer, revision integer, blurbs text);");
  }


  // app object storage
  private async getAccountObject(id: string, configId: string): Promise<any> {
    res = await this.db.executeSql("SELECT * FROM _account_" + id + " WHERE key=?;", [configId]);
    if(res === undefined || res[0] === undefined || res[0].rows === undefined || res[0].rows.length == 0) {
      return null;
    }
    try {
      val = decodeObject(res[0].rows.item(0).value);
      return val;
    }
    catch(err) {
      console.log(err);
      return null;
    }
  }
  private async setAccountObject(id: string, configId: string, value: any): Promise<void> {
    await this.db.executeSql("INSERT OR REPLACE INTO _account_" + id + " (key, value) VALUES (?, ?);", [configId, encodeObject(value)]);
  }
  private async clearAccountObject(id: string, configId: string): Promise<void> {
    await this.db.executeSql("DELETE from _account_" + id + " WHERE key=?;", [configId]);
  }



  // app context methods
  public async getAppContext(): Promise<any> {
    res = await this.db.executeSql("SELECT * FROM app WHERE key='context';");
    if(res === undefined || res[0] === undefined || res[0].rows === undefined || res[0].rows.length == 0) {
      return null;
    }
    ctx = decodeObject(res[0].rows.item(0).value); 
    return ctx;
  }
  public async setAppContext(ctx: any): Promise<void> {
    let res = await this.db.executeSql("UPDATE app SET value=? WHERE key='context';", [encodeObject(ctx)]);
  }
  public async clearAppContext(): Promise<void> {
    let res = await this.db.executeSql("UPDATE app SET value=null WHERE key='context';");
  }



  // group module synchronization
  public async getLabelViews(id: string): Promise<LabelView[]> {
    let res = await this.db.executeSql("SELECT label_id, revision from group_" + id + ";");
    let views: LabelView[] = [];
    if(hasResult(res)) {
      for(let i = 0; i < res[0].rows.length; i++) {
        views.push({ labelId: res[0].rows.item(i).label_id, revision: res[0].rows.item(i).revision});
      }
    }
    return views;
  }
  public async addLabel(id: string, entry: LabelEntry): Promise<void> {
    await this.db.executeSql("INSERT INTO group_" + id + " (label_id, revision, name) values (?, ?, ?);", [entry.labelId, entry.revision, entry.name]);
  }
  public async updateLabel(id: string, entry: LabelEntry): Promise<void> {
    await this.db.executeSql("UPDATE group_" + id + " set name=?, revision=? where label_id=?;", [entry.name, entry.revision, entry.labelId]);
  }
  public async removeLabel(id: string, labelId: string): Promise<void> {
    await this.db.executeSql("DELETE FROM group_" + id + " where label_id=?;", [labelId]);
  }



  // index module synchronization
  public async getAmigoViews(id: string): Promise<AmigoView[]> {
    let res = await this.db.executeSql("SELECT amigo_id, revision from index_" + id + ";");
    let views: AmigoView[] = [];
    if(hasResult(res)) {
      for(let i = 0; i < res[0].rows.length; i++) {
        views.push({ amigoId: res[0].rows.item(i).amigo_id, revision: res[0].rows.item(i).revision});
      }
    }
    return views;
  }
  public async addAmigo(id: string, amigo: Amigo, revision: number, notes: string): Promise<void> {
    await this.db.executeSql("INSERT INTO index_" + id + " (amigo_id, identity_revision, node, registry, name, handle, location, logo_flag, description, revision, notes, blocked) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);", [amigo.amigoId, amigo.revision, amigo.node, amigo.registry, amigo.name, amigo.handle, amigo.location, amigo.logo != null, amigo.description, revision, notes]);
  }
  public async updateAmigo(id: string, amigoId: string, revision: number, notes: string): Promise<void> {
    await this.db.executeSql("UPDATE index_" + id + " set notes=?, revision=? where amigo_id=?;", [notes, revision, amigoId]);
  }
  public async updateAmigoIdentity(id: string, amigo: Amigo): Promise<void> {
    await this.db.executeSql("UPDATE index_" + id + " set node=?, registry=?, name=?, handle=?, location=?, logo_flag=?, description=?, revision=? WHERE amigo_id=?;", [amigo.node, amigo.registry, amigo.name, amigo.handle, amigo.location, amigo.logo != null, amigo.description, amigo.revision, amigo.amigoId]);
  }
  public async removeAmigo(id: string, amigoId: string): Promise<void> {
    await this.db.executeSql("DELETE FROM index_" + id + " where amigo_id=?;", [amigoId]);
  }
  public async setAmigoLabel(id: string, amigoId: string, labelId: string) {
    await this.db.executeSql("INSERT INTO indexgroup_" + id + " (amigo_id, label_id) values (?, ?);", [amigoId, labelId]);
  }
  public async clearAmigoLabels(id: string, amigoId: string) {
    await this.db.executeSql("DELETE FROM indexgroup_" + id + " where amigo_id=?;", [amigoId]);
  }
  public async getPendingAmigoViews(id: string): Promise<PendingAmigoView[]> {
    let res = await this.db.executeSql("SELECT share_id, revision from pending_" + id + ";");
    let views: PendingAmigoView[] = [];
    if(hasResult(res)) {
      for(let i = 0; i < res[0].rows.length; i++) {
        views.push({ shareId: res[0].rows.item(i).share_id, revision: res[0].rows.item(i).revision});
      }
    }
    return views;
  }
  public async getPendingAmigos(id: string): Promise<ContactRequest> {
    let res = await this.db.executeSql("SELECT share_id, revision, amigo from pending_" + id + ";");
    let req: ContactRequest[] = [];
    if(hasResult(res)) {
      for(let i = 0; i < res[0].rows.length; i++) {
        let item = res[0].rows.item(i);
        req.push({ shareId: item.share_id, revision: item.revision, amigo: decodeObject(item.amigo) });
      }
    }
    return req;
  }
  public async addPendingAmigo(id: string, shareId: string, revision: number, amigo: Amigo, updated: number): Promise<void> {
    await this.db.executeSql("INSERT INTO pending_" + id + " (share_id, amigo, revision, updated) values (?, ?, ?, ?);", [shareId, encodeObject(amigo), revision, updated]);
  }
  public async updatePendingAmigo(id: string, shareId: string, revision: number, amigo: Amigo): Promise<void> {
    await this.db.executeSql("UPDATE pending_" + id + " amigo=?, revision=?, updated=? where share_id=?;", [encodeObject(amigo), revision, updated, share_id]);
  }
  public async removePendingAmigo(id: string, shareId): Promise<void> {
    await this.db.executeSql("DELETE FROM pending_" + id + " WHERE share_id=?;", [shareId]);
  }



  // profile module synchronization
  public async getAttributeViews(id: string): Promise<AttributeView[]> {
    let res = await this.db.executeSql("SELECT attribute_id, revision from profile_" + id + ";");
    let views: AttributeView[] = [];
    if(hasResult(res)) {
      for(let i = 0; i < res[0].rows.length; i++) {
        views.push({ attributeId: res[0].rows.item(i).attribute_id, revision: res[0].rows.item(i).revision});
      }
    }
    return views;
  }
  public async addAttribute(id: string, attributeId: string, revision: number, schema: string, data: string): Promise<void> {
    await this.db.executeSql("INSERT INTO profile_" + id + " (attribute_id, revision, schema, data) values (?, ?, ?, ?);", [attributeId, revision, schema, data]);
  }
  public async updateAttribute(id: string, attributeId: string, revision: number, schema: string, data: string): Promise<void> {
    await this.db.executeSql("UPDATE profile_" + id + " set revision=?, schema=?, data=? where attribute_id=?;", [revision, schema, data, attributeId]);
  }
  public async removeAttribute(id: string, attributeId: string): Promise<void> {
    await this.db.executeSql("DELETE FROM profile_" + id + " where attribute_id=?;", [attributeId]);
    await this.db.executeSql("DELETE FROM profilegroup_" + id + " where attribute_id=?;", [attributeId]);
  }
  public async setAttributeLabel(id: string, attributeId: string, labelId: string) {
    await this.db.executeSql("INSERT INTO profilegroup_" + id + " (attribute_id, label_id) values (?, ?);", [attributeId, labelId]);
  }
  public async clearAttributeLabels(id: string, attributeId: string) {
    await this.db.executeSql("DELETE FROM profilegroup_" + id + " where attribute_id=?;", [attributeId]);
  }


  // show module synchronization
  public async getSubjectViews(id: string): Promise<SubjectView[]> {
    let res = await this.db.executeSql("SELECT subject_id, revision, tag_revision from show_" + id + ";");
    let views: SubjectView[] = [];
    if(hasResult(res)) {
      for(let i = 0; i < res[0].rows.length; i++) {
        views.push({ subjectId: res[0].rows.item(i).subject_id, revision: res[0].rows.item(i).revision, tagRevision: res[0].rows.item(i).tag_revision});
      }
    }
    return views;
  }
  public async getSubjects(id: string, labelId: string): Promise<SubjectRecord[]> {
    let res;
    if(labelId == null) {
      res = await this.db.executeSql("SELECT DISTINCT subject_id, revision, created, modified, expires, schema, data, share, ready, tag_count FROM show_" + id + " ORDER BY modified DESC;");
    }
    else {
      res = await this.db.executeSql("SELECT show_" + id + ".subject_id, revision, created, modified, expires, schema, data, share, ready, tag_count FROM show_" + id + " INNER JOIN showgroup_" + id + " ON show_" + id + ".subject_id = showgroup_" + id + ".subject_id WHERE showgroup_" + id + ".label_id=? ORDER BY MODIFIED DESC;", [labelId]);
    }
    let subjects: SubjectRecord[] = [];
    if(hasResult(res)) {
      for(let i = 0; i < res[0].rows.length; i++) {
        let item = res[0].rows.item(i);
        subjects.push({ subjectId: item.subject_id, revision: item.revision, created: item.created, modified: item.modified, expires: item.expires, schema: item.schema, data: item.data, share: item.share != 0, ready: item.ready != 0, tagCount: item.tag_count, blocked: item.hide });
      }
    }
    return subjects;
  }
  public async getSubject(id: string, subjectId: string): Promise<SubjectRecord> {
    let res = await this.db.executeSql("SELECT subject_id, revision, created, modified, expires, schema, data, share, ready, tag_count FROM show_" + id + " WHERE subject_id=?;", [subjectId]);
    if(hasResult(res)) {
      let item = res[0].rows.item(0);
      return { subjectId: item.subject_id, revision: item.revision, created: item.created, modified: item.modified, expires: item.expires, schema: item.schema, data: item.data, share: item.share != 0, ready: item.ready != 0, tagCount: item.tag_count, blocked: item.hide };
    }
    return null;
  }
  public async getSubjectLabels(id: string, subjectId: string): Promise<string[]> {
    let res = await this.db.executeSql("SELECT label_id FROM showgroup_" + id + " WHERE subject_id=?;", [subjectId]);
    let labels: string[] =[];
    if(hasResult(res)) {
      for(let i = 0; i < res[0].rows.length; i++) {
        labels.push(res[0].rows.item(i).label_id);
      }
    }
    return labels;
  }
  public async getSubjectTags(id: string, subjectId: string): Promise<Tag[]> {
    let res = await this.db.executeSql("SELECT tags FROM show_" + id + " WHERE subject_id=?;", [subjectId]);
    if(hasResult(res)) {
      if(res[0].rows.item(0).tags == null) {
        return [];
      }
      return decodeObject(res[0].rows.item(0).tags);
    }
    return [];
  }
  public async addSubject(id: string, subject: Subject, ready: boolean, share: boolean) {
    await this.db.executeSql("INSERT INTO show_" + id + " (subject_id, revision, created, modified, expires, schema, data, share, ready, tag_revision, tag_count) values (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0);", [subject.subjectId, subject.revision, subject.created, subject.modified, subject.expires, subject.schema, subject.data, share, ready]);
  } 
  public async updateSubject(id: string, subject: Subject, ready: boolean, share: boolean) {
    await this.db.executeSql("UPDATE show_" + id + " set revision=?, created=?, modified=?, expires=?, ready=?, share=?, schema=?, data=? where subject_id=?;", [subject.revision, subject.created, subject.modified, subject.expires, ready, share, subject.schema, subject.data, subject.subjectId]);
  }
  public async removeSubject(id: string, subjectId: string) {
    await this.db.executeSql("DELETE FROM show_" + id + " where subject_id=?;", [subjectId]);
    await this.db.executeSql("DELETE FROM showgroup_" + id + " where subject_id=?;", [subjectId]);
  }
  public async setSubjectLabel(id: string, subjectId: string, labelId: string) {
    await this.db.executeSql("INSERT INTO showgroup_" + id + " (subject_id, label_id) values (?, ?);", [subjectId, labelId]);
  }
  public async clearSubjectLabels(id: string, subjectId: string) {
    await this.db.executeSql("DELETE FROM showgroup_" + id + " where subject_id=?;", [subjectId]);
  }
  public async updateSubjectTags(id: string, subjectId: string, revision: number, tags: Tag[]) {
    let count: number = 0;
    if(tags == null) {
      count = 0;
    }
    else {
      count = tags.length;
    }
    await this.db.executeSql("UPDATE show_" + id + " set tag_revision=?, tag_count=?, tags=? where subject_id=?;", [revision, count, encodeObject(tags), subjectId]);
  }

  // share module synchronization
  public async getConnectionViews(id: string): Promise<ShareView[]> {
    let cmd: string = "select share_id, revision from share_" + id;

    let res = await this.db.executeSql("SELECT share_id, revision from share_" + id + ";");
    let views: SubjectView[] = [];
    if(hasResult(res)) {
      for(let i = 0; i < res[0].rows.length; i++) {
        views.push({ shareId: res[0].rows.item(i).share_id, revision: res[0].rows.item(i).revision});
      }
    }
    return views;
  }
  public async addConnection(id: string, entry: ShareEntry) { 
    await this.db.executeSql("INSERT INTO share_" + id + " (amigo_id, share_id, revision, status, token, updated) values (?, ?, ?, ?, ?, ?);", [entry.amigoId, entry.shareId, entry.revision, entry.status, entry.token, entry.updated]);
  }
  public async updateConnection(id: string, entry: ShareEntry) {
    await this.db.executeSql("UPDATE share_" + id + " set amigo_id=?, revision=?, status=?, token=?, updated=? where share_id=?;", [entry.amigoId, entry.revision, entry.status, entry.token, entry.updated, entry.shareId]);
  }
  public async removeConnection(id: string, shareId: string) {
    await this.db.executeSql("DELETE FROM share_" + id + " WHERE share_id=?;", [shareId]);
  }

  // get connection token
  public async getAmigoPath(id: string, amigoId: string): Promise<AmigoPath> {
    let res = await this.db.executeSql("SELECT node, registry, token from index_" + id + " left outer join share_" + id + " on index_" + id + ".amigo_id = share_" + id + ".amigo_id where index_" + id + ".amigo_id=? AND status=?;", [amigoId, 'connected']);
    if(hasResult(res)) {
      return { node: res[0].rows.item(0).node, registry: res[0].rows.item(0).registry, token: res[0].rows.item(0).token };
    }
    return null;
  }

  // get stale connection to update
  public async getStaleAmigoConnections(id: string): Promise<AmigoConnection[]> {
    let res = await this.db.executeSql("SELECT index_" + id + ".amigo_id, node, registry, index_" + id + ".identity_revision, attribute_revision, subject_revision, connection_error, token from index_" + id + " left outer join share_" + id + " on index_" + id + ".amigo_id = share_" + id + ".amigo_id where status = 'connected' and update_timestamp is null");
    let connections: AmigoConnection[] = [];
    if(hasResult(res)) {
      let a = res[0].rows.item(0);
      connections.push({ amigoId: a.amigo_id, node: a.node, registry: a.registry, token: a.token, identityRevision: a.identity_revision, attributeRevision: a.attribute_revision, subjectRevision: a.subject_revision, connectionError: a.connection_error!=0 });
    }
    return connections;
  }
  public async getStaleAmigoConnection(id: string, stale: number): Promise<AmigoConnection> {
    let res = await this.db.executeSql("SELECT index_" + id + ".amigo_id, node, registry, index_" + id + ".identity_revision, attribute_revision, subject_revision, connection_error, token from index_" + id + " left outer join share_" + id + " on index_" + id + ".amigo_id = share_" + id + ".amigo_id where status = 'connected' and (update_timestamp is null or update_timestamp < ?) order by update_timestamp ASC LIMIT 1", [stale]);
    if(hasResult(res)) {
      let a = res[0].rows.item(0);
      return { amigoId: a.amigo_id, node: a.node, registry: a.registry, token: a.token, identityRevision: a.identity_revision, attributeRevision: a.attribute_revision, subjectRevision: a.subject_revision, connectionError: a.connection_error!=0 };
    }
    return null;
  }
  public async getStaleAmigoReference(id: string, stale: number): Promise<AmigoReference> {
    let res = await this.db.executeSql("SELECT index_" + id + ".amigo_id, node, registry, registry_error, index_" + id + ".identity_revision from index_" + id + " left outer join share_" + id + " on index_" + id + ".amigo_id = share_" + id + ".amigo_id where (status is null or status != 'connected') and (update_timestamp is null or update_timestamp < ?) order by update_timestamp ASC LIMIT 1", [stale]);
    if(hasResult(res)) {
      let a = res[0].rows.item(0);
      return { amigoId: a.amigo_id, node: a.node, registry: a.registry, identityRevision: a.identity_revision, registryError: a.registry_error!=0 };
    }
    return null;
  }
  public async updateStaleTime(id: string, amigoId: string, stale: number): Promise<void> {
    let res = await this.db.executeSql("UPDATE index_" + id + " set update_timestamp=? WHERE amigo_id=?;", [stale, amigoId]);
  }
  public async updateAmigoConnectionError(id: string, amigoId: string, error: boolean): Promise<void> {
    await this.db.executeSql("UPDATE index_" + id + " set connection_error=? WHERE amigo_id=?;", [error ? 1 : 0, amigoId]);
  }
  public async updateAmigoRegistryError(id: string, amigoId: string, error: boolean): Promise<void> {
    await this.db.executeSql("UPDATE index_" + id + " set registry_error=? WHERE amigo_id=?;", [status, amigoId]);
  }
  public async updateConnectionAttributeRevision(id: string, amigoId: string, revision: number): Promise<void> {
    await this.db.executeSql("UPDATE index_" + id + " set attribute_revision=? WHERE amigo_id=?;", [revision, amigoId]);
  }
  public async updateConnectionSubjectRevision(id: string, amigoId: string, revision: number): Promise<void> {
    await this.db.executeSql("UPDATE index_" + id + " set subject_revision=? WHERE amigo_id=?;", [revision, amigoId]);
  }


  public async getConnectionAttributeView(id: string, amigoId: string): Promise<AttributeView[]> {
    let res = await this.db.executeSql("SELECT attribute_id, revision FROM contact_" + id + " WHERE amigo_id=?;", [amigoId]);
    let views: AttributeView[] = [];
    if(hasResult(res)) {
      for(let i = 0; i < res[0].rows.length; i++) {
        views.push({ attributeId: res[0].rows.item(i).attribute_id, revision: res[0].rows.item(i).revision});
      }
    }
    return views;
  }
  public async addConnectionAttribute(id: string, amigoId: string, attribute: Attribute): Promise<void> {
    await this.db.executeSql("INSERT INTO contact_" + id + " (amigo_id, attribute_id, revision, schema, data) values (?, ?, ?, ?, ?);", [amigoId, attribute.attributeId, attribute.revision, attribute.schema, attribute.data]);
  }
  public async updateConnectionAttribute(id: string, amigoId: string, attribute: Attribute): Promise<void> {
    await this.db.executeSql("UPDATE contact_" + id + " revision=?, schema=?, data=? WHERE amigo_id=? AND attribute_id=?;", [attribute.revision, attribute.schema, attribute.data, amigoId, attribute.attributeId]);
  }
  public async removeConnectionAttribute(id: string, amigoId: string, attributeId: string): Promise<void> {
    await this.db.executeSql("DELETE FROM contact_" + id + " WHERE amigo_id=? AND attribute_id=?", [amigoId, attributeId]);
  }  


  public async getConnectionSubjectView(id: string, amigoId: string): Promise<SubjectView[]> {
    let res = await this.db.executeSql("SELECT subject_id, revision, tag_revision FROM view_" + id + " WHERE amigo_id=?;", [amigoId]);
    let views: SubjectView[] = [];
    if(hasResult(res)) {
      for(let i = 0; i < res[0].rows.length; i++) {
        views.push({ subjectId: res[0].rows.item(i).subject_id, revision: res[0].rows.item(i).revision, tagRevision: res[0].rows.item(i).tag_revision});
      }
    }
    return views;
  }
  public async getConnectionSubjects(id: string, amigoId: string): Promise<SubjectItem[]> {
    let res = await this.db.executeSql("SELECT amigo_id, subject_id, revision, created, modified, expires, schema, data, tag_count, hide FROM view_" + id + " WHERE amigo_id=? and hide=? ORDER BY modified DESC;", [amigoId, 0]);
    let subjects: SubjectItem[] = [];
    if(hasResult(res)) {
      for(let i = 0; i < res[0].rows.length; i++) {
        let item = res[0].rows.item(i);
        subjects.push({ amigoId: item.amigo_id, subjectId: item.subject_id, revision: item.revision, created: item.created, modified: item.modified, expires: item.expires, schema: item.schema, data: item.data, tagCount: item.tag_count, blocked: item.hide });
      }
    }
    return subjects;
  }
  public async getConnectionSubjectTags(id: string, amigoId: string, subjectId: string): Promise<Tag[]> {
    let res = await this.db.executeSql("SELECT tags FROM view_" + id + " WHERE amigo_id=? AND subject_id=?;", [amigoId, subjectId]);
    if(hasResult(res)) {
      if(res[0].rows.item(0).tags == null) {
        return [];
      }
      return decodeObject(res[0].rows.item(0).tags);
    }
    return [];
  }
  public async addConnectionSubject(id: string, amigoId: string, subject: Subject): Promise<void> {
    await this.db.executeSql("INSERT INTO view_" + id + " (amigo_id, subject_id, revision, created, modified, expires, schema, data, hide, tag_revision, tag_count) values (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0);", [amigoId, subject.subjectId, subject.revision, subject.created, subject.modified, subject.expires, subject.schema, subject.data]);
  }
  public async updateConnectionSubject(id: string, amigoId: string, subject: Subject): Promise<void> {
    await this.db.executeSql("UPDATE view_" + id + " set revision=?, created=?, modified=?, expires=?, schema=?, data=? where amigo_id=? and subject_id=?;", [subject.revision, subject.created, subject.modified, subject.expires, subject.schema, subject.data, amigoId, subject.subjectId]);
  }
  public async removeConnectionSubject(id: string, amigoId: string, subjectId: string): Promise<void> {
    await this.db.executeSql("DELETE FROM view_" + id + " where amigo_id=? and subject_id=?;", [amigoId, subjectId]);
  }
  public async updateConnectionSubjectTags(id: string, amigoId: string, subjectId: string, revision: number, tags: Tag[]) {
    let count: number;
    if(tags == null) {
      count = 0;
    }
    else {
      count = tags.length;
    }
    await this.db.executeSql("UPDATE view_" + id + " SET tag_revision=?, tag_count=?, tags=? WHERE amigo_id=? and subject_id=?;", [revision, count, encodeObject(tags), amigoId, subjectId]);
  }
  public async getBlockedSubjects(id: string): Promise<SubjectItem[]> {
    let res = await this.db.executeSql("SELECT DISTINCT amigo_id, subject_id, revision, created, modified, expires, schema, data, tag_count, hide FROM view_" + id + " WHERE hide!=? ORDER BY modified DESC;", [0]);
    let subjects: SubjectItem[] = [];
    if(hasResult(res)) {
      for(let i = 0; i < res[0].rows.length; i++) {
        let item = res[0].rows.item(i);
        subjects.push({ amigoId: item.amigo_id, subjectId: item.subject_id, revision: item.revision, created: item.created, modified: item.modified, expires: item.expires, schema: item.schema, data: item.data, tagCount: item.tag_count, blocked: item.hide!=0 });
      }
    }
    return subjects;
  }
  public async setBlockedSubject(id: string, amigoId: string, subjectId: string, block: boolean): Promise<void> {
    await this.db.executeSql("UPDATE view_" + id + " SET hide = ? WHERE amigo_id=? AND  subject_id=?;", [ block ? 1 : 0, amigoId, subjectId]);
  }


  // conversation module synchronization
  public async getInsightViews(id: string): Promise<InsightView[]> {
    let res = await this.db.executeSql("SELECT amigo_id, dialogue_id, insight_revision from dialogue_" + id + " WHERE insight!=?;", [0]);
    let views: InsightView[] = [];
    if(hasResult(res)) {
      for(let i = 0; i < res[0].rows.length; i++) {
        views.push({ amigoId: res[0].rows.item(i).amigo_id, dialogueId: res[0].rows.item(i).dialogue_id, revision: res[0].rows.item(i).insight_revision });
      }
    }
    return views;
  }
  public async addInsight(id: string, amigoId: string, dialogueId: string): Promise<void> {
    await this.db.executeSql("INSERT INTO dialogue_" + id + " (amigo_id, dialogue_id, insight) values (?, ?, ?);", [amigoId, dialogueId, 1]);
  }
  public async updateInsight(id: string, amigoId: string, dialogue: Dialogue): Promise<void> {
    await this.db.executeSql("UPDATE dialogue_" + id + " SET modified=?, created=?, active=?, linked=?, synced=?, revision=?, offsync=? WHERE amigo_id=? AND dialogue_id=? AND insight!=?;", [dialogue.modified, dialogue.created, dialogue.active, dialogue.linked, dialogue.synced, dialogue.revision, 0, amigoId, dialogue.dialogueId, 0]);
  }
  public async updateInsightRevision(id: string, amigoId: string, dialogueId: string, revision: number, offsync: boolean): Promise<void> {
    let s = offsync ? 1 : 0;
    await this.db.executeSql("UPDATE dialogue_" + id + " SET insight_revision=?, offsync=? WHERE amigo_id=? AND dialogue_id=? AND insight!=?;", [revision, s, amigoId, dialogueId, 0]);
  }
  public async setConversationOffsync(id: string, amigoId: string, dialogueId: string, hosting: boolean): Promise<void> {
    if(hosting) {
      await this.db.executeSql("UPDATE dialogue_" + id + " SET offsync=? WHERE dialogue_id=? AND insight=?;", [1, dialogueId, 0]);
    }
    else {
      await this.db.executeSql("UPDATE dialogue_" + id + " SET offsync=? WHERE amigo_id=? AND dialogue_id=? AND insight!=?;", [1, amigoId, dialogueId, 0]);
    }
  }
  public async removeInsight(id: string, amigoId: string, dialogueId: string): Promise<void> {
    await this.db.executeSql("DELETE FROM topic_" + id + " WHERE amigo_id=? AND dialogue_id=? AND insight!=?;", [amigoId, dialogueId, 0]);
    await this.db.executeSql("DELETE FROM dialogue_" + id + " WHERE amigo_id=? AND dialogue_id=? AND insight!=?;", [amigoId, dialogueId, 0]);
  }
  public async getInsightTopicViews(id: string, amigoId: string, dialogueId: string): Promise<TopicView[]> {
    let res = await this.db.executeSql("SELECT topic_id, position, revision FROM topic_" + id + " WHERE amigo_id=? AND dialogue_id=? AND insight!=? ORDER BY position ASC;", [amigoId, dialogueId, 0]);
    let views: TopicView[] = [];
    if(hasResult(res)) {
      for(let i = 0; i < res[0].rows.length; i++) {
        views.push({ topicId: res[0].rows.item(i).topic_id, position: res[0].rows.item(0).position, revision: res[0].rows.item(i).revision });
      }
    }
    return views;
  }
  public async addInsightTopic(id: string, amigoId: string, dialogueId: string, topic: Topic, position: number): Promise<void> {
    await this.db.executeSql("INSERT INTO topic_" + id + " (amigo_id, dialogue_id, insight, topic_id, position, revision, blurbs) values (?, ?, ?, ?, ?, ?, ?);", [amigoId, dialogueId, 1, topic.topicId, position, topic.revision, encodeObject(topic.blurbs)]);
  }
  public async updateInsightTopic(id: string, amigoId: string, dialogueId: string, topic: Topic, position: number): Promise<void> {
    await this.db.executeSql("UPDATE topic_" + id + " SET position=?, revision=?, blurbs=? WHERE amigo_id=? AND dialogue_id=? AND insight!=?;", [position, topic.revision, encodeObject(topic.blurbs), amigoId, dialogueId, 0]);
  }
  public async removeInsightTopic(id: string, amigoId: string, dialogueId: string, topicId: string): Promise<void> {
    await this.db.executeSql("DELETE FROM topic_" + id + " WHERE amigoId=? AND dialogueId=? AND topicId=? AND insight!=?", [amigoId, dialogueId, topicId, 0]);  
  }
  public async getDialogueViews(id: string): Promise<DialogueView[]> {
    let res = await this.db.executeSql("SELECT dialogue_id, revision from dialogue_" + id + " WHERE insight=?;", [0]);
    let views: DialogueView[] = [];
    if(hasResult(res)) {
      for(let i = 0; i < res[0].rows.length; i++) {
        views.push({ dialogueId: res[0].rows.item(i).dialogue_id, revision: res[0].rows.item(i).revision });
      }
    }
    return views;
  }
  public async addDialogue(id: string, dialogueId: string): Promise<void> {
    await this.db.executeSql("INSERT INTO dialogue_" + id + " (dialogue_id, insight) values (?, ?);", [dialogueId, 0]);
  }
  public async updateDialogue(id: string, dialogue: Dialogue): Promise<void> {
    await this.db.executeSql("UPDATE dialogue_" + id + " SET modified=?, created=?, active=?, linked=?, synced=?, revision=?, amigo_id=? WHERE dialogue_id=? AND insight=?;", [dialogue.modified, dialogue.created, dialogue.active, dialogue.linked, dialogue.synced, dialogue.revision, dialogue.amigoId, dialogue.dialogueId, 0]);
  }
  public async removeDialogue(id: string, dialogueId: string): Promise<void> {
    await this.db.executeSql("DELETE FROM topic_" + id + " WHERE dialogue_id=? and insight=?;", [dialogueId, 0]);
    await this.db.executeSql("DELETE FROM dialogue_" + id + " WHERE dialogue_id=? and insight=?;", [dialogueId, 0]);
  }
  public async getDialogueTopicViews(id: string, dialogueId: string): Promise<TopicView[]> {
    let res = await this.db.executeSql("SELECT topic_id, position, revision FROM topic_" + id + " WHERE dialogue_id=? AND insight=? ORDER BY position ASC;", [dialogueId, 0]);
    let views: TopicView[] = [];
    if(hasResult(res)) {
      for(let i = 0; i < res[0].rows.length; i++) {
        views.push({ topicId: res[0].rows.item(i).topic_id, position: res[0].rows.item(i).position, revision: res[0].rows.item(i).revision });
      }
    }
    return views;
  }
  public async addDialogueTopic(id: string, dialogueId: string, topic: Topic, position: number): Promise<void> {
    await this.db.executeSql("INSERT INTO topic_" + id + " (dialogue_id, insight, topic_id, position, revision, blurbs) values (?, ?, ?, ?, ?, ?);", [dialogueId, 0, topic.topicId, position, topic.revision, encodeObject(topic.blurbs)]);
  }
  public async updateDialogueTopic(id: string, dialogueId: string, topic: Topic, position: number): Promise<void> {
    await this.db.executeSql("UPDATE topic_" + id + " SET position=?, revision=?, blurbs=? WHERE dialogue_id=? AND insight=?;", [position, topic.revision, encodeObject(topic.blurbs), dialogueId, 0]);
  }
  public async removeDialogueTopic(id: string, dialogueId: string, topicId: string): Promise<void> {
    await this.db.executeSql("DELETE FROM topic_" + id + " WHERE dialogueId=? AND topicId=? AND insight=?", [dialogueId, topicId, 0]);
  }


  // app data access
  public async getLabels(id: string): Promise<LabelEntry[]> {
    let res = await this.db.executeSql("SELECT label_id, revision, name from group_" + id + " ORDER BY name ASC;");
    let labels: LabelEntry[] = [];
    if(hasResult(res)) {
      for(let i = 0; i < res[0].rows.length; i++) {
        labels.push({ labelId: res[0].rows.item(i).label_id, revision: res[0].rows.item(i).revision, name: res[0].rows.item(i).name});
      }
    }
    return labels;
  }
  public async getLabelCount(id: string, labelId: string): Promise<LabelCount> {
    let res = await this.db.executeSql("select count(distinct profilegroup_" + id + ".attribute_id) as profile_count, count(distinct indexgroup_" + id + ".amigo_id) as index_count, count(distinct showgroup_" + id + ".subject_id) as show_count from group_" + id + " left outer join showgroup_" + id + " on showgroup_" + id + ".label_id = group_" + id + ".label_id left outer join indexgroup_" + id + " on indexgroup_" + id + ".label_id = group_" + id + ".label_id left outer join profilegroup_" + id + " on profilegroup_" + id + ".label_id = group_" + id + ".label_id where group_" + id + ".label_id=?", [labelId]);
    if(hasResult(res)) {
      for(let i = 0; i < res[0].rows.length; i++) {
        let item = res[0].rows.item(i);
        return { contact: item.index_count, attribute: item.profile_count, story: item.show_count };
      }
    }
    return { contact: 0, attribute: 0, show: 0 };
  }

  public async getAttributes(id: string, labelId: string): Promise<Attribute[]> {
    let res;
    if(labelId == null) {
      res = await this.db.executeSql("SELECT attribute_id, revision, schema, data FROM profile_" + id);
    }
    else {
      res = await this.db.executeSql("SELECT profile_" + id + ".attribute_id, revision, schema, data FROM profile_" + id + " LEFT OUTER JOIN profilegroup_" + id + " ON profile_" + id + ".attribute_id = profilegroup_" + id + ".attribute_id WHERE profilegroup_" + id + ".label_id=?;", [labelId]);
    }
    let attributes: Attribute[] = [];
    if(hasResult(res)) {
      for(let i = 0; i < res[0].rows.length; i++) {
        let a = res[0].rows.item(i);
        attributes.push({ attributeId: a.attribute_id, revision: a.revision, schema: a.schema, data: a.data });
      }
    }
    return attributes;
  }
  public async getAttributeLabels(id: string, attributeId: string): Promise<string[]> {
    let res = await this.db.executeSql("SELECT label_id FROM profilegroup_" + id + " WHERE attribute_id=?;", [attributeId]);
    let labels: string[] = [];
    if(hasResult(res)) {
      for(let i = 0; i < res[0].rows.length; i++) {
        labels.push(res[0].rows.item(i).label_id);
      }
    }
    return labels;
  }

  public async getBlockedContacts(id: string): Promise<Contact[]> {
    let res = await this.db.executeSql("SELECT DISTINCT index_" + id + ".amigo_id, name, handle, identity_revision, registry, location, description, notes, blocked, logo_flag, connection_error, status, app_attribute, app_subject, app_data from index_" + id + " left outer join share_" + id + " on index_" + id + ".amigo_id = share_" + id + ".amigo_id where blocked != ? ORDER BY name COLLATE NOCASE ASC;", [0]);
    let contacts: Contacts[] = [];
    if(hasResult(res)) {
      for(let i = 0; i < res[0].rows.length; i++) {
        let item = res[0].rows.item(i);
        contacts.push({ amigoId: item.amigo_id, name: item.name, handle: item.handle, revision: item.identity_revision, registry: item.registry, location: item.location, description: item.description, notes: item.notes, blocked: item.blocked != 0, status: item.status, logoSet: item.logo_flag != 0, errorFlag: item.connection_error!=0, appAttribute: decodeObject(item.app_attribute), appSubject: decodeObject(item.app_subject), appData: decodeObject(item.app_data) });
      }
    }
    return contacts;
  }

  public async setBlockedContact(id: string, amigoId: string, block: boolean): Promise<void> {
    await this.db.executeSql("UPDATE index_" + id + " SET blocked = ? WHERE amigo_id=?;", [ block ? 1 : 0, amigoId]);
  }

  public async getContacts(id: string, labelId: string, status: string): Promise<Contact[]> {
    let res;
    if(labelId == null && status == null) {
      res = await this.db.executeSql("SELECT DISTINCT index_" + id + ".amigo_id, name, handle, identity_revision, registry, location, description, notes, blocked, logo_flag, connection_error, status, app_attribute, app_subject, app_data from index_" + id + " left outer join share_" + id + " on index_" + id + ".amigo_id = share_" + id + ".amigo_id WHERE blocked=? ORDER BY name COLLATE NOCASE ASC;", [0]);
    }
    else if(labelId != null && status == null) {
      res = await this.db.executeSql("SELECT DISTINCT index_" + id + ".amigo_id, name, handle, identity_revision, registry, location, description, notes, blocked, logo_flag, connection_error, status, app_attribute, app_subject, app_data from index_" + id + " inner join indexgroup_" + id + " on index_" + id + ".amigo_id = indexgroup_" + id + ".amigo_id left outer join share_" + id + " on index_" + id + ".amigo_id = share_" + id + ".amigo_id WHERE indexgroup_" + id + ".label_id=? AND blocked=? ORDER BY name COLLATE NOCASE ASC;", [labelId, 0]);
    }
    else if(labelId == null && status != null) {
      res = await this.db.executeSql("SELECT DISTINCT index_" + id + ".amigo_id, name, handle, identity_revision, registry, location, description, notes, blocked, logo_flag, connection_error, status, app_attribute, app_subject, app_data from index_" + id + " left outer join share_" + id + " on index_" + id + ".amigo_id = share_" + id + ".amigo_id WHERE share_" + id + ".status=? AND blocked=? ORDER BY name COLLATE NOCASE ASC;", [status, 0]);
    }
    else if(labelId != null && status != null) {
      res = await this.db.executeSql("SELECT DISTINCT index_" + id + ".amigo_id, name, handle, identity_revision, registry, location, description, notes, blocked, logo_flag, connection_error, status, app_attribute, app_subject, app_data from index_" + id + " inner join indexgroup_" + id + " on index_" + id + ".amigo_id = indexgroup_" + id + ".amigo_id left outer join share_" + id + " on index_" + id + ".amigo_id = share_" + id + ".amigo_id WHERE indexgroup_" + id + ".label_id=? AND share_" + id + ".status=? AND blocked=? ORDER BY name COLLATE NOCASE ASC;", [labelId, status, 0]);
    }
    let contacts: Contacts[] = [];
    if(hasResult(res)) {
      for(let i = 0; i < res[0].rows.length; i++) {
        let item = res[0].rows.item(i);
        contacts.push({ amigoId: item.amigo_id, name: item.name, handle: item.handle, revision: item.identity_revision, registry: item.registry, location: item.location, description: item.description, notes: item.notes, blocked: item.blocked != 0, status: item.status, logoSet: item.logo_flag != 0, errorFlag: item.connection_error!=0, appAttribute: decodeObject(item.app_attribute), appSubject: decodeObject(item.app_subject), appData: decodeObject(item.app_data) });
      }
    }
    return contacts;
  }
  public async getContact(id: string, amigoId: string): Promise<Contact> {
    let res = await this.db.executeSql("SELECT index_" + id + ".amigo_id, name, handle, identity_revision, registry, location, description, notes, blocked, logo_flag, connection_error, status, app_attribute, app_subject, app_data from index_" + id + " left outer join share_" + id + " on index_" + id + ".amigo_id = share_" + id + ".amigo_id WHERE index_" + id + ".amigo_id=?;", [amigoId]);
    if(hasResult(res)) {
      for(let i = 0; i < res[0].rows.length; i++) {
        let item = res[0].rows.item(i);
        return { amigoId: item.amigo_id, name: item.name, handle: item.handle, revision: item.identity_revision, registry: item.registry, location: item.location, description: item.description, notes: item.notes, blocked: item.blocked != 0, status: item.status, logoSet: item.logo_flag != 0, errorFlag: item.connection_error!=0, appAttribute: decodeObject(item.app_attribute), appSubject: decodeObject(item.app_subject), appData: decodeObject(item.app_data) };
      }
    }
    return null; 
  }
  public async getContactAttributes(id: string, amigoId: string): Promise<Attribute[]> {
    let res = await this.db.executeSql("SELECT attribute_id, revision, schema, data FROM contact_" + id + " WHERE amigo_id=?;", [amigoId]);
    let attributes: Attribute[] = [];
    if(hasResult(res)) {
      for(let i = 0; i < res[0].rows.length; i++) {
        let item = res[0].rows.item(i);
        attributes.push({ attributeId: item.attribute_id, revision: item.revision, schema: item.schema, data: item.data });
      }
    }
    return attributes;
  }
  public async getContactLabels(id: string, amigoId: string): Promise<string[]> {
    let res = await this.db.executeSql("SELECT label_id FROM indexgroup_" + id + " WHERE amigo_id=?;", [amigoId]);
    let labels: string[] = [];
    if(hasResult(res)) {
      for(let i = 0; i < res[0].rows.length; i++) {
        labels.push(res[0].rows.item(i).label_id);
      }
    }
    return labels;
  }

  public async setContactAttributeData(id: string, amigoId: string, obj: any): Promise<void> {
    await this.db.executeSql("UPDATE index_" + id + " SET app_attribute=? WHERE amigo_id=?;", [encodeObject(obj), amigoId]);
  }
  public async setContactSubjectData(id: string, amigoId: string, obj: any): Promise<void> {
    await this.db.executeSql("UPDATE index_" + id + " SET app_subject=? WHERE amigo_id=?;", [encodeObject(obj), amigoId]);
  }
  public async setContactAppData(id: string, amigoId: string, obj: any): Promise<void> {
    await this.db.executeSql("UPDATE index_" + id + " SET app_data=? WHERE amigo_id=?;", [encodeObject(obj), amigoId]);
  }

  public async getContactShareId(id: string, amigoId: string): Promsie<string> {
    let res = await this.db.executeSql("SELECT share_id from share_" + id + " WHERE amigo_id=?;", [amigoId]);
    if(hasResult(res)) {
      return res[0].rows.item(0).share_id;
    }
    return null;
  }

  public async getContactNode(id: string, amigoId: string): Promsie<string> {
    let res = await this.db.executeSql("SELECT node from index_" + id + " WHERE amigo_id=?;", [amigoId]);
    if(hasResult(res)) {
      return res[0].rows.item(0).node;
    }
    return null;
  }

  public async getAmigoConnection(id: string, amigoId: string): Promise<AmigoConnection> {
    let res = await this.db.executeSql("SELECT index_" + id + ".amigo_id, node, registry, index_" + id + ".identity_revision, attribute_revision, subject_revision, connection_error, token from index_" + id + " left outer join share_" + id + " on index_" + id + ".amigo_id = share_" + id + ".amigo_id where status=? and index_" + id + ".amigo_id=?;", ['connected', amigoId]);
    if(hasResult(res)) {
      let a = res[0].rows.item(0);
      return { amigoId: a.amigo_id, node: a.node, registry: a.registry, token: a.token, identityRevision: a.identity_revision, attributeRevision: a.attribute_revision, subjectRevision: a.subject_revision, connectionError: a.connection_error!=0 };
    }
    return null;
  }

  public async getConversations(id: string, labelId: string): Promise<Conversation[]> {
    let res;
    if(labelId == null) {
      res = await this.db.executeSql("SELECT DISTINCT name, handle, logo_flag, index_" + id + ".revision, dialogue_" + id + ".amigo_id, status, dialogue_id, dialogue_" + id + ".app_data, blurb_data, linked, synced, active, offsync, insight, modified FROM dialogue_" + id + " LEFT OUTER JOIN index_" + id + " ON dialogue_" + id + ".amigo_id = index_" + id + ".amigo_id LEFT OUTER JOIN share_" + id + " ON dialogue_" + id + ".amigo_id = share_" + id + ".amigo_id ORDER BY modified DESC");
    }
    else {
      res = await this.db.executeSql("SELECT DISTINCT name, handle, logo_flag, index_" + id + ".revision, dialogue_" + id + ".amigo_id, status, dialogue_id, dialogue_" + id + ".app_data, blurb_data, linked, synced, active, offsync, insight, modified FROM dialogue_" + id + " LEFT OUTER JOIN index_" + id + " ON dialogue_" + id + ".amigo_id = index_" + id + ".amigo_id LEFT OUTER JOIN share_" + id + " ON dialogue_" + id + ".amigo_id = share_" + id + ".amigo_id LEFT OUTER JOIN indexgroup_" + id + " ON dialogue_" + id + ".amigo_id = indexgroup_" + id + ".amigo_id WHERE label_id=? ORDER BY modified DESC", [labelId]);
    }
    let conversations = [];
    if(hasResult(res)) {
      for(let i = 0; i < res[0].rows.length; i++) {
        let item = res[0].rows.item(i);
        let appData = null;
        if(item.app_data != null) {
          appData = decodeObject(item.app_data);
        }
        let blurbData = null;
        if(item.blurb_data != null) {
          blurbData = decodeObject(item.blurb_data);
        }
        conversations.push({ amigoId: item.amigo_id, imageUrl: item.logo_flag ? "" : null, revision: item.revision, handle: item.handle, name: item.name, dialogueId: item.dialogue_id, modified: item.modified, connected: item.status == 'connected', active: item.active, linked: item.linked != 0, synced: item.synced != 0, hosting: item.insight==0, offsync: item.offsync, appData: appData, blurbData: blurbData });
      }
    }
    return conversations;
  }

  public async getTopicViews(id: string, amigoId: string, dialogueId: string, hosting: boolean): Promise<TopicView[]> {
    let res;
    if(hosting) {
      res = await this.db.executeSql("SELECT DISTINCT topic_id, position, revision from topic_" + id + " WHERE dialogue_id=? AND insight=? ORDER BY position DESC", [dialogueId, 0]);
    }
    else {
      res = await this.db.executeSql("SELECT DISTINCT topic_id, position, revision from topic_" + id + " WHERE amigo_id=? AND dialogue_id=? AND insight=? ORDER BY position DESC", [amigoId, dialogueId, 1]);
    }
    let views = [];
    if(hasResult) {
      for(let i = 0; i < res[0].rows.length; i++) {
        let item = res[0].rows.item(i);
        views.push({ topicId: item.topic_id, position: item.position, revision: item.revision });
      }
    }
    return views;
  }
  
  public async getTopicBlurbs(id: string, amigoId: string, dialogueId: string, hosting: boolean, topicId: string): Promise<Blurb[]> {
    let res;
    if(hosting) {
      res = await this.db.executeSql("SELECT blurbs from topic_" + id + " WHERE dialogue_id=? AND insight=? AND topic_id=?;", [dialogueId, 0, topicId]);
    }
    else {
      res = await this.db.executeSql("SELECT blurbs from topic_" + id + " WHERE amigo_id=? AND dialogue_id=? AND insight=? AND topic_id=?;", [amigoId, dialogueId, 1, topicId]);
    }
    if(hasResult) {
      let item = res[0].rows.item(0);
      if(item.blurbs != null) {
        return decodeObject(item.blurbs);
      }
    }
    return [];
  }

  public async setConversationAppData(id: string, amigoId: string, dialogueId: string, hosting: boolean, obj: any): Promise<void> {
    if(hosting) {
      await this.db.executeSql("UPDATE dialogue_" + id + " SET app_data=? WHERE dialogue_id=? AND insight=?;", [encodeObject(obj), dialogueId, 0]);
    }
    else {
      await this.db.executeSql("UPDATE dialogue_" + id + " SET app_data=? WHERE amigo_id=? AND dialogue_id=? AND insight=?;", [encodeObject(obj), amigoId, dialogueId, 1]);
    }
  }

  public async setConversationBlurbData(id: string, amigoId: string, dialogueId: string, hosting: boolean, obj: any): Promise<void> {
    if(hosting) {
      await this.db.executeSql("UPDATE dialogue_" + id + " SET blurb_data=? WHERE dialogue_id=? AND insight=?;", [encodeObject(obj), dialogueId, 0]);
    }
    else {
      await this.db.executeSql("UPDATE dialogue_" + id + " SET blurb_data=? WHERE amigo_id=? AND dialogue_id=? AND insight=?;", [encodeObject(obj), amigoId, dialogueId, 1]);
    }
  }

}

