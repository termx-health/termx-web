import {ValueSetVersionConcept, ValueSetVersionReference} from 'term-web/resources/_lib';

export class ValueSetSnapshot {
  public id?: number;
  public valueSet?: string;
  public valueSetVersion?: ValueSetVersionReference;
  public conceptsTotal?: number;
  public expansion?: ValueSetVersionConcept[];
  public createdAt?: Date;
  public createdBy?: string;
}
