
export class SubjectUtil {

  public static VIDEO: string = 'e245d8cc676a79055aac13a2d0aa9a3eb3f673765556070dc0bd131510e60e40';
  public static PHOTO: string = '6cf626f1b2222b128dc39dceabdfce7073ea961d97f34fe20fd30ef02b7bf8dd';

  public static getSchemas(): string[] {
    return [ SubjectUtil.PHOTO, SubjectUtil.VIDEO ];
  }

  public static isPhoto(s: any): boolean {
    if(s == null) {
      return false;
    }
    if(s.schema == SubjectUtil.PHOTO) {
      return true;
    }
    return false;
  }

  public static isVideo(s: any): boolean {
    if(s == null) {
      return false;
    }
    if(s.schema == SubjectUtil.VIDEO) {
      return true;
    }
    return false;
  }
}
