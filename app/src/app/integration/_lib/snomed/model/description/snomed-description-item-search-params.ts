export class SnomedDescriptionItemSearchParams {
  public term?: string;
  public active?: boolean;
  public module?: string[];
  public language?: string;
  public semanticTag?: string;
  public semanticTags?: string[];
  public conceptActive?: boolean;
  public groupByConcept?: boolean;

  public rootId?: string;

  public branch?: string;
}
