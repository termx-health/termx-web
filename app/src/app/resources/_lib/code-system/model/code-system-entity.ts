import {CodeSystemAssociation} from './code-system-association';
import {EntityPropertyValue} from './entity-property';
import {Designation} from '../../designation';
import {CodeSystemVersionReference} from 'term-web/resources/_lib';

export abstract class CodeSystemEntity {
  public id?: number;
  public type?: string;
  public codeSystem?: string;
  public versions?: CodeSystemEntityVersion[];
}

export class CodeSystemEntityVersion {
  public id?: number;
  public code?: string;
  public codeSystem?: string;
  public description?: string;
  public status?: string;
  public created?: Date;

  public propertyValues?: EntityPropertyValue[];
  public designations?: Designation[];
  public associations?:  CodeSystemAssociation[];

  public versions?: CodeSystemVersionReference[];
}
