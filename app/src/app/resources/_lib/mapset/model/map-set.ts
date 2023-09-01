import {LocalizedName} from '@kodality-web/marina-util';
import {MapSetVersion} from './map-set-version';
import {Identifier} from '@kodality-web/core-util';
import {ContactDetail} from 'term-web/resources/_lib';

export class MapSet {
  public id?: string;
  public uri?: string;
  public name?: string;
  public title?: LocalizedName;
  public publisher?: string;
  public description?: LocalizedName;
  public purpose?: LocalizedName;
  public experimental?: boolean;
  public narrative?: string;
  public identifiers?: Identifier[];
  public contacts?: ContactDetail[];

  public copyright?: {holder?: string, jurisdiction?: string, statement?: string};
  public settings?: {reviewRequired?: boolean, approvalRequired?: boolean};

  public versions?: MapSetVersion[];
}
