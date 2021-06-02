import SQLite from "react-native-sqlite-storage";
import { Alert, AppState, AppStateStatus } from "react-native";
import base64 from 'react-native-base64'

// helper funtions
function decodeText(s: string): any {
  if(s == null) {
    return null;
  }
  return base64.decode(s);
}
function encodeText(o: string): string {
  if(o == null) {
    return "null";
  }
  return "'" + base64.encode(o) + "'";
}
function decodeObject(s: string): any {
  if(s == null) {
    return null;
  }
  return JSON.parse(base64.decode(s));
}
function encodeObject(o: any): string {
  if(o == null) {
    return "null";
  }
  return base64.encode(JSON.stringify(o));
}

export class Storage {

  private db: SQLite.SQLiteDatabase;

  constructor() {
    SQLite.DEBUG(true);
    SQLite.enablePromise(true);
  }
 
  // set setup database
  public async init(path: string): Promise<any> {
    this.db = await SQLite.openDatabase({ name: "path", location: "default" });
    await this.setTables();
  }
  private async setTables(): Promise<void> {
    await this.db.executeSql("CREATE TABLE IF NOT EXISTS app (key text, value text, unique(key));");
    await this.db.executeSql("INSERT OR IGNORE INTO app (key, value) values ('context', null);");
  }

  // app context methods
  public async getAppContext(): Promise<any> {
    res = await this.db.executeSql("SELECT * FROM app WHERE key='context';");
    if(res === undefined || res[0] === undefined || res[0].rows === undefined) {
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

}

