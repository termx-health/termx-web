import {CodeSystemEntity} from 'term-web/resources/_lib/code-system/model/code-system-entity';

export class CodeSystemConcept extends CodeSystemEntity{
  public code?: string;
  public description?: string;

  public leaf?: boolean;
  public childCount?: number;
  public immutable?: boolean;
}
