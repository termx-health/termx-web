export class Sequence {
  public id?: number;
  public code?: string;
  public description?: string;
  public pattern?: string;
  public restart?: string;
  public startFrom?: string;
  public luvs?: SequenceLuv[];
}

export class SequenceLuv {
  public luv?: string;
  public period?: Date;
}
