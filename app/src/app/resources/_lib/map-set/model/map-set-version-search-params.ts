import {QueryParams} from '@termx-health/core-util';

export class MapSetVersionSearchParams extends QueryParams {
  public mapSet?: string;
  public ids?: string;
  public version?: string;
  public status?: string;
  public releaseDateLe?: Date;
  public expirationDateGe?: Date;
}
