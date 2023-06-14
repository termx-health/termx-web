import {LocalizedName} from '@kodality-web/marina-util';
import {ValueSetVersion} from './value-set-version';
import {ContactDetail} from '../../contact';
import {Identifier} from '@kodality-web/core-util';

export class ValueSet {
  public id?: string;
  public uri?: string;
  public publisher?: string;
  public title?: LocalizedName;
  public name?: LocalizedName;
  public description?: LocalizedName;
  public purpose?: LocalizedName;
  public narrative?: string;
  public experimental?: boolean;
  public identifiers?: Identifier[];
  public contacts?: ContactDetail[];

  public versions?: ValueSetVersion[];

  public copyright?: {holder?: string, jurisdiction?: string, statement?: string};
  public permissions?: {admin?: any, editor?: any, viewer?: any};
}
