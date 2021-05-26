import SQLite from "react-native-sqlite-storage";
import { Alert, AppState, AppStateStatus } from "react-native";

export interface Database {
  get(): Promise<number[]>;
  add(value: number): Promise<void>;
  clear(): Promise<void>;
}

let databaseInstance: SQLite.SQLiteDatabase | undefined;

async setTables(database: SQLite.SQLiteDatabase): Promise<void> {
  return database.transaction(this.createTables);
}

async createTables(transaction: SQLite.Transaction) {
  transaction.executeSql(`
    CREATE TABLE IF NOT EXISTS num (
      val INTEGER PRIMARY KEY NOT NULL
    );
  `);
}

async function add(v: number): Promise<void> {
  return getDatabase()
    .then((db) => db.executeSql("INSERT INTO num (val) VALUES (?);", [v]))
      .then(([results]) => {
        console.log("inserted");
      }).catch(err => {
        Alert.alert("failed2");
      });
}

async function get(): Promise<number[]> {
  return getDatabase()
    .then((db) => db.executeSql("SELECT val FROM num;"))
      .then(([results]) => {
        if(results === undefined) {
          return [];
        }
        const nums: number[] = [];
        const count = results.rows.length;

        for(let i = 0; i < count; i++) {
          const row = results.rows.item(i);
          nums.push( row.val );
        }
        return nums;
      }).catch(err => {
        Alert.alert("failed1");
      });
}

async function clear(): Promise<void> {
  return getDatabase()
    .then((db) => db.executeSql("DELETE FROM num;"))
      .then(([results]) => {
        console.log("cleared");
      });
}

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (databaseInstance !== undefined) {
    return Promise.resolve(databaseInstance);
  }
  return open();
}

async function open(): Promise<SQLite.SQLiteDatabase> {
  SQLite.DEBUG(true);
  SQLite.enablePromise(true);

  if (databaseInstance) {
    return databaseInstance;
  }

  const db = await SQLite.openDatabase({
    name: "AppDatabase.db",
    location: "default",
  });

  await setTables(db);

  databaseInstance = db;
  return db;
}

async function close(): Promise<void> {
  
  if (databaseInstance === undefined) {
    return;
  }
  const status = await databaseInstance.close();
  databaseInstance = undefined;
}

let appState = "active";
AppState.addEventListener("change", handleAppStateChange);

function handleAppStateChange(nextAppState: AppStateStatus) {
  if (appState === "active" && nextAppState.match(/inactive|background/)) {
    close();
  }
  appState = nextAppState;
}

export const storage: Database = { get, add, clear };
