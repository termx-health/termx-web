import {MapSetProperty} from 'term-web/resources/_lib';
import {MapSet} from './map-set';
import {MapSetAssociation} from './map-set-association';
import {MapSetVersion} from './map-set-version';

export class MapSetTransactionRequest {
  public mapSet: MapSet;
  public version?: MapSetVersion;
  public properties?: MapSetProperty[];

  public associations?: MapSetAssociation[];
}
