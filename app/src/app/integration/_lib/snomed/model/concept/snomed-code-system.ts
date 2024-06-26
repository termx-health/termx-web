export class SnomedCodeSystem {
  public name?: string;
  public shortName?: string;
  public branchPath?: string;
  public countryCode?: string;
  public dependantVersionEffectiveTime?: string;
  public dailyBuildAvailable?: boolean;
  public languages?: {[key:string]: string};
  public latestVersion?: SnomedCodeSystemVersion;
  public modules?: SnomedCodeSystemModule[];

  public versions?: SnomedCodeSystemVersion[];
}

export class SnomedCodeSystemVersion {
  public shortName?: string;
  public importDate?: Date;
  public dependantVersionEffectiveTime: string;
  public parentBranchPath?: string;
  public version?: string;
  public effectiveDate?: number;
  public description?: string;
  public branchPath?: string;
}

export class SnomedCodeSystemModule {
  public conceptId?: string;
  public moduleId?: string;
  public pt?: {term?: string, lang?: string};
  public fsn?: {term?: string, lang?: string};
}
