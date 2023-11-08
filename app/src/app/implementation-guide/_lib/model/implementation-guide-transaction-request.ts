import {LocalizedName} from '@kodality-web/marina-util';
import {Identifier} from '@kodality-web/core-util';
import {ContactDetail} from '../../../resources/_lib';

export class ImplementationGuideTransactionRequest {
  public id?: string;
  public uri?: string;
  public publisher?: string;
  public name?: string;
  public title?: LocalizedName;
  public description?: LocalizedName;
  public purpose?: LocalizedName;
  public licence?: string;
  public experimental?: boolean;
  public identifiers?: Identifier[];
  public contacts?: ContactDetail[];
  public copyright?: {holder?: string, jurisdiction?: string, statement?: string};
}
