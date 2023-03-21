export class SnomedDescriptionSearchParams {
  public term?: string;
  public active?: Boolean;
  public module?: string[];
  public language?: string;
  public semanticTag?: string;
  public semanticTags?: string[];
  public conceptActive?: Boolean;
  public groupByConcept?: Boolean;

  public rootId?: string;
}
