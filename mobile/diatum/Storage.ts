import SQLite from "react-native-sqlite-storage";
import { Alert, AppState, AppStateStatus } from "react-native";
import base64 from 'react-native-base64'
import { LabelEntry, LabelView, AmigoView, ShareView, PendingAmigoView, AttributeView, SubjectView, Amigo, Subject, SubjectTag } from './DiatumTypes';

// helper funtions
function decodeText(s: string): any {
  if(s == null) {
    return null;
  }
  return base64.decode(s);
}
function encodeText(o: string): string {
  if(o == null) {
    return null;
  }
  return base64.encode(o);
}
function decodeObject(s: string): any {
  if(s == null) {
    return null;
  }
  return JSON.parse(base64.decode(s));
}
function encodeObject(o: any): string {
  if(o == null) {
    return null;
  }
  return base64.encode(JSON.stringify(o));
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
  token: string;
}

export class AmigoReference {
  amigoId: string;
  node: string;
  registry: string;
  identityRevision: number;
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
    await this.db.executeSql("CREATE TABLE IF NOT EXISTS index_" + id + " (amigo_id text unique, revision integer, node text, registry text, name text, handle text, location text, description text, identity_revision, attribute_revision integer, subject_revision integer, update_timestamp integer, amigo_error integer, attribute_error integer, subject_error integer, hide integer, app_identity text, app_attribute text, app_subject text, notes text, searchable text, unique(amigo_id));");
    await this.db.executeSql("CREATE TABLE IF NOT EXISTS indexgroup_" + id + " (label_id text, amigo_id text, unique (label_id, amigo_id));");
    await this.db.executeSql("CREATE TABLE IF NOT EXISTS pending_" + id + " (share_id text unique, revision integer, amigo text, updated integer, app_share text);");
    await this.db.executeSql("CREATE TABLE IF NOT EXISTS profile_" + id + " (attribute_id text, revision integer, schema text, data text, unique(attribute_id));");
    await this.db.executeSql("CREATE TABLE IF NOT EXISTS profilegroup_" + id + " (label_id text, attribute_id text, unique (label_id, attribute_id));");
    await this.db.executeSql("CREATE TABLE IF NOT EXISTS show_" + id + " (subject_id text, revision integer, tag_revision integer, created integer, modified integer, expires integer, schema text, data text, tags text, tag_count integer, share integer, ready integer, assets text, originals text, app_subject text, searchable text, unique(subject_id));");
    await this.db.executeSql("CREATE TABLE IF NOT EXISTS showgroup_" + id + " (label_id text, subject_id text, subject text, unique (label_id, subject_id));");
    await this.db.executeSql("CREATE TABLE IF NOT EXISTS share_" + id + " (amigo_id text, share_id text, revision integer, status text, token text, updated integer, app_share text, unique(amigo_id), unique(share_id));");
    await this.db.executeSql("CREATE TABLE IF NOT EXISTS contact_" + id + " (amigo_id text, attribute_id text, revision integer, schema text, data text, unique(amigo_id, attribute_id));");
    await this.db.executeSql("CREATE TABLE IF NOT EXISTS view_" + id + " (amigo_id text, subject_id text, revision integer, tag_revision integer, created integer, modified integer, expires integer, schema text, data text, tags text, tag_count integer, hide integer, app_subject text, searchable text, unique(amigo_id, subject_id));");
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
    await this.db.executeSql("INSERT INTO group_" + id + " (label_id, revision, name) values (?, ?, ?);", [entry.labelId, entry.revision, encodeText(entry.name)]);
  }
  public async updateLabel(id: string, entry: LabelEntry): Promise<void> {
    await this.db.executeSql("UPDATE group_" + id + " set name=?, revision=? where label_id=?;", [encodeText(entry.name), entry.revision, entry.labelId]);
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
    await this.db.executeSql("INSERT INTO index_" + id + " (amigo_id, identity_revision, node, registry, name, handle, location, description, revision, notes) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", [amigo.amigoId, amigo.revision, amigo.node, amigo.registry, amigo.name, amigo.handle, amigo.location, amigo.description, revision, notes]);
  }
  public async updateAmigo(id: string, amigoId: string, revision: number, notes: string): Promise<void> {
    await this.db.executeSql("UPDATE index_" + id + " set notes=?, revision=? where amigo_id=?;", [notes, revision, amigoId]);
  }
  public async updateAmigoIdentity(id: string, amigo: Amigo): Promise<void> {
    await this.db.executeSql("UPDATE index_" + id + " set node=?, registry=?, name=?, handle=?, location=?, description=?, revision=? WHERE amigo_id=?;", [amigo.node, amigo.registry, amigo.name, amigo.handle, amigo.location, amigo.description, amigo.revision, amigo.amigoId]);
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
    await this.db.executeSql("INSERT INTO profile_" + id + " (attribute_id, revision, schema, data) values (?, ?, ?, ?);", [attributeId, revision, schema, encodeText(data)]);
  }
  public async updateAttribute(id: string, attributeId: string, revision: number, schema: string, data: string): Promise<void> {
    await this.db.executeSql("UPDATE profile_" + id + " set revision=?, schema=?, data=? where attribute_id=?;", [revision, schema, encodeText(data), attributeId]);
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
  public async addSubject(id: string, subject: Subject, ready: boolean, share: boolean) {
    await this.db.executeSql("INSERT INTO show_" + id + " (subject_id, revision, created, modified, expires, schema, data, share, ready, tag_revision, tag_count) values (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0);", [subject.subjectId, subject.revision, subject.created, subject.modified, subject.expires, subject.schema, encodeText(subject.data), share, ready]);
  } 
  public async updateSubject(id: string, subject: Subject, ready: boolean, share: boolean) {
    await this.db.executeSql("UPDATE show_" + id + " set revision=?, created=?, modified=?, expires=?, ready=?, share=?, schema=?, data=? where subject_id=?;", [subject.revision, subject.created, subject.modified, subject.expires, ready, share, subject.schema, encodeText(subject.data), subject.subjectId]);
  }
  public async removeSubject(id: string, subjectId: string) {
    await this.db.executeSql("DELETE FROM show_" + id + " where subject_id=?;", [subjectId]);
    await this.db.executeSql("DELETE FROM showlabel_" + id + " where subject_id=?;", [subjectId]);
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


  // get stale connection to update
  public async getStaleAmigoConnection(id: string, stale: number): Promise<AmigoConnection> {
    let res = await this.db.executeSql("SELECT index_" + id + ".amigo_id, node, registry, index_" + id + ".revision, attribute_revision, subject_revision, token from index_" + id + " left outer join share_" + id + " on index_" + id + ".amigo_id = share_" + id + ".amigo_id where status = 'connected' and (update_timestamp is null or update_timestamp < ?) order by update_timestamp asc", [stale]);
    if(hasResult(res)) {
      let a = res[0].rows.item(0);
      return { amigoId: a.amigo_id, node: a.node, registry: a.registry, token: a.token, identityRevision: a.revision, attributeRevision: a.attribute_revision, subjectRevision: a.subject_revision };
    }
    return null;
  }
  public async getStaleAmigoReference(id: string, stale: number): Promise<AmigoReference> {
    let res = await this.db.executeSql("SELECT index_" + id + ".amigo_id, node, registry, index_" + id + ".identity_revision from index_" + id + " left outer join share_" + id + " on index_" + id + ".amigo_id = share_" + id + ".amigo_id where status != 'connected' and (update_timestamp is null or update_timestamp < ?) order by update_timestamp asc", [stale]);
    if(hasResult(res)) {
      let a = res[0].rows.item(0);
      return { amigoId: a.amigo_id, node: a.node, registry: a.registry, identityRevision: a.identity_revision };
    }
    return null;
  }
  public async updateStaleTime(id: string, amigoId: string, stale: number): Promise<void> {
    await this.db.executeSql("UPDATE index_" + id + " set update_timestamp=? WHERE amigo_id=?;", [stale, amigoId]);
  }

  // app data access
  public async getLabels(id: string): Promise<LabelEntry[]> {
    let res = await this.db.executeSql("SELECT label_id, revision, name from group_" + id + " ORDER BY name ASC;");
    let labels: LabelEntry[] = [];
    if(hasResult(res)) {
      for(let i = 0; i < res[0].rows.length; i++) {
        labels.push({ labelId: res[0].rows.item(i).label_id, revision: res[0].rows.item(i).revision, name: decodeText(res[0].rows.item(i).name)});
      }
    }
    return labels;
  }
 
}

