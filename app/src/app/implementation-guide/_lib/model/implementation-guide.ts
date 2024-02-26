import {Identifier} from '@kodality-web/core-util';
import {LocalizedName} from '@kodality-web/marina-util';
import {ContactDetail} from 'term-web/resources/_lib';

export class ImplementationGuide {
  public id?: string;
  public uri?: string;
  public publisher?: string;
  public name?: string;
  public title?: LocalizedName;
  public otherTitle?: {name?: string, preferred?: boolean}[];
  public description?: LocalizedName;
  public purpose?: LocalizedName;
  public topic?: {text?: string};
  public useContext?: {type?: string, value?: string}[];
  public licence?: string;
  public experimental?: boolean;
  public sourceReference?: string;
  public identifiers?: Identifier[];
  public contacts?: ContactDetail[];
  public copyright?: {holder?: string, jurisdiction?: string, statement?: string};
}
