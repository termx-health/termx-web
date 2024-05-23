import {Identifier} from '@kodality-web/core-util';
import {LocalizedName} from '@kodality-web/marina-util';

export class MapSetVersion {
  public id?: number;
  public version?: string;
  public status?: string;
  public mapSet?: string;
  public preferredLanguage?: string;
  public description?: LocalizedName;
  public releaseDate?: Date | string;
  public expirationDate?: Date | string;
  public created?: Date;
  public algorithm?: string;
  public identifiers?: Identifier[];

  public scope?: MapSetScope;
  public statistics?: MapSetStatistics;
}

export class MapSetScope {
  public sourceType?: 'code-system' | 'value-set' | 'external-canonical-uri';
  public sourceValueSet?: MapSetResourceReference;
  public sourceCodeSystems?: MapSetResourceReference[];

  public targetType?: 'code-system' | 'value-set' | 'external-canonical-uri';
  public targetValueSet?: MapSetResourceReference;
  public targetCodeSystems?: MapSetResourceReference[];
}

export class MapSetResourceReference {
  public id?: string;
  public version?: string;
  public uri?: string;
}

export class MapSetStatistics {
  public createdAt?: Date;
  public createdBy?: string;

  public sourceConcepts?: number;
  public equivalent?: number;
  public noMap?: number;
  public narrower?: number;
  public broader?: number;
  public unmapped?: number;
  public inactiveSources?: number;
  public inactiveTargets?: number;
}
