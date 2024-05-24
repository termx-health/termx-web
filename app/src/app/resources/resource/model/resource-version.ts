import {Identifier} from '@kodality-web/core-util';
import {LocalizedName} from '@kodality-web/marina-util';

export class ResourceVersion {
  public id?: number;
  public status?: string;
  public version?: string;
  public algorithm?: string;
  public releaseDate?: Date | string;
  public expirationDate?: Date | string;
  public description?: LocalizedName;
  public preferredLanguage?: string;
  public identifiers?: Identifier[];
}
