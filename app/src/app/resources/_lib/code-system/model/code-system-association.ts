import {CodeSystemEntity} from './code-system-entity';

export class CodeSystemAssociation extends CodeSystemEntity{
  public associationType?: string;
  public status?: string;
  public sourceId?: number;
  public targetId?: number;
  public orderNumber?: number;

  public sourceCode?: string;
  public targetCode?: string;

  public supplement?: boolean;
}
