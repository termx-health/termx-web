import {CodeSystemEntityVersion} from './code-system-entity';
import {LocalizedName} from '@kodality-web/marina-util';

export class CodeSystemVersionReference {
  public id?: number;
  public version?: string;
  public status?: string;
}

export class CodeSystemVersion extends CodeSystemVersionReference {
  public codeSystem?: string;
  public preferredLanguage?: string;
  public supportedLanguages?: string[];
  public description?: LocalizedName;
  public releaseDate?: Date;
  public expirationDate?: Date;
  public created?: Date;
  public algorithm?: string;

  public conceptsTotal?: number;

  public entities?: CodeSystemEntityVersion[];
}
