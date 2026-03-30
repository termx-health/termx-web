import {Identifier} from '@termx-health/core-util';
import {LocalizedName} from '@termx-health/util';

export class StructureDefinition {
  public id?: number;
  public url?: string;
  public code?: string;
  public name?: string;
  public parent?: string;
  public publisher?: string;
  public content?: string;
  public contentType?: 'profile' | 'instance' | 'logical';
  public version?: string;
  public fhirId?: string;
  public status?: string;
  public releaseDate?: string;
  public contentFormat?: 'fsh' | 'json';

  public title?: LocalizedName;
  public description?: LocalizedName;
  public purpose?: LocalizedName;
  public copyright?: {holder?: string, jurisdiction?: string, statement?: string};
  public identifiers?: Identifier[];
  public contacts?: {name?: string, telecoms?: {system?: string, value?: string, use?: string}[]}[];
  public useContext?: {type?: string, value?: string}[];
  public hierarchyMeaning?: string;
  public experimental?: boolean;
}

export class StructureDefinitionVersion {
  public id?: number;
  public structureDefinitionId?: number;
  public version?: string;
  public fhirId?: string;
  public content?: string;
  public contentType?: string;
  public contentFormat?: string;
  public status?: string;
  public releaseDate?: string;
  public description?: LocalizedName;
}
