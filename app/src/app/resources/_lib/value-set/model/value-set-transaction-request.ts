import {Identifier} from '@kodality-web/core-util';
import {ValueSet} from 'term-web/resources/_lib/value-set/model/value-set';
import {ValueSetVersion} from 'term-web/resources/_lib/value-set/model/value-set-version';


export class ValueSetTransactionRequest {
  public valueSet?: ValueSet;
  public version?: ValueSetVersion;
  public identifiers?: Identifier[];
}
