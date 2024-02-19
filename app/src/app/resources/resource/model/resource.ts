import {LocalizedName} from '@kodality-web/marina-util';

export class Resource {
  public id?: string;
  public uri?: string;
  public name?: string;
  public otherTitle?: {name?: string, preferred?: boolean}[];
  public title?: LocalizedName;
  public publisher?: string;
  public description?: LocalizedName;
  public purpose?: LocalizedName;
  public topic?: {text?: string, tags?: string[]};
  public useContext?: {type?: string, value?: string}[];
  public experimental?: boolean;
  public sourceReference?: string;
  public replaces?: string;
}
