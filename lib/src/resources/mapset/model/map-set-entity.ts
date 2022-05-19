import {MapSetEntityVersion} from './map-set-entity-version';

export class MapSetEntity {
  public id?: number;
  public mapSet?: string;

  public versions?: MapSetEntityVersion[];
}