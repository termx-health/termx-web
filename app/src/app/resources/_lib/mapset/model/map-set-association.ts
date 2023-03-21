import {MapSetEntity} from './map-set-entity';
import {CodeSystemEntityVersion} from '../../codesystem';

export class MapSetAssociation extends MapSetEntity {
  public source?: CodeSystemEntityVersion;
  public target?: CodeSystemEntityVersion;
  public associationType?: string;
  public status?: string;
}
