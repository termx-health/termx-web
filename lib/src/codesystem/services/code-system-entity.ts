import {Designation} from './designation';
import {CodeSystemAssociation} from './code-system-association';
import {EntityPropertyValue} from './entity-property';

export abstract class CodeSystemEntity {
  public id?: number;
  public type?: string;
  public codeSystem?: string;
  public versions?: CodeSystemEntityVersion[];
}

export class CodeSystemEntityVersion {
  public id?: number;
  public code?: string;
  public description?: string;
  public status?: string;
  public created?: Date;

  public propertyValues?: EntityPropertyValue[];
  public designations?: Designation[];
  public associations?:  CodeSystemAssociation[];
}