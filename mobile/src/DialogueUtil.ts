
export class DialogueUtil {

  public static BLURB: string = '98ea6e4f216f2fb4b69fff9b3a44842c38686ca685f3f55dc48c5d3fb1107be4';

  public static getSchemas(): string[] {
    return [ DialogueUtil.BLURB ];
  }

  public static isMessage(t: any): boolean {
    if(t == null) {
      return false;
    }
    if(t.schema == DialogueUtil.BLURB) {
      return true;
    }
    return false;
  }

}
