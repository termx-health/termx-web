import {MapSetEntityVersion} from './map-set-entity-version';

export class MapSetVersion {
  public id?: number;
  public mapSet?: string;
  public version?: string;
  public source?: string;
  public supportedLanguages?: string[];
  public description?: string;
  public status?: string;
  public releaseDate?: Date;
  public expirationDate?: Date;
  public created?: Date;

  public entities?: MapSetEntityVersion[];
}