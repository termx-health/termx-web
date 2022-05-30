import {QueryParams} from '@kodality-web/core-util';

export class ConceptSearchParams extends QueryParams {
  public code?: string;
  public codeContains?: string;
  public codeSystem?: string;
  public codeSystemUri?: string;
  public codeSystemVersion?: string;
  public valueSet?: string;
  public valueSetVersion?: string;
}

