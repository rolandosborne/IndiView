
export class AttributeUtil {

  public static WEBSITE: string = 'b0e10c5cecaa8c451330740817e301a0cc6b22b57d0241ce3ffb20d8938dc067';
  public static CARD: string = '081272d5ec5ab6fb6d7d55d12697f6c91e66bb0db562ec059cbfc5cc2c36278b';
  public static EMAIL: string = 'da7084bf8a5187e049577d14030a8c76537e59830d224f6229548f765462c52b';
  public static PHONE: string = '6424b72bbf3b3a2e8387c03c4e9599275ab7e1b3abb515dc9e4c8f69be36003f';
  public static HOME: string = '89dd0b67823cb034b8eda59bb0a9af9a0707216830f32cd9634874c47c74a148';
  public static SOCIAL: string = '4f181fd833399f33ea483b5e9dcf22fa81b7474ff53a38a327c5f2d1e71c5eb2';

  public static getSchemas(): string[] {
    return [ AttributeUtil.WEBSITE, AttributeUtil.CARD, AttributeUtil.EMAIL, AttributeUtil.PHONE, 
        AttributeUtil.HOME, AttributeUtil.WORK, AttributeUtil.SOCIAL ];
  }

  public static isWebsite(a: any): boolean {
    if(a == null) {
      return false;
    }
    if(a.schema == AttributeUtil.WEBSITE) {
      return true;
    }
    return false;
  }

  public static isCard(a: any): boolean {
    if(a == null) {
      return false;
    }
    if(a.schema == AttributeUtil.CARD) {
      return true;
    }
    return false;
  }

  public static isEmail(a: any): boolean {
    if(a == null) {
      return false;
    }
    if(a.schema == AttributeUtil.EMAIL) {
      return true;
    }
    return false;
  }

  public static isPhone(a: any): boolean {
    if(a == null) {
      return false;
    }
    if(a.schema == AttributeUtil.PHONE) {
      return true;
    }
    return false;
  }

  public static isHome(a: any): boolean {
    if(a == null) {
      return false;
    }
    if(a.schema == AttributeUtil.HOME) {
      return true;
    }
    return false;
  }

  public static isSocial(a: any): boolean {
    if(a == null) {
      return false;
    }
    if(a.schema == AttributeUtil.SOCIAL) {
      return true;
    }
  }

  public static getDataObject(a: any): any {
    if(a == null) {
      return null;
    }
    return JSON.parse(a.data);
  }

}

