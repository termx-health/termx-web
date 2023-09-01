import {Designation, MapSetAssociation} from 'term-web/resources/_lib';

export class MapSetConcept {
  public code?: string;
  public codeSystem?: string;
  public codeSystemUri?: string;
  public display?: Designation;
  public associations?: MapSetAssociation[];
}
