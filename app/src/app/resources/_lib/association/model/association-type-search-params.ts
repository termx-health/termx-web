import {QueryParams} from '@termx-health/core-util';

export class AssociationTypeSearchParams extends QueryParams {
  public code?: string;
  public codeContains?: string;
  public associationKinds?: string;
}
