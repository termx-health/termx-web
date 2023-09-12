import {MapSet} from './map-set';
import {MapSetVersion} from './map-set-version';
import {MapSetAssociation} from './map-set-association';
import {MapSetProperty} from 'term-web/resources/_lib';

export class MapSetTransactionRequest {
  public mapSet: MapSet;
  public version?: MapSetVersion;
  public properties?: MapSetProperty[];

  public associations?: MapSetAssociation[];
}
