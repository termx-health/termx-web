import {QueryParams} from '@termx-health/core-util';

export class StructureDefinitionSearchParams extends QueryParams{
  public ids?: string;
  public code?: string;
  public textContains?: string;
  public url?: string;
  public name?: string;
  public status?: string;
  public publisher?: string;
  public spaceId?: number;
  public packageId?: number;
  public packageVersionId?: number;
}
