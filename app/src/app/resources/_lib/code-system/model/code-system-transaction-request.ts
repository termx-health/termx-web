import {CodeSystem} from './code-system';
import {CodeSystemVersion} from './code-system-version';
import {ValueSetTransactionRequest} from '../../value-set';
import {EntityProperty} from './entity-property';


export class CodeSystemTransactionRequest {
  public codeSystem?: CodeSystem;
  public version?: CodeSystemVersion;
  public properties?: EntityProperty[];
  public valueSet?: ValueSetTransactionRequest;
}
