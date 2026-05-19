export class BobStorage {
  public id?: number;
  public storageType?: string;
  public container?: string;
  public path?: string;
  public filename?: string;
}

export class BobObject {
  public id?: number;
  public uuid?: string;
  public contentType?: string;
  public meta?: {[key: string]: any};
  public description?: string;
  public storage?: BobStorage;
}
