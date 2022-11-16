import {ValueSet} from './value-set';
import {ValueSetVersion} from './value-set-version';


export class ValueSetTransactionRequest {
  public valueSet?: ValueSet;
  public version?: ValueSetVersion;
}
