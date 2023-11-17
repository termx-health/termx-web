import {QueryParams} from '@kodality-web/core-util';

export class ValueSetVersionSearchParams extends QueryParams {
  public valueSet?: string;
  public valueSetUri?: string;
  public ids?: string;
  public version?: string;
  public status?: string;
  public releaseDateLe?: Date;
  public expirationDateGe?: Date;
  public decorated?: boolean;
}
