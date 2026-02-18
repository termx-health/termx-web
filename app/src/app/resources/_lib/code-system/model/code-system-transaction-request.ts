import {ValueSetTransactionRequest} from 'term-web/resources/_lib/value-set';
import {CodeSystem} from 'term-web/resources/_lib/code-system/model/code-system';
import {CodeSystemVersion} from 'term-web/resources/_lib/code-system/model/code-system-version';
import {EntityProperty} from 'term-web/resources/_lib/code-system/model/entity-property';


export class CodeSystemTransactionRequest {
  public codeSystem?: CodeSystem;
  public version?: CodeSystemVersion;
  public properties?: EntityProperty[];
  public valueSet?: ValueSetTransactionRequest;
}
