import {QueryParams} from '@kodality-web/core-util';

export class StructureDefinitionSearchParams extends QueryParams{
  public ids?: string;
  public code?: string;
  public textContains?: string;
}
