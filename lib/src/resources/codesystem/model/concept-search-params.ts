import {QueryParams} from '@kodality-web/core-util';

export class ConceptSearchParams extends QueryParams {
  public code?: string;
  public codeContains?: string;
  public textContains?: string;
  public codeSystem?: string;
  public codeSystemUri?: string;
  public codeSystemVersion?: string;
  public codeSystemVersionId?: number;
  public codeSystemVersionReleaseDateLe?: Date;
  public codeSystemVersionReleaseDateGe?: Date;
  public codeSystemVersionExpirationDateLe?: Date;
  public codeSystemVersionExpirationDateGe?: Date;
  public codeSystemEntityStatus?: string;
  public valueSet?: string;
  public valueSetVersion?: string;
  public propertyValues?: string;
  public propertyValuesPartial?: string;
  public propertyRoot?: string;
  public associationRoot?: string;
  public propertySource?: string; // property|sourceCode
  public associationSource?: string; // association|sourceCode
  public associationType?: string;
}

