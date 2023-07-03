export class SnomedDescription {
  public id?: string;
  public effectiveTime?: string;
  public active?: boolean;
  public moduleId?: string;

  public descriptionId?: string;
  public conceptId?: string;
  public lang?: string;
  public typeId?: string;
  public term?: string;
  public caseSignificance?: string;

  public author?: string;
  public created?: Date;
  public reviewer?: string;
  public reviewed?: Date;
  public status?: string;
  public acceptabilityMap?: {[key: string]: string};

  public local?: boolean;
}
