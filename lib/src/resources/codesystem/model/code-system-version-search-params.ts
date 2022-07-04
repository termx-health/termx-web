import {QueryParams} from '@kodality-web/core-util';

export class CodeSystemVersionSearchParams extends QueryParams {
  public codeSystem?: string;
  public version?: string;
  public status?: string;
  public releaseDateLe?: Date;
  public releaseDateGe?: Date;
  public expirationDateLe?: Date;
  public expirationDateGe?: Date;
}
