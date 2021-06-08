import SQLite from "react-native-sqlite-storage";
import { Alert, AppState, AppStateStatus } from "react-native";
import base64 from 'react-native-base64'
import { LabelEntry, LabelView } from './DiatumTypes';

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
    await this.db.executeSql("CREATE TABLE IF NOT EXISTS index_" + id + " (amigo_id text unique, revision integer, node text, registry text, name text, handle text, amigo text, identity_revision, attribute_revision integer, subject_revision integer, update_timestamp integer, amigo_error integer, attribute_error integer, subject_error integer, hide integer, app_identity text, app_attribute text, app_subject text, notes text, searchable text, unique(amigo_id));");
    await this.db.executeSql("CREATE TABLE IF NOT EXISTS indexgroup_" + id + " (label_id text, amigo_id text, unique (label_id, amigo_id));");
    await this.db.executeSql("CREATE TABLE IF NOT EXISTS pending_" + id + " (share_id text unique, revision integer, message text, updated integer, app_share text);");
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
    await this.db.executeSql("INSERT OR IGNORE INTO group_" + id + " (label_id, revision, name) values (?, ?, ?);", [entry.labelId, entry.revision, encodeText(entry.name)]);
  }
  public async updateLabel(id: string, entry: LabelEntry): Promise<void> {
    await this.db.executeSql("UPDATE group_" + id + " set name=?, revision=? where label_id=?;", [this.encodeText(entry.name), entry.revision, entry.labelId]);
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
  public async addAmigo(id: string, amigoId: string, revision: number, notes: string): Promise<void> {
console.log("ADD AMIGO: " + amigoId);
    await this.db.executeSql("INSERT OR IGNORE INTO index_" + id + " (amigo_id, revision, notes) values (?, ?, ?);", [amigoId, revision, encodeText(notes)]);
  }
  public async updateAmigo(id: string, amigoId: string, revision: number, notes: string): Promise<void> {
    await this.db.executeSql("UPDATE index_" + id + " set notes=?, revision=? where amigo_id=?;", [this.encodeText(otes), revision, amigoId]);
  }
  public async removeAmigo(id: string, amigoId: string): Promise<void> {
    await this.db.executeSql("DELETE FROM index_" + id + " where amigo_id=?;", [amigoId]);
  }
  public async setAmigoLabel(id: string, amigoId: string, labelId: string) {
    await this.db.executeSql("INSERT OR IGNORE INTO indexgroup_" + id + " (amigo_id, label_id) values (?, ?);", [amigoId, labelId]);
  }
  public async clearAmigoLabels(id: string, amigoId: string) {
    await this.db.executeSql("DELETE FROM indexgroup_" + id + " where amigo_id=?;", [amigoId]);
  }
}

