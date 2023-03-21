export class SnomedSearchResult<T> {
  public items: Array<T>;
  public total?: number;
  public limit?: number;
  public offset?: number;
}
