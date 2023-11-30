import {QueryParams} from '@kodality-web/core-util';

export class ConceptSearchParams extends QueryParams {
  public id?: string;
  public code?: string;
  public codeContains?: string;
  public textContains?: string;
  public textContainsSep?: string;
  public textEq?: string;
  public codeSystem?: string;
  public codeSystemUri?: string;
  public codeSystemVersion?: string;
  public codeSystemVersions?: string;
  public codeSystemVersionId?: number;
  public codeSystemVersionReleaseDateLe?: Date;
  public codeSystemVersionReleaseDateGe?: Date;
  public codeSystemVersionExpirationDateLe?: Date;
  public codeSystemVersionExpirationDateGe?: Date;
  public codeSystemEntityStatus?: string;
  public codeSystemEntityVersionId?: string;
  public properties?: string; // propertyId1|propertyId2
  public propertyValues?: string; // propertyName|value1,value2;propertyName|value1
  public propertyValuesPartial?: string;
  public propertyRoot?: string;
  public propertySource?: string; // property|sourceCode
  public associationSource?: string; // association|sourceCode
  public associationRoot?: string;
  public associationLeaf?: string;
  public associationTarget?: string;
  public associationSourceRecursive?: string;
  public associationTargetRecursive?: string;
  public associationType?: string;
  public designationCiEq?: string;
  public unmapedInMapSetVersionId?: number;
  public verifiedInMapSetVersionId?: number;
  public unverifiedInMapSetVersionId?: number;
}

