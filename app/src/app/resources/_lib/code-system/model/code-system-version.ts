import {Identifier} from '@termx-health/core-util';
import {LocalizedName} from '@termx-health/util';
import {ValueSetVersionReference} from 'term-web/resources/_lib';
import {CodeSystemEntityVersion} from 'term-web/resources/_lib/code-system/model/code-system-entity';

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
  /**
   * How this version's concept hierarchy is written in its FHIR resource: 'nested' — the export
   * termx had before the concept list was flattened, restored unchanged — or 'flat'. Undefined
   * leaves it to the server, which derives one that is both lossless and valid for the data at
   * hand: nested for a tree, flat where a concept has several parents and nesting would repeat
   * codes. Only changeable while the version is a draft.
   */
  public hierarchyShape?: string;
  public identifiers?: Identifier[];

  public conceptsTotal?: number;

  public valueSet?: ValueSetVersionReference;

  public baseCodeSystem?: string;
  public baseCodeSystemVersion?: CodeSystemVersionReference;

  public entities?: CodeSystemEntityVersion[];
}
