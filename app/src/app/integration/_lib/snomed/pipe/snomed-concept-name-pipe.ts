import {Pipe, PipeTransform} from '@angular/core';
import {EMPTY, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {SnomedUtil} from '../util/snomed-util';
import {SnomedLibService} from '../services/snomed-lib.service';
import {SnomedConcept} from '../model/concept/snomed-concept';

@Pipe({
  name: 'snomedConceptName'
})
export class SnomedConceptNamePipe implements PipeTransform {

  public constructor(private snomedService: SnomedLibService) {}

  public transform(concept: string | SnomedConcept, type: 'pt' | 'fsn' = 'pt', branch?: string): Observable<string> {
    if (!concept) {
      return EMPTY;
    }
    return (typeof concept === 'string' ? this.snomedService.loadConcept(concept, branch) : of(concept)).pipe(map(c => SnomedUtil.formatConcept(c, type)));
  }
}
