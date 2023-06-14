import {LocalizedName} from '@kodality-web/marina-util';

export class Resource {
  public id?: string;
  public uri?: string;
  public title?: LocalizedName;
  public name?: LocalizedName;
  public publisher?: string;
  public description?: LocalizedName;
  public purpose?: LocalizedName;
  public useContext?: any[];
  public experimental?: boolean;
}
