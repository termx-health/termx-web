import {ValueSet} from './value-set';
import {ValueSetVersion} from './value-set-version';
import {Identifier} from '@kodality-web/core-util';


export class ValueSetTransactionRequest {
  public valueSet?: ValueSet;
  public version?: ValueSetVersion;
  public identifiers?: Identifier[];
}
