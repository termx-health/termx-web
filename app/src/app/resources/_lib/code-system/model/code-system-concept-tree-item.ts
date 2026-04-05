import {CodeSystemConcept} from 'term-web/resources/_lib/code-system/model/code-system-concept';

export class CodeSystemConceptTreeItem extends CodeSystemConcept {
  public parentCode?: string;
  public matched?: boolean;
}
