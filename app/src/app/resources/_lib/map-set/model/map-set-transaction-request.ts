import {MapSetProperty} from 'term-web/resources/_lib';
import {MapSet} from 'term-web/resources/_lib/map-set/model/map-set';
import {MapSetAssociation} from 'term-web/resources/_lib/map-set/model/map-set-association';
import {MapSetVersion} from 'term-web/resources/_lib/map-set/model/map-set-version';

export class MapSetTransactionRequest {
  public mapSet: MapSet;
  public version?: MapSetVersion;
  public properties?: MapSetProperty[];

  public associations?: MapSetAssociation[];
}
