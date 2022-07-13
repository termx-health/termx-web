import {QueryParams} from '@kodality-web/core-util';

export class ConceptSearchParams extends QueryParams {
  public code?: string;
  public codeContains?: string;
  public textContains?: string;
  public codeSystem?: string;
  public codeSystemUri?: string;
  public codeSystemVersion?: string;
  public codeSystemVersionReleaseDateLe?: Date;
  public codeSystemVersionReleaseDateGe?: Date;
  public codeSystemVersionExpirationDateLe?: Date;
  public codeSystemVersionExpirationDateGe?: Date;
  public codeSystemEntityStatus?: string;
  public valueSet?: string;
  public valueSetVersion?: string;
}

