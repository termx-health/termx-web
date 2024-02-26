import {Identifier} from '@kodality-web/core-util';
import {LocalizedName} from '@kodality-web/marina-util';
import {CodeSystemEntityVersion} from './code-system-entity';

export class CodeSystemVersionReference {
  public id?: number;
  public version?: string;
  public status?: string;
  public releaseDate?: Date;
}

export class CodeSystemVersion extends CodeSystemVersionReference {
  public codeSystem?: string;
  public preferredLanguage?: string;
  public supportedLanguages?: string[];
  public description?: LocalizedName;
  // public releaseDate?: Date;
  public expirationDate?: Date;
  public created?: Date;
  public algorithm?: string;
  public identifiers?: Identifier[];

  public conceptsTotal?: number;

  public entities?: CodeSystemEntityVersion[];
}
