import {LocalizedName} from '@kodality-web/marina-util';

export class ResourceVersion {
  public status?: string;
  public version?: string;
  public algorithm?: string;
  public from?: Date;
  public to?: Date;
  public description?: LocalizedName;
  public preferredLanguage?: string;
}
