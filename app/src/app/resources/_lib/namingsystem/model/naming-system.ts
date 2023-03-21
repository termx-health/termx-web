import {LocalizedName} from '@kodality-web/marina-util';

export class NamingSystem {
  public id?: string;
  public names?: LocalizedName;
  public kind?: string;
  public codeSystem?: string;
  public source?: string;
  public description?: string;
  public status?: string;
  public created?: Date;

  public identifiers?: NamingSystemIdentifier[];
}

export class NamingSystemIdentifier {
  public type?: string;
  public value?: string;
  public preferred?: boolean;
}
