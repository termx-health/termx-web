import {SnomedRefsetItem} from 'term-web/integration/_lib/snomed/model/refset/snomed-refset-item';

export class SnomedRefsetMemberSearchResult {
  public items?: SnomedRefsetItem[];
  public total?: number;
}
