import {QueryParams} from '@kodality-web/core-util';

export class SnomedRefsetSearchParams extends QueryParams{
  public referenceSet?: string;
  public active?: Boolean;
  public referencedComponentId?: string;
  public targetComponent?: string;
  public mapTarget?: string;

  public branch?: string;
}
