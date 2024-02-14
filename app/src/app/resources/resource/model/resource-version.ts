import {LocalizedName} from '@kodality-web/marina-util';
import {Identifier} from '@kodality-web/core-util';

export class ResourceVersion {
  public id?: number;
  public status?: string;
  public version?: string;
  public algorithm?: string;
  public from?: Date;
  public to?: Date;
  public description?: LocalizedName;
  public preferredLanguage?: string;
  public identifiers?: Identifier[];
}
