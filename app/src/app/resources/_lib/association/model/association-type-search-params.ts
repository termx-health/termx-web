import {QueryParams} from '@kodality-web/core-util';

export class AssociationTypeSearchParams extends QueryParams {
  public code?: string;
  public codeContains?: string;
  public associationKinds?: string;
}
