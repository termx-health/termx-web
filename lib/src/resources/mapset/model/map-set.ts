import {LocalizedName} from '@kodality-health/marina-util';
import {MapSetVersion} from './map-set-version';
import {MapSetAssociation} from './map-set-association';

export class MapSet {
  public id?: string;
  public uri?: string;
  public names?: LocalizedName;
  public description?: string;
  public sourceValueSet?: string;
  public targetValueSet?: string;

  public versions?: MapSetVersion[];
  public associations?: MapSetAssociation[];
}
