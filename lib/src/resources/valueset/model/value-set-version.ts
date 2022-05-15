import {Concept} from '../../concept';
import {Designation} from '../../designation';

export class ValueSetVersion {
  public id?: number;
  public valueSet?: string;
  public version?: string;
  public supportedLanguages?: string[];
  public description?: string;
  public status?: string;
  public releaseDate?: Date;
  public expirationDate?: Date;
  public created?: Date;

  public concepts?: Concept[];
  public designations?: Designation[];
}
