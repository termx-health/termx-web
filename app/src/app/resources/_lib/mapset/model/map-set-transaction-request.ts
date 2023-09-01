import {MapSet} from './map-set';
import {MapSetVersion} from './map-set-version';
import {MapSetAssociation} from './map-set-association';

export class MapSetTransactionRequest {
  public mapSet: MapSet;
  public version?: MapSetVersion;

  public associations?: MapSetAssociation[];
}
