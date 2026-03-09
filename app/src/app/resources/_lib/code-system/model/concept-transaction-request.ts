import {CodeSystemConcept} from 'term-web/resources/_lib/code-system/model/code-system-concept';
import {CodeSystemEntityVersion} from 'term-web/resources/_lib/code-system/model/code-system-entity';


export class ConceptTransactionRequest {
  public concept?: CodeSystemConcept;
  public entityVersion?: CodeSystemEntityVersion;
}
