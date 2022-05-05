import {CodeSystemEntity} from './code-system-entity';

export class CodeSystemAssociation extends CodeSystemEntity{
  public associationType?: string;
  public status?: string;
  public targetId?: number;
  public targetCode?: string;
}