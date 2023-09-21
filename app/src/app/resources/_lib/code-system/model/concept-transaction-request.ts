import {CodeSystemConcept} from './code-system-concept';
import {CodeSystemEntityVersion} from './code-system-entity';


export class ConceptTransactionRequest {
  public concept?: CodeSystemConcept;
  public entityVersion?: CodeSystemEntityVersion;
}
