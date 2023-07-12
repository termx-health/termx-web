export class Provenance {
  public id?: number;
  public target?: ProvenanceReference;
  public date?: Date;
  public activity?: string;
  public author?: ProvenanceReference;
  public context?: ProvenanceContext[];
}


export class ProvenanceContext {
  public role?: string;
  public entity?: any;
}

export class ProvenanceReference {
  public type?: string;
  public id?: string;
  public display?: string;
}
