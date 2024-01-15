export class Provenance {
  public id?: number;
  public target?: ProvenanceReference;
  public date?: Date;
  public activity?: string;
  public author?: ProvenanceReference;
  public context?: ProvenanceContext[];
  public detail?: {
    changes: {[key: string]: {left: any, right: any}},
    messages: {[key: string]: string}
  };
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
