import {Identifier} from '@kodality-web/core-util';
import {LocalizedName} from '@kodality-web/marina-util';
import {ValueSetVersionReference} from 'term-web/resources/_lib';
import {CodeSystemEntityVersion} from './code-system-entity';

export class CodeSystemVersionReference {
  public id?: number;
  public version?: string;
  public uri?: string;
  public status?: string;
  public releaseDate?: Date | string;
}

export class CodeSystemVersion extends CodeSystemVersionReference {
  public codeSystem?: string;
  public preferredLanguage?: string;
  public supportedLanguages?: string[];
  public description?: LocalizedName;
  public expirationDate?: Date | string;
  public created?: Date;
  public algorithm?: string;
  public identifiers?: Identifier[];

  public conceptsTotal?: number;

  public valueSet?: ValueSetVersionReference;

  public baseCodeSystem?: string;
  public baseCodeSystemVersion?: CodeSystemVersionReference;

  public entities?: CodeSystemEntityVersion[];
}
