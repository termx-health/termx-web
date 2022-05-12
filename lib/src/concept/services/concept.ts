import {CodeSystemEntity} from '../../codesystem/services/code-system-entity';

export class Concept extends CodeSystemEntity{
  public code?: string;
  public description?: string;
}