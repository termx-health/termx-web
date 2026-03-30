import {QueryParams} from '@termx-health/core-util';

export class SnomedRefsetSearchParams extends QueryParams{
  public referenceSet?: string;
  public active?: boolean;
  public referencedComponentId?: string;
  public targetComponent?: string;
  public mapTarget?: string;

  public branch?: string;
}
