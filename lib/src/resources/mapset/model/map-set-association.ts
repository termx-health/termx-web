import {CodeSystemEntityVersion} from '../../codesystem';
import {MapSetEntity} from './map-set-entity';

export class MapSetAssociation extends MapSetEntity {
  public source?: CodeSystemEntityVersion;
  public target?: CodeSystemEntityVersion;
  public associationType?: string;
  public status?: string;
}