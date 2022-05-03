import {CodeSystemEntityVersion} from './code-system-entity';

export class CodeSystemVersion {
  public id?: number;
  public codeSystem?: string;
  public version?: string;
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