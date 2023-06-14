import {CodeSystemEntityVersion} from './code-system-entity';

export class CodeSystemVersionReference {
  public id?: number;
  public version?: string;
}

export class CodeSystemVersion extends CodeSystemVersionReference{
  public codeSystem?: string;
  public source?: string;
  public preferredLanguage?: string;
  public supportedLanguages?: string[];
  public description?: string;
  public status?: string;
  public type?: string;
  public releaseDate?: Date;
  public expirationDate?: Date;
  public created?: Date;

  public entities?: CodeSystemEntityVersion[];
}
