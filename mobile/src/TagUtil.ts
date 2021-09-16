
export class TagUtil {

  public static MESSAGE: string = '19fd19cbaaf31f5d9f744af3c1c52ff770c2830ab4a636a86473991f7fe9f962';

  public static getSchemas(): string[] {
    return [ TagUtil.MESSAGE ];
  }

  public static isMessage(t: any): boolean {
    if(t == null) {
      return false;
    }
    if(t.schema == TagUtil.MESSAGE) {
      return true;
    }
    return false;
  }

}
